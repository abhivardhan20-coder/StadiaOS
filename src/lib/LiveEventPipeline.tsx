import React, { createContext, useContext, useEffect, useState } from 'react';

interface EventStatus {
  lastUpdated: number;
  status: 'active' | 'loading' | 'stale' | 'error' | 'offline';
  error?: string;
}

interface PipelineState {
  data: Record<string, unknown>;
  metadata: Record<string, EventStatus>;
  health: {
    isOnline: boolean;
    wsReady: boolean;
    activeSubscriptions: number;
    queuedMessages: number;
    droppedMessages: number;
    lastPing: number;
  };
}

export interface EventMessage {
  id: string;
  channel: string;
  payload: unknown;
  timestamp: number;
  version?: number;
}

class EventBus {
  private data: Record<string, unknown> = {};
  private metadata: Record<string, EventStatus> = {};
  private subscribers: Set<(state: PipelineState) => void> = new Set();
  private fetchers: Record<string, () => Promise<unknown>> = {};
  private pollIntervals: Record<string, number> = {};
  private pollTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  
  // Advanced features
  private offlineQueue: EventMessage[] = [];
  private processedMessageIds: Set<string> = new Set();
  private channelVersions: Record<string, number> = {};
  private ws: WebSocket | null = null;
  private wsUrl: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private maxQueueSize = 1000;
  private droppedMessages = 0;
  private rateLimitTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private rateLimitDelay = 100; // ms
  private pendingUpdates: Record<string, EventMessage> = {};
  private lastPing = 0;
  private pingTimer: ReturnType<typeof setTimeout> | null = null;
  
  private staleThreshold = 15000;
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private wsReady = false;
  private fetchingLocks: Record<string, boolean> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      let debounceTimer: ReturnType<typeof setTimeout>;
      window.addEventListener('visibilitychange', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            Object.keys(this.pollTimers).forEach(key => {
              clearTimeout(this.pollTimers[key]);
              delete this.pollTimers[key];
            });
          } else {
            this.reconnectAll();
            Object.keys(this.fetchers).forEach(key => this.scheduleNext(key));
          }
        }, 300);
      });

      // Attempt WebSocket connection if URL is provided in env, else it stays WebSocket-ready
      // using fallback polling.
      let wsEndpoint = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_WS_ENDPOINT;
      if (!wsEndpoint && typeof window !== 'undefined') {
         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
         wsEndpoint = `${protocol}//${window.location.host}`;
      }
      if (wsEndpoint) {
        this.connectWebSocket(wsEndpoint);
      }
      
      this.startHealthMonitor();
    }
  }

  private startHealthMonitor() {
    setInterval(() => {
      const now = Date.now();
      let changed = false;
      
      Object.keys(this.metadata).forEach(channel => {
        const meta = this.metadata[channel];
        if (meta && meta.status === 'active' && meta.lastUpdated && now - meta.lastUpdated > this.staleThreshold) {
          meta.status = 'stale';
          changed = true;
        }
      });
      
      if (changed) this.notify();
    }, 5000);
  }

  private connectWebSocket(url: string) {
    this.wsUrl = url;
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        this.wsReady = true;
        this.reconnectAttempts = 0;
        this.lastPing = Date.now();
        this.notify();
        this.flushOfflineQueue();
        
        // Setup ping/pong
        this.pingTimer = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'pong') {
            this.lastPing = Date.now();
            this.notify();
            return;
          }
          this.handleIncomingMessage(msg as EventMessage);
        } catch (_e) {
          console.error("Pipeline fetch error", _e);
        }
      };

      this.ws.onclose = () => {
        this.handleWsClose();
      };
      
      this.ws.onerror = () => {
        this.handleWsClose();
      };
    } catch {
      this.handleWsClose();
    }
  }

  private handleWsClose() {
    this.wsReady = false;
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.notify();
    
    // Reconnect strategy with exponential backoff
    if (this.isOnline && this.wsUrl && this.reconnectAttempts < this.maxReconnectAttempts) {
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      this.reconnectAttempts++;
      setTimeout(() => this.connectWebSocket(this.wsUrl!), timeout);
    }
    
    // Fallback to polling for active subscriptions
    this.reconnectAll();
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    if (this.wsUrl && !this.wsReady) {
      this.connectWebSocket(this.wsUrl);
    } else {
      this.reconnectAll();
    }
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.wsReady = false;
    Object.keys(this.metadata).forEach(key => {
      const meta = this.metadata[key];
      if (meta) meta.status = 'offline';
    });
    this.notify();
  };
  
  // Core message processor with deduplication, conflict resolution, timestamp validation, rate limiting
  private handleIncomingMessage(msg: EventMessage) {
    if (!msg || !msg.id || !msg.channel) return;
    
    // Message Deduplication
    if (this.processedMessageIds.has(msg.id)) {
      return;
    }
    this.processedMessageIds.add(msg.id);
    
    // Cleanup deduplication set to prevent memory leaks
    if (this.processedMessageIds.size > 5000) {
      const iterator = this.processedMessageIds.values();
      for (let i = 0; i < 1000; i++) this.processedMessageIds.delete(iterator.next().value!);
    }
    
    // Timestamp Validation & Conflict Resolution
    const currentVersion = this.channelVersions[msg.channel] || 0;
    const currentTimestamp = this.metadata[msg.channel]?.lastUpdated || 0;
    
    // If msg has version, use version for conflict resolution, else use timestamp
    if (msg.version !== undefined) {
      if (msg.version < currentVersion) return; // Stale version
      this.channelVersions[msg.channel] = msg.version;
    } else {
      if (msg.timestamp < currentTimestamp) return; // Stale timestamp
    }
    
    // Rate Limiting & Backpressure
    this.pendingUpdates[msg.channel] = msg;
    
    if (!this.rateLimitTimers[msg.channel]) {
      this.rateLimitTimers[msg.channel] = setTimeout(() => {
        this.applyPendingUpdate(msg.channel);
      }, this.rateLimitDelay);
    }
  }
  
  private applyPendingUpdate(channel: string) {
    const msg = this.pendingUpdates[channel];
    if (!msg) return;
    
    delete this.rateLimitTimers[channel];
    delete this.pendingUpdates[channel];
    
    this.data[channel] = msg.payload;
    this.metadata[channel] = {
      lastUpdated: msg.timestamp || Date.now(),
      status: 'active'
    };
    this.notify();
  }
  
  // Publish message (sends via WS or adds to offline queue)
  public publish(channel: string, payload: unknown) {
    const msg: EventMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      channel,
      payload,
      timestamp: Date.now()
    };
    
    // Optimistic local update
    this.handleIncomingMessage(msg);
    
    if (this.wsReady && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      // Offline Queue with Backpressure handling
      if (this.offlineQueue.length >= this.maxQueueSize) {
        this.offlineQueue.shift(); // Drop oldest
        this.droppedMessages++;
      }
      this.offlineQueue.push(msg);
      this.notify(); // Update health metrics
    }
  }
  
  private flushOfflineQueue() {
    if (!this.wsReady || this.ws?.readyState !== WebSocket.OPEN) return;
    
    while (this.offlineQueue.length > 0) {
      const msg = this.offlineQueue.shift();
      if (msg) {
        this.ws.send(JSON.stringify(msg));
      }
    }
    this.notify();
  }

  public subscribe(callback: (state: PipelineState) => void) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    const state = this.getState();
    this.subscribers.forEach(cb => cb(state));
  }

  public getState(): PipelineState {
    return {
      data: { ...this.data },
      metadata: { ...this.metadata },
      health: {
        isOnline: this.isOnline,
        wsReady: this.wsReady,
        activeSubscriptions: Object.keys(this.fetchers).length,
        queuedMessages: this.offlineQueue.length,
        droppedMessages: this.droppedMessages,
        lastPing: this.lastPing
      }
    };
  }

  // Selective Subscriptions using fetching functions as polling fallback
  public register(key: string, fetcher: () => Promise<unknown>, pollInterval?: number) {
    this.fetchers[key] = fetcher;
    if (pollInterval) {
      this.pollIntervals[key] = pollInterval;
    }
    
    let isInitialFetch = false;
    if (!this.data[key] && !this.fetchingLocks[key]) {
       this.metadata[key] = { lastUpdated: 0, status: 'loading' };
       isInitialFetch = true;
    }
    
    // Subscribe via WS if available
    if (this.wsReady && this.ws?.readyState === WebSocket.OPEN) {
       this.ws.send(JSON.stringify({ type: 'subscribe', channel: key }));
    }
    
    if (isInitialFetch || (!this.fetchingLocks[key] && !this.pollTimers[key])) {
      // If WS is not ready, we fallback to polling immediately
      if (!this.wsReady) {
        this.fetchData(key);
      }
    }
  }

  public unregister(key: string) {
    if (this.pollTimers[key]) {
      clearTimeout(this.pollTimers[key]);
      delete this.pollTimers[key];
    }
    
    if (this.wsReady && this.ws?.readyState === WebSocket.OPEN) {
       this.ws.send(JSON.stringify({ type: 'unsubscribe', channel: key }));
    }
    // Note: We might keep data for caching, Caching is maintained in this.data
  }

  private async fetchData(key: string) {
    // If WS is active, we don't need to poll (unless it's a specific requirement)
    if (this.wsReady) return;
    
    if (!this.isOnline || !this.fetchers[key] || this.fetchingLocks[key]) return;
    
    this.fetchingLocks[key] = true;
    try {
      const meta = this.metadata[key];
      if (meta && meta.status === 'error') {
        meta.status = 'loading';
        this.notify();
      }
      
      const result = await this.fetchers[key]();
      
      // Wrap fetched data as an incoming message for unified processing
      const msg: EventMessage = {
        id: `poll-${key}-${Date.now()}`,
        channel: key,
        payload: result,
        timestamp: Date.now()
      };
      this.handleIncomingMessage(msg);
      
    } catch (_e) {
      console.error("Pipeline fetch error", _e);
      this.metadata[key] = {
        lastUpdated: this.metadata[key]?.lastUpdated || Date.now(),
        status: 'error',
        error: _e instanceof Error ? _e.message : String(_e)
      };
      this.notify();
    } finally {
      this.fetchingLocks[key] = false;
      this.scheduleNext(key);
    }
  }

  private scheduleNext(key: string) {
    if (this.pollTimers[key]) clearTimeout(this.pollTimers[key]);
    if (this.pollIntervals[key] && this.isOnline && !this.wsReady) {
      this.pollTimers[key] = setTimeout(() => this.fetchData(key), this.pollIntervals[key]);
    }
  }

  private reconnectAll() {
    Object.keys(this.fetchers).forEach(key => this.fetchData(key));
  }

  public optimisticUpdate<T>(key: string, mutation: (prev: T) => T) {
    const newVal = mutation(this.data[key] as T);
    this.publish(key, newVal);
  }
}

export const pipelineCore = new EventBus();
const PipelineContext = createContext<PipelineState>(pipelineCore.getState());

export const PipelineProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<PipelineState>(pipelineCore.getState());

  useEffect(() => {
    const unsubscribe = pipelineCore.subscribe(setState); 
    return () => { unsubscribe(); };
  }, []);

  return <PipelineContext.Provider value={state}>{children}</PipelineContext.Provider>;
};

/**
 * A React hook that subscribes to a live event pipeline channel, optionally polling for updates.
 * @param key The channel identifier to subscribe to.
 * @param fetcher A function returning a Promise to fetch the initial/fallback data.
 * @param pollInterval The interval in milliseconds to poll if the WebSocket is unavailable.
 * @returns An object containing the current data, status, last updated timestamp, any error, and an optimistic update function.
 */
export function useLivePipeline<T>(key: string, fetcher: () => Promise<T>, pollInterval = 5000) {
  const state = useContext(PipelineContext);
  
  useEffect(() => {
    pipelineCore.register(key, fetcher, pollInterval);
    return () => {
       // We might not immediately unregister to keep cache alive, but for now we do
       // pipelineCore.unregister(key);
    };
  }, [key, pollInterval, fetcher]);

  const status = state.metadata[key]?.status;

  return {
    data: state.data[key] as T | undefined,
    status: status || 'loading',
    lastUpdated: state.metadata[key]?.lastUpdated,
    error: state.metadata[key]?.error,
    optimisticUpdate: (mutation: (prev: T) => T) => pipelineCore.optimisticUpdate<T>(key, mutation)
  };
}

/**
 * A React hook that returns the current health metrics of the LiveEventPipeline.
 * @returns An object containing health metrics like connection status, active subscriptions, and queued messages.
 */
export function usePipelineHealth() {
  const state = useContext(PipelineContext);
  return state.health;
}
