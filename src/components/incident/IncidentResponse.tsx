import React, { useState } from 'react';

import { 
  ShieldAlert, AlertTriangle, Clock, Users, MapPin, 
  FileText, Activity, BrainCircuit, CheckCircle2, 
  Camera, Video, FileWarning, ArrowRight,
  Search, Plus, Download
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

// Mock Data
const INCIDENTS = [
  {
    id: 'INC-2026-0042',
    title: 'Medical Emergency - Sector 4',
    status: 'Open',
    priority: 'Critical',
    severity: 'High',
    assignee: 'Team Alpha (Medics)',
    location: 'Sector 4, Upper Concourse',
    timeSince: '4m 12s',
    slaRemaining: '0m 48s', // SLA 5 mins
    description: 'Report of a guest experiencing cardiac distress near section 422.',
    timeline: [
      { time: '12:05:00', event: 'Incident reported by staff', type: 'info' },
      { time: '12:05:30', event: 'Dispatch notified Team Alpha', type: 'action' },
      { time: '12:07:15', event: 'Team Alpha en route', type: 'update' }
    ],
    evidence: [
      { type: 'cctv', url: '#', label: 'Cam 42' }
    ],
    aiRecommendation: 'Pre-clear medical route via Gate B. Dispatch nearest AED unit (Sector 4, Kiosk 3).',
    rootCause: null
  },
  {
    id: 'INC-2026-0041',
    title: 'Perimeter Breach',
    status: 'Assigned',
    priority: 'High',
    severity: 'Medium',
    assignee: 'Security Patrol 3',
    location: 'Gate C (East)',
    timeSince: '14m',
    slaRemaining: '1m', // SLA 15 mins
    description: 'Unauthorized access attempt detected at Gate C secondary entrance.',
    timeline: [
      { time: '11:55:00', event: 'Sensor triggered at Gate C', type: 'alert' },
      { time: '11:56:00', event: 'Security Patrol 3 assigned', type: 'action' }
    ],
    evidence: [
      { type: 'photo', url: '#', label: 'Sensor snapshot' },
      { type: 'video', url: '#', label: 'CCTV footage' }
    ],
    aiRecommendation: 'Lock down adjacent zones and reroute incoming crowd traffic.',
    rootCause: null
  },
  {
    id: 'INC-2026-0039',
    title: 'POS Terminal Failure',
    status: 'Resolved',
    priority: 'Medium',
    severity: 'Medium',
    assignee: 'IT Support',
    location: 'Food Court A',
    timeSince: '2h 15m',
    slaRemaining: 'Met',
    description: 'Network connectivity lost for 4 POS terminals in Food Court A.',
    timeline: [
      { time: '10:00:00', event: 'Network alert generated', type: 'alert' },
      { time: '10:05:00', event: 'IT Support dispatched', type: 'action' },
      { time: '10:45:00', event: 'Switch rebooted, terminals online', type: 'resolve' }
    ],
    evidence: [
      { type: 'log', url: '#', label: 'Switch error log' }
    ],
    aiRecommendation: 'Schedule maintenance for Food Court A switch during off-hours.',
    rootCause: 'Firmware bug on local switch causing memory leak.'
  }
];

const PRIORITY_STYLES: Record<string, { color: string; bg: string; border: string; icon?: React.ElementType }> = {
  'Critical': { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'High': { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Medium': { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'Low': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
};

const STATUS_STYLES: Record<string, { color: string; icon: React.ElementType }> = {
  'Open': { icon: AlertTriangle, color: 'text-rose-500' },
  'Assigned': { icon: Users, color: 'text-indigo-500' },
  'Resolved': { icon: CheckCircle2, color: 'text-emerald-500' }
};

export function IncidentResponse() {
  const [activeTab, setActiveTab] = useState('active'); // active, resolved
  const [selectedIncident, setSelectedIncident] = useState<typeof INCIDENTS[0] | null>(INCIDENTS[0]);
  const [search, setSearch] = useState('');

  const filteredIncidents = INCIDENTS.filter(i => {
    const matchTab = activeTab === 'active' ? i.status !== 'Resolved' : i.status === 'Resolved';
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="h-full w-full max-w-7xl mx-auto space-y-6 pb-20 flex flex-col">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-indigo-500" />
            Incident Response
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage, investigate, and resolve critical events.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> New Incident
          </button>
          <button className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm">
            <Download className="h-4 w-4" /> Generate Report
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Column: Incident List */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4 shrink-0">
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('active')}
                aria-label="View Active Incidents"
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'active' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('resolved')}
                aria-label="View Resolved Incidents"
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'resolved' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Resolved
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search ID or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {filteredIncidents.map(incident => {
              const pStyle = PRIORITY_STYLES[incident.priority];
              const sStyle = STATUS_STYLES[incident.status];
              const StatusIcon = sStyle.icon;
              const isSelected = selectedIncident?.id === incident.id;

              return (
                <div 
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedIncident(incident);
                    }
                  }}
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  aria-label={`View details for ${incident.title}`}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/50 shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-medium text-slate-500">{incident.id}</span>
                    <Badge variant="outline" className={`text-[10px] py-0 border-none bg-slate-100 dark:bg-slate-800 ${pStyle.color}`}>
                      {incident.priority}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{incident.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-3.5 w-3.5 ${sStyle.color}`} />
                      {incident.status}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {incident.timeSince}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Incident Details */}
        <div className="lg:w-2/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          {selectedIncident ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <Badge variant="outline" className={`text-[10px] py-0 border-none ${PRIORITY_STYLES[selectedIncident.priority].bg} ${PRIORITY_STYLES[selectedIncident.priority].color}`}>
                    {selectedIncident.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    Sev: {selectedIncident.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-1">
                    <StatusIcon status={selectedIncident.status} /> {selectedIncident.status}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{selectedIncident.title}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Location</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{selectedIncident.location}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Assignee</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{selectedIncident.assignee || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Duration</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{selectedIncident.timeSince}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> SLA Timer</div>
                    <div className={`text-sm font-bold ${selectedIncident.status === 'Resolved' ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                      {selectedIncident.slaRemaining}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* Description & AI */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedIncident.description}</p>
                  </div>

                  {selectedIncident.aiRecommendation && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 flex gap-3">
                      <BrainCircuit className="h-5 w-5 text-indigo-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block mb-1">AI Recommendation</h4>
                        <p className="text-sm text-indigo-600/80 dark:text-indigo-300/80">{selectedIncident.aiRecommendation}</p>
                        {selectedIncident.status !== 'Resolved' && (
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors">
                              Execute Action
                            </button>
                            <button className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedIncident.rootCause && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                       <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                         <FileWarning className="h-4 w-4 text-slate-500" /> Root Cause Analysis
                       </h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400">{selectedIncident.rootCause}</p>
                    </div>
                  )}
                </div>

                {/* Evidence */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Evidence & Media</h4>
                  <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                    {selectedIncident.evidence.map((ev, i) => (
                      <div key={i} className="shrink-0 w-40 h-28 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 transition-colors group relative overflow-hidden">
                        {ev.type === 'cctv' || ev.type === 'video' ? (
                          <Video className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        ) : ev.type === 'photo' ? (
                          <Camera className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        ) : (
                          <FileText className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        )}
                        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-500">{ev.label}</span>
                        {ev.type === 'cctv' && (
                           <div className="absolute top-2 right-2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              <span className="text-[8px] font-bold text-rose-500 uppercase">Live</span>
                           </div>
                        )}
                      </div>
                    ))}
                    <button className="shrink-0 w-28 h-28 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                      <Plus className="h-5 w-5" />
                      <span className="text-xs font-medium">Add Media</span>
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Event Timeline</h4>
                  <div className="space-y-4 pl-2">
                    {selectedIncident.timeline.map((step, i) => (
                      <div key={i} className="relative flex gap-4 items-start">
                        {/* Timeline line */}
                        {i !== selectedIncident.timeline.length - 1 && (
                          <div className="absolute top-6 left-[7px] bottom-[-24px] w-px bg-slate-200 dark:bg-slate-700" />
                        )}
                        <div className={`mt-1 h-4 w-4 rounded-full border-2 bg-white dark:bg-slate-900 z-10 flex-shrink-0 ${
                          step.type === 'alert' ? 'border-rose-500' :
                          step.type === 'action' ? 'border-indigo-500' :
                          step.type === 'resolve' ? 'border-emerald-500' :
                          'border-slate-400'
                        }`} />
                        <div>
                          <div className="text-[10px] font-mono text-slate-500">{step.time}</div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{step.event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedIncident.status !== 'Resolved' && (
                    <div className="mt-6 flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Add a timeline update or comment..." 
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                        Add Update
                      </button>
                    </div>
                  )}
                </div>

              </div>
              
              {/* Action Footer */}
              {selectedIncident.status !== 'Resolved' && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2">
                      <Users className="h-4 w-4" /> Reassign
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Escalate
                    </button>
                  </div>
                  <button className="px-5 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> Mark Resolved
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8">
              <ShieldAlert className="h-12 w-12 mb-4 opacity-20" />
              <p>Select an incident to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to get status icon dynamically
function StatusIcon({ status }: { status: string }) {
  const iconProps = { className: "h-3.5 w-3.5" };
  if (status === 'Resolved') return <CheckCircle2 {...iconProps} />;
  if (status === 'Assigned') return <Users {...iconProps} />;
  return <AlertTriangle {...iconProps} />;
}
