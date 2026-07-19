import React, { useState, useEffect, useMemo, memo } from 'react';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { useContainerWidth } from '../../hooks/useContainerWidth';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidgetContainer } from './WidgetContainer';
import { OverviewMap } from './OverviewMap';
import { CrowdPulse } from './CrowdPulse';
import { WayfinderAI } from './WayfinderAI';
import { GreenOpsAdvisor } from './GreenOpsAdvisor';
import { OpsCopilot } from './OpsCopilot';
import { Activity, Map, Navigation, Zap, Bot, Server, Wifi, WifiOff, HardDriveDownload, AlertCircle } from 'lucide-react';
import { useLivePipeline, usePipelineHealth } from '@/src/lib/LiveEventPipeline';
import { ApiClient } from '@/src/lib/api';

const MemoOverviewMap = memo(OverviewMap);
const MemoCrowdPulse = memo(CrowdPulse);
const MemoOpsCopilot = memo(OpsCopilot);
const MemoWayfinderAI = memo(WayfinderAI);
const MemoGreenOpsAdvisor = memo(GreenOpsAdvisor);


type ResponsiveLayouts = unknown;

export function CommandCenter() {
  const { status, lastUpdated, error } = useLivePipeline('stadiumLive', () => ApiClient.getStadiumLive(), 4000);
  const health = usePipelineHealth();
  const { width, containerRef, mounted } = useContainerWidth();
  
  const defaultLayouts = useMemo<ResponsiveLayouts>(() => {
    return {
      lg: [
        { i: 'map', x: 0, y: 0, w: 7, h: 4, minW: 4, minH: 3 },
        { i: 'crowd', x: 7, y: 0, w: 5, h: 2, minW: 3, minH: 2 },
        { i: 'copilot', x: 7, y: 2, w: 5, h: 2, minW: 3, minH: 2 },
        { i: 'wayfinder', x: 0, y: 4, w: 6, h: 2, minW: 4, minH: 2 },
        { i: 'greenops', x: 6, y: 4, w: 6, h: 2, minW: 4, minH: 2 }
      ],
      md: [
        { i: 'map', x: 0, y: 0, w: 6, h: 4 },
        { i: 'crowd', x: 6, y: 0, w: 4, h: 2 },
        { i: 'copilot', x: 6, y: 2, w: 4, h: 2 },
        { i: 'wayfinder', x: 0, y: 4, w: 5, h: 2 },
        { i: 'greenops', x: 5, y: 4, w: 5, h: 2 }
      ],
      sm: [
        { i: 'map', x: 0, y: 0, w: 6, h: 3 },
        { i: 'crowd', x: 0, y: 3, w: 6, h: 2 },
        { i: 'copilot', x: 0, y: 5, w: 6, h: 2 },
        { i: 'wayfinder', x: 0, y: 7, w: 6, h: 2 },
        { i: 'greenops', x: 0, y: 9, w: 6, h: 2 }
      ]
      };
  }, []);

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    try {
      const savedLayouts = localStorage.getItem('ssip_command_center_layouts');
      if (savedLayouts) {
        return JSON.parse(savedLayouts);
      }
      return defaultLayouts;
    } catch {
      return defaultLayouts;
    }
  });

  
  const handleLayoutChange = (currentLayout: unknown, allLayouts: unknown) => {
    setLayouts(allLayouts);
    localStorage.setItem('ssip_command_center_layouts', JSON.stringify(allLayouts));
    };

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full relative flex flex-col" ref={containerRef}>
      {/* Event Bus Health Monitor */}
      <div className="flex items-center justify-between px-6 py-2 bg-slate-900 text-slate-300 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800 shrink-0 z-20">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <Server className="h-3 w-3 text-indigo-400" /> Event Bus
            </div>
            <div className="flex items-center gap-1.5">
               {health.isOnline ? <Wifi className="h-3 w-3 text-emerald-400" /> : <WifiOff className="h-3 w-3 text-red-500" />}
                {health.isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="flex items-center gap-1.5">
               <div className={`h-1.5 w-1.5 rounded-full ${health.wsReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
               {health.wsReady ? 'WS Ready' : 'Polling Fallback'}
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-500 ml-4">
                 <AlertCircle className="h-3 w-3" /> Connection Error
              </div>
            )}
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-400">
               <HardDriveDownload className="h-3 w-3" /> Subs: {health.activeSubscriptions}
            </div>
            {health.queuedMessages > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400">
                 Queue: {health.queuedMessages}
              </div>
            )}
            <div className="flex items-center gap-1.5 font-mono">
               PING: {health.lastPing ? `${now - health.lastPing}ms` : 'N/A'}
            </div>
         </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 mt-8">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {!health.isOnline && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-rose-500/90 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg backdrop-blur-sm">
          <WifiOff className="h-4 w-4" /> Network offline. Showing cached data.
        </div>
      )}

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
      {mounted && (
        <ResponsiveGridLayout
          className="layout z-10 relative"
          width={width}
          layouts={layouts || defaultLayouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={150}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          <div key="map">
            <WidgetContainer 
               title="Overview Map" icon={<Map className="h-4 w-4" />}
               status={status} lastUpdated={lastUpdated}
               className="drag-handle cursor-grab active:cursor-grabbing"
            >
              <div className="h-full cursor-default"><MemoOverviewMap  /></div>
            </WidgetContainer>
          </div>
          <div key="crowd">
            <WidgetContainer 
               title="Crowd Pulse" icon={<Activity className="h-4 w-4" />}
               status={status} lastUpdated={lastUpdated}
               className="drag-handle cursor-grab active:cursor-grabbing"
            >
              <div className="h-full cursor-default"><MemoCrowdPulse /></div>
            </WidgetContainer>
          </div>
          <div key="copilot">
            <WidgetContainer 
               title="Ops Copilot" icon={<Bot className="h-4 w-4" />}
               status={status} lastUpdated={lastUpdated}
               className="drag-handle cursor-grab active:cursor-grabbing"
            >
              <div className="h-full cursor-default"><MemoOpsCopilot /></div>
            </WidgetContainer>
          </div>
          <div key="wayfinder">
            <WidgetContainer 
               title="Wayfinder" icon={<Navigation className="h-4 w-4" />}
               status={status} lastUpdated={lastUpdated}
               className="drag-handle cursor-grab active:cursor-grabbing"
            >
              <div className="h-full cursor-default"><MemoWayfinderAI  /></div>
            </WidgetContainer>
          </div>
          <div key="greenops">
            <WidgetContainer 
               title="Green Ops" icon={<Zap className="h-4 w-4" />}
               status={status} lastUpdated={lastUpdated}
               className="drag-handle cursor-grab active:cursor-grabbing"
            >
              <div className="h-full cursor-default"><MemoGreenOpsAdvisor /></div>
            </WidgetContainer>
          </div>
        </ResponsiveGridLayout>
      )}
      </div>
    </div>
  );
}
