import React, { useState, useRef } from 'react';
import { Maximize2, Minimize2, RefreshCw, AlertTriangle, WifiOff, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { usePipelineHealth } from '@/src/lib/LiveEventPipeline';

interface WidgetContainerProps {
 
 
  children: React.ReactNode;
  status?: 'active' | 'loading' | 'stale' | 'error' | 'offline';
  lastUpdated?: number;
  onRefresh?: () => void;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export function WidgetContainer({


  children,
  status = 'active',
  lastUpdated,
  onRefresh,
  className
}: WidgetContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isOnline } = usePipelineHealth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const actualStatus = !isOnline ? 'offline' : status;

  return (
    <motion.div
      ref={containerRef}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "flex flex-col h-full w-full relative group",
        isFullscreen ? "fixed inset-4 z-[100]" : "",
        className
      )}
    >
      {/* Overlay Drag Handle for grid layouts */}
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg p-1 shadow-md border border-slate-200/50 dark:border-slate-700/50">
        
        {actualStatus === 'loading' && <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
        {actualStatus === 'error' && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
        {actualStatus === 'stale' && <Clock className="h-3.5 w-3.5 text-amber-500" />}
        {actualStatus === 'offline' && <WifiOff className="h-3.5 w-3.5 text-rose-500" />}
        
        <button 
          onClick={handleRefresh}
          className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          aria-label="Refresh widget"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshing || actualStatus === 'loading') && "animate-spin text-indigo-500")} />
        </button>

        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex-1 w-full h-full relative z-10 overflow-hidden rounded-2xl shadow-xl transition-all duration-300">
        <AnimatePresence mode="wait">
          {actualStatus === 'error' && !lastUpdated ? (
             <motion.div 
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 text-center rounded-2xl border border-rose-500/20"
            >
              <AlertTriangle className="h-10 w-10 text-rose-500 mb-3 opacity-80" />
              <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">Data Feed Disconnected</div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, filter: 'blur(4px)' }} 
              animate={{ opacity: 1, filter: 'blur(0px)' }} 
              className="h-full w-full"
            >
              <div className="h-full w-full pointer-events-auto overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
