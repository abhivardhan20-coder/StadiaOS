import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, AlertTriangle, Info, CheckCircle2, Megaphone, 
  Wrench, BrainCircuit, Search, CheckSquare, 
  Square, Trash2, Check, Clock, MapPin, Shield, 
  Server, MessageSquare, Activity, 
  MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

// Mock Data
const NOTIFICATIONS = [
  {
    id: 'n1',
    priority: 'Critical',
    title: 'Perimeter Breach Detected',
    timestamp: '2026-07-17T12:05:00Z',
    source: 'Security AI',
    area: 'Gate C (East)',
    systems: ['Access Control', 'CCTV'],
    acknowledged: false,
    resolved: false,
    comments: 0,
    message: 'Unauthorized access attempt detected at Gate C secondary entrance. Security personnel dispatched.',
    aiRecommendation: 'Lock down adjacent zones and reroute incoming crowd traffic.'
  },
  {
    id: 'n2',
    priority: 'Warning',
    title: 'High Crowd Density',
    timestamp: '2026-07-17T11:45:00Z',
    source: 'CrowdPulse',
    area: 'Concourse 2',
    systems: ['Sensors', 'HVAC'],
    acknowledged: true,
    resolved: false,
    comments: 2,
    message: 'Density exceeded 85% capacity in Concourse 2. HVAC cooling increased automatically.',
    aiRecommendation: 'Deploy wayfinding digital signage to redirect to Concourse 3.'
  },
  {
    id: 'n3',
    priority: 'AI Recommendations',
    title: 'Energy Optimization Opportunity',
    timestamp: '2026-07-17T10:30:00Z',
    source: 'GreenOps Engine',
    area: 'Sector 4 (Empty)',
    systems: ['Lighting', 'HVAC'],
    acknowledged: true,
    resolved: true,
    comments: 1,
    message: 'Sector 4 is currently unoccupied. Recommend dimming lights by 50% to save 120kW/h.',
    aiRecommendation: 'Approve automated dimming schedule for off-peak hours.'
  },
  {
    id: 'n4',
    priority: 'Maintenance',
    title: 'Server Rack Temperature High',
    timestamp: '2026-07-17T09:15:00Z',
    source: 'InfraMonitor',
    area: 'Server Room B',
    systems: ['Network', 'Cooling'],
    acknowledged: false,
    resolved: false,
    comments: 0,
    message: 'Rack 4 temperature reached 32°C (Warning threshold: 30°C).',
    aiRecommendation: 'Dispatch maintenance technician to check CRAC unit 2.'
  },
  {
    id: 'n5',
    priority: 'Information',
    title: 'VIP Arrival Confirmed',
    timestamp: '2026-07-17T08:00:00Z',
    source: 'Guest Services',
    area: 'VIP Entrance',
    systems: ['Access Control'],
    acknowledged: true,
    resolved: true,
    comments: 0,
    message: 'Convoy Alpha has arrived at the VIP entrance.',
    aiRecommendation: null
  },
  {
    id: 'n6',
    priority: 'Announcements',
    title: 'System Update Scheduled',
    timestamp: '2026-07-16T18:00:00Z',
    source: 'IT Admin',
    area: 'Facility-wide',
    systems: ['All Systems'],
    acknowledged: true,
    resolved: true,
    comments: 4,
    message: 'Rolling update for all edge devices scheduled for 02:00 AM local time.',
    aiRecommendation: null
  },
  {
    id: 'n7',
    priority: 'Resolved',
    title: 'Point of Sale Network Restored',
    timestamp: '2026-07-16T15:30:00Z',
    source: 'Network Ops',
    area: 'Food Court A',
    systems: ['Payments', 'Network'],
    acknowledged: true,
    resolved: true,
    comments: 1,
    message: 'Latency issues in POS subnet resolved. Operations normal.',
    aiRecommendation: null
  }
];

const PRIORITY_STYLES: Record<string, { color: string; bg: string; border: string; icon?: React.ElementType }> = {
  'Critical': { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'Warning': { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'Information': { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  'Resolved': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'Announcements': { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'Maintenance': { icon: Wrench, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  'AI Recommendations': { icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
};

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
}

export function NotificationHub() {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const filteredNotifs = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                            n.message.toLowerCase().includes(search.toLowerCase()) ||
                            n.area.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterPriority === 'All' || n.priority === filterPriority;
      return matchesSearch && matchesFilter;
    });
  }, [search, filterPriority, notifications]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifs.length && filteredNotifs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifs.map(n => n.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const markAcknowledged = () => {
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, acknowledged: true } : n));
    setSelectedIds(new Set());
  };

  const markResolved = () => {
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, resolved: true, priority: 'Resolved' } : n));
    setSelectedIds(new Set());
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  return (
    <div className="h-full w-full max-w-7xl mx-auto space-y-6 pb-20 flex flex-col">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="h-8 w-8 text-indigo-500" />
            Enterprise Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Centralized alert management and system events.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm">
             {['All', 'Critical', 'Warning', 'AI Recommendations'].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilterPriority(f)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                   filterPriority === f 
                     ? 'bg-indigo-500 text-white shadow-sm' 
                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                 }`}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 z-20 relative">
        <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
          <button 
            onClick={toggleSelectAll} 
            className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-2"
          >
            {selectedIds.size > 0 && selectedIds.size === filteredNotifs.length ? (
              <CheckSquare className="h-5 w-5 text-indigo-500" />
            ) : selectedIds.size > 0 ? (
               <div className="h-5 w-5 rounded border-2 border-indigo-500 flex items-center justify-center bg-indigo-500/20">
                  <div className="h-2 w-2 bg-indigo-500 rounded-sm" />
               </div>
            ) : (
              <Square className="h-5 w-5" />
            )}
            <span className="text-sm font-medium hidden sm:inline">
              {selectedIds.size > 0 ? `${selectedIds.size} Selected` : 'Select All'}
            </span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0"
              >
                <button onClick={markAcknowledged} className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> Acknowledge
                </button>
                <button onClick={markResolved} className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Resolve
                </button>
                <button onClick={deleteSelected} className="whitespace-nowrap px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-rose-100 dark:border-rose-900/50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div role="log" aria-live="polite" aria-relevant="additions text" className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        <AnimatePresence>
          {filteredNotifs.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400"
            >
               <Bell className="h-12 w-12 mb-4 opacity-20" />
               <p>No notifications match your current filters.</p>
            </motion.div>
          ) : (
            filteredNotifs.map((notif, index) => {
              const style = PRIORITY_STYLES[notif.priority] || PRIORITY_STYLES['Information'];
              const Icon = style.icon;
              const isSelected = selectedIds.has(notif.id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  key={notif.id}
                  className={`group relative flex items-start gap-4 p-4 md:p-5 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500/50 shadow-md' 
                      : notif.acknowledged 
                        ? 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/50 shadow-sm'
                  }`}
                >
                  {/* Unread dot indicator */}
                  {!notif.acknowledged && (
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-950" />
                  )}

                  <button 
                    onClick={() => toggleSelect(notif.id)}
                    aria-label={isSelected ? `Deselect ${notif.title}` : `Select ${notif.title}`}
                    className="mt-1 shrink-0 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <Square className="h-5 w-5 opacity-50 group-hover:opacity-100" />
                    )}
                  </button>

                  <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${style.bg} border ${style.border}`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 mb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-base font-bold truncate ${!notif.acknowledged ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </h3>
                        <Badge variant="outline" className={`text-[10px] py-0 border-none bg-slate-100 dark:bg-slate-800 ${style.color}`}>
                          {notif.priority}
                        </Badge>
                        {notif.resolved && (
                          <Badge variant="outline" className="text-[10px] py-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(notif.timestamp)}
                      </div>
                    </div>

                    <p className={`text-sm mb-3 ${!notif.acknowledged ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {notif.message}
                    </p>

                    {notif.aiRecommendation && (
                      <div className="mb-3 flex gap-2 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                        <BrainCircuit className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block mb-1">AI Recommendation</span>
                          <span className="text-sm text-indigo-600/80 dark:text-indigo-300/80 leading-snug">{notif.aiRecommendation}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-slate-400" />
                        {notif.source}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {notif.area}
                      </div>
                      {notif.systems.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-slate-400" />
                          {notif.systems.join(', ')}
                        </div>
                      )}
                      {notif.comments > 0 && (
                        <div className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer transition-colors ml-auto xl:ml-0">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {notif.comments} Comments
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button aria-label="More options" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                     </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
