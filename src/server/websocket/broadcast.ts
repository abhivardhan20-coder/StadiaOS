import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { DEFAULT_GREEN_OPS } from '../config';

export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });
  const connectedClients = new Set<WebSocket>();
  const MAX_CLIENTS = 500;
  
  wss.on('connection', (ws) => {
    if (connectedClients.size >= MAX_CLIENTS) {
      ws.close(1013, "Try Again Later");
      return;
    }
    connectedClients.add(ws);
    
    ws.on('message', (message) => {
      try {
        const msg = JSON.parse(message.toString());
        if (msg.type === 'ping') {
           ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (e) {
        console.warn("Invalid WebSocket message received:", e);
      }
    });
    
    ws.on('close', () => {
      connectedClients.delete(ws);
    });
  });

  const broadcast = (channel: string, payload: unknown) => {
     const msg = JSON.stringify({
        id: `server-${Date.now()}-${Math.random()}`,
        channel,
        payload,
        timestamp: Date.now()
     });
     connectedClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
           try {
             ws.send(msg);
           } catch (e) {
             console.warn("Failed to send message to client:", e);
           }
        }
     });
  };

  const lastStadiumLive = {
    liveContext: {
      crowds: ["Gate A (High Density)", "Concourse 2 (Moderate Density)"],
      maintenance: ["Elevator 3 (Out of Service)", "Corridor 7 (Blocked)"],
      closedGates: ["Gate D (West) - Closed for security"],
      securityIncidents: ["Gate D (West) - Suspicious package"],
      traffic: ["Perimeter Road East (Heavy Traffic)"]
    },
    crowdPulse: {
      overallDensity: 85,
      predictedPeak: "19:30",
      anomalies: ["Unusual buildup near Gate C", "Concourse 4 flow restricted"],
      heatmapData: [
        { zone: "Gate A", density: 92, trend: "up" },
        { zone: "Gate B", density: 45, trend: "down" },
        { zone: "Gate C", density: 88, trend: "up" },
        { zone: "Concourse 1", density: 60, trend: "stable" }
      ]
    }
  };
  
  let lastGreenOps = { ...DEFAULT_GREEN_OPS };

  let intervalHandle: NodeJS.Timeout;
  if (process.env.NODE_ENV !== 'test') {
    intervalHandle = setInterval(() => {
      lastStadiumLive.crowdPulse.overallDensity = Math.max(0, Math.min(100, lastStadiumLive.crowdPulse.overallDensity + (Math.random() * 4 - 2)));
      lastStadiumLive.crowdPulse.heatmapData.forEach(zone => {
        zone.density = Math.max(0, Math.min(100, zone.density + (Math.random() * 10 - 5)));
      });
      
      lastGreenOps.score = Math.max(0, Math.min(100, lastGreenOps.score + (Math.random() * 2 - 1)));
      lastGreenOps.battery = `${Math.floor(Math.max(0, Math.min(100, parseInt(lastGreenOps.battery) + (Math.random() * 2 - 1))))}%`;
      
      broadcast('stadiumLive', lastStadiumLive);
      broadcast('greenOps', lastGreenOps);
    }, 4000);
    
    server.on('close', () => {
      clearInterval(intervalHandle);
    });
  }
};
