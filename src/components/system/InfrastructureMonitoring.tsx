import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Database, Activity, Cpu, MemoryStick, Wifi, 
  Camera, Zap, Link, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, Terminal, History, ShieldAlert, BarChart3,
  Wrench, FileWarning
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type SystemCategory = 'core' | 'hardware' | 'edge' | 'integrations';

interface ServiceHealth {
  id: string;
  name: string;
  category: SystemCategory;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: number;
  latency: number;
  icon: React.ElementType;
  metrics: { label: string; value: string; unit?: string }[];
  lastIncident?: string;
  activeErrors: number;
}

const SERVICES: ServiceHealth[] = [
  { id: 'srv1', name: 'Main API Gateway', category: 'core', status: 'healthy', uptime: 99.99, latency: 45, icon: Server, metrics: [{label: 'Requests', value: '4.2k', unit: '/s'}], activeErrors: 0 },
  { id: 'db1', name: 'Primary Database', category: 'core', status: 'healthy', uptime: 99.95, latency: 12, icon: Database, metrics: [{label: 'Queries', value: '18k', unit: '/s'}, {label: 'Connections', value: '450'}], activeErrors: 0 },
  { id: 'ws1', name: 'WebSocket Cluster', category: 'core', status: 'warning', uptime: 99.9, latency: 120, icon: Activity, metrics: [{label: 'Active Conns', value: '22.4k'}, {label: 'Dropped', value: '45'}], activeErrors: 2 },
  { id: 'ai1', name: 'AI Services Core', category: 'core', status: 'healthy', uptime: 99.99, latency: 210, icon: Zap, metrics: [{label: 'Inference', value: '85', unit: 'ms'}], activeErrors: 0 },
  
  { id: 'cpu1', name: 'Compute Cluster', category: 'hardware', status: 'healthy', uptime: 100, latency: 0, icon: Cpu, metrics: [{label: 'Usage', value: '42', unit: '%'}], activeErrors: 0 },
  { id: 'mem1', name: 'Memory Nodes', category: 'hardware', status: 'healthy', uptime: 100, latency: 0, icon: MemoryStick, metrics: [{label: 'Usage', value: '68', unit: '%'}], activeErrors: 0 },
  { id: 'gpu1', name: 'GPU Farm', category: 'hardware', status: 'warning', uptime: 99.9, latency: 0, icon: Cpu, metrics: [{label: 'Load', value: '92', unit: '%'}, {label: 'Temp', value: '82', unit: '°C'}], activeErrors: 1 },
  
  { id: 'iot1', name: 'IoT Hub', category: 'edge', status: 'healthy', uptime: 99.8, latency: 65, icon: Wifi, metrics: [{label: 'Devices', value: '14.2k'}], activeErrors: 0 },
  { id: 'cam1', name: 'CCTV Network', category: 'edge', status: 'critical', uptime: 98.5, latency: 450, icon: Camera, metrics: [{label: 'Active', value: '412/450'}], activeErrors: 38 },
  { id: 'sns1', name: 'Sensor Array', category: 'edge', status: 'healthy', uptime: 99.9, latency: 25, icon: Activity, metrics: [{label: 'Events', value: '1.2k', unit: '/s'}], activeErrors: 0 },
  
  { id: 'tpi1', name: 'Payment Gateway', category: 'integrations', status: 'healthy', uptime: 99.99, latency: 180, icon: Link, metrics: [{label: 'Success Rate', value: '99.8', unit: '%'}], activeErrors: 0 },
  { id: 'tpi2', name: 'Ticketing Partner', category: 'integrations', status: 'warning', uptime: 99.5, latency: 850, icon: Link, metrics: [{label: 'Timeouts', value: '12'}], activeErrors: 3 },
];

const MOCK_LOGS = [
  { id: 'l1', time: '13:42:15', level: 'info', message: 'API Gateway auto-scaled to 12 instances' },
  { id: 'l2', time: '13:41:02', level: 'error', message: 'Camera CAM-N-42 timeout detected' },
  { id: 'l3', time: '13:40:55', level: 'error', message: 'Ticketing API response > 1000ms' },
  { id: 'l4', time: '13:38:20', level: 'warn', message: 'GPU Node 4 temperature critical (85°C)' },
  { id: 'l5', time: '13:35:10', level: 'info', message: 'Database backup completed successfully' },
];

const CHART_DATA = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  cpu: 30 + Math.random() * 40,
  memory: 50 + Math.random() * 30,
  network: 20 + Math.random() * 50
}));

export function InfrastructureMonitoring() {
  const [activeCategory, setActiveCategory] = useState<SystemCategory | 'all'>('all');
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
  const [logs] = useState(MOCK_LOGS);

  const filteredServices = activeCategory === 'all' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === activeCategory);

  const healthScore = Math.round(
    SERVICES.reduce((acc, s) => acc + (s.status === 'healthy' ? 100 : s.status === 'warning' ? 70 : 30), 0) / SERVICES.length
  );

return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col gap-6 pb-20 overflow-hidden relative">
      
      {/* Header & Global Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-6 w-6 text-indigo-500" />
              Live Infrastructure
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time monitoring and automated diagnostics.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center">
                {healthScore}%
                <StatusIcon status={healthScore > 90 ? 'healthy' : healthScore > 70 ? 'warning' : 'critical'} className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-500">System Health</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm md:w-64 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Alerts</span>
            <Badge variant="destructive" className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
              {SERVICES.reduce((acc, s) => acc + s.activeErrors, 0)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Live Sync Active
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {(['all', 'core', 'hardware', 'edge', 'integrations'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap capitalize ${
              activeCategory === cat 
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Services Grid */}
        <div className="flex-[2] overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedService(service)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedService(service);
                    }
                  }}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedService?.id === service.id 
                      ? 'border-indigo-300 dark:border-indigo-600 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        service.status === 'healthy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        service.status === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        <service.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{service.name}</h3>
                        <div className="text-xs text-slate-500 capitalize">{service.category}</div>
                      </div>
                    </div>
                    <StatusIcon status={service.status} className="w-5 h-5" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Uptime</div>
                      <div className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                        {service.uptime}%
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Latency</div>
                      <div className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                        {service.latency}ms
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Logs & Metrics Sidebar */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Charts area */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-64 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" /> Resource Utilization
            </h3>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Line type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> CPU</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Memory</div>
            </div>
          </div>

          {/* Terminal / Live Logs */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-inner flex-1 flex flex-col overflow-hidden font-mono">
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Terminal className="h-4 w-4" />
                syslog_live_tail
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 text-xs">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={`shrink-0 ${
                    log.level === 'error' ? 'text-rose-400' :
                    log.level === 'warn' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {log.level.toUpperCase().padEnd(5)}
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))}
              <div className="text-slate-500 flex gap-2">
                <span>[LIVE]</span> <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Service Details Overlay */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    selectedService.status === 'healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    selectedService.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>
                    <selectedService.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedService.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] capitalize font-mono border-slate-300 dark:border-slate-700">
                        {selectedService.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <StatusIcon status={selectedService.status} className="w-3.5 h-3.5" />
                        {selectedService.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedService(null)} aria-label="Close details" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
                
                {selectedService.status !== 'healthy' && (
                  <div className={`p-4 rounded-xl border flex gap-3 ${
                    selectedService.status === 'critical' 
                      ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
                  }`}>
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm mb-1">Automated Diagnostics Active</div>
                      <div className="text-xs opacity-90 leading-relaxed">
                        {selectedService.status === 'critical' 
                          ? 'Critical failure detected. Attempting automated failover to secondary cluster. Traffic routing updated.'
                          : 'Performance degradation detected. Auto-scaling rules triggered. Provisioning additional resources.'}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Key Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedService.metrics.map((m, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                        <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                          {m.value}<span className="text-sm font-normal text-slate-500 ml-1">{m.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Historical Uptime (30d)</div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="h-4 w-4 text-indigo-500" /> {selectedService.uptime}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Active Errors</div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-amber-500" /> {selectedService.activeErrors} Events
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm">
                  <Wrench className="h-4 w-4" /> Recovery Actions
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

const StatusIcon = ({ status, className = "w-4 h-4" }: { status: string, className?: string }) => {
  switch (status) {
    case 'healthy': return <CheckCircle2 className={`text-emerald-500 ${className}`} />;
    case 'warning': return <AlertTriangle className={`text-amber-500 ${className}`} />;
    case 'critical': return <XCircle className={`text-rose-500 ${className}`} />;
    default: return <AlertTriangle className={`text-slate-400 ${className}`} />;
  }
};
