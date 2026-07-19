import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Briefcase, Shield, Clock, 
  Activity, Smartphone, Globe, 
  Moon, Bell, Lock, CheckCircle2, ChevronRight,
  ShieldCheck, BrainCircuit, ActivitySquare, Server, Trophy
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

const achievements = [
  { id: 1, title: 'Master Commander', desc: 'Resolved 100+ incidents', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 2, title: 'AI Whisperer', desc: 'Used Copilot 500 times', icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 3, title: 'Green Guardian', desc: 'Optimized energy by 15%', icon: ActivitySquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export function UserProfile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity' | 'security'>('overview');

  return (
    <div className="h-full w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-slate-900/50" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative shrink-0">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-slate-800 border-4 border-slate-900/50 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
              <User className="h-16 w-16 text-slate-400" />
            </div>
            <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-900 z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
          
          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Amara Singh</h1>
              <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2 py-0.5 rounded-full">Level 4 Clearance</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm md:text-base font-medium mb-6">
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Chief Operations Commander</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> MetLife Stadium, NY</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Active Now</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-medium text-sm hover:bg-slate-100 transition-colors shadow-lg">
                Edit Profile
              </button>
              <button className="px-5 py-2.5 bg-slate-800/80 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors border border-slate-700/50 backdrop-blur-sm">
                View Activity Log
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {([] as { id: 'overview' | 'permissions' | 'activity' | 'security', label: string, icon: React.ElementType }[]).concat([
          { id: 'overview', label: 'Overview & Stats', icon: Activity },
          { id: 'permissions', label: 'Roles & Access', icon: Shield },
          { id: 'activity', label: 'Recent Activity', icon: Clock },
          { id: 'security', label: 'Security & Devices', icon: Lock },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'permissions' && <PermissionsTab />}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'security' && <SecurityTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Personal Info */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Identity Information</h3>
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email Address" value="amara.s@stadium.gov" />
            <InfoRow icon={Phone} label="Primary Phone" value="+1 (555) 019-8234" />
            <InfoRow icon={Globe} label="Timezone" value="EST (UTC-5)" />
            <InfoRow icon={MapPin} label="Department" value="Operations & Security" />
            <InfoRow icon={Briefcase} label="Employee ID" value="OP-7829-A" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <PrefRow icon={Moon} label="Dark Mode" value="System Default" />
            <PrefRow icon={Globe} label="Language" value="English (US)" />
            <PrefRow icon={Bell} label="Notifications" value="Urgent Only" />
          </div>
        </div>
      </div>

      {/* Stats & Performance */}
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Operational Score" value="98.4" unit="%" trend="+1.2%" trendUp />
          <StatCard title="Response Time" value="1.2" unit="m" trend="-0.3m" trendUp />
          <StatCard title="Resolved Incidents" value="482" unit="" trend="+12" trendUp />
          <StatCard title="AI Utilization" value="85" unit="%" trend="+5%" trendUp />
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance Rings</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
            <ProgressRing percent={92} color="text-indigo-500" label="Command Efficiency" />
            <ProgressRing percent={88} color="text-emerald-500" label="Protocol Adherence" />
            <ProgressRing percent={96} color="text-purple-500" label="AI Integration" />
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex justify-between items-center">
              Achievements & Badges
              <button className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">View All <ChevronRight className="h-3 w-3" /></button>
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {achievements.map(ach => (
                 <div key={ach.id} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className={`h-12 w-12 rounded-full ${ach.bg} ${ach.color} flex items-center justify-center mb-3`}>
                       <ach.icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{ach.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ach.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function PermissionsTab() {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Level: Tier 4 (Command)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Full operational authority over assigned zones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Assigned Venues</h3>
          <div className="space-y-3">
            {['MetLife Stadium (Primary)', 'Red Bull Arena (Secondary)', 'Yankee Stadium (Emergency Only)'].map((venue, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{venue}</span>
                <Badge variant="outline" className={i === 0 ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-slate-300 dark:border-slate-600 text-slate-500"}>
                  {i === 0 ? 'Full Access' : 'Restricted'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">System Capabilities</h3>
          <div className="space-y-3">
            {[
              { name: 'Crowd Pulse Analytics', status: true },
              { name: 'Wayfinder AI Engine', status: true },
              { name: 'Emergency Override Protocols', status: true },
              { name: 'GreenOps Configuration', status: false },
            ].map((sys, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className={`h-2 w-2 rounded-full ${sys.status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span className={`text-sm ${sys.status ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-600'}`}>{sys.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTab() {
  const events = [
    { time: '10 mins ago', title: 'Initiated Crowd Dispersal Protocol', desc: 'Gate C reached 85% density. Automated rerouting engaged.', type: 'alert' },
    { time: '1 hour ago', title: 'Logged in via SSO', desc: 'IP: 192.168.1.45 (New York)', type: 'auth' },
    { time: '2 hours ago', title: 'AI Copilot Query', desc: '"Generate evacuation simulation for East Wing"', type: 'ai' },
    { time: 'Yesterday', title: 'Approved Access Request', desc: 'Granted temporary Level 2 access to Vendor ID #892', type: 'admin' },
    { time: 'Yesterday', title: 'System Health Check', desc: 'All primary services marked operational.', type: 'system' },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Operational Timeline</h2>
      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-4">
        {events.map((ev, i) => (
          <div key={i} className="relative pl-8">
            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
              ev.type === 'alert' ? 'bg-rose-500' :
              ev.type === 'auth' ? 'bg-emerald-500' :
              ev.type === 'ai' ? 'bg-indigo-500' : 'bg-slate-400'
            }`} />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ev.title}</h3>
               <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{ev.time}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{ev.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-500" /> Account Security
         </h2>
         
         <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
               <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">Password Age</div>
                  <div className="text-xs text-slate-500 mt-1">Last changed 45 days ago</div>
               </div>
               <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                  Update
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-slate-500" /> Active Sessions
         </h2>
         
         <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
               <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
               <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <div className="font-medium text-sm text-indigo-900 dark:text-indigo-200">Current Session (Mac OS)</div>
                     <Badge variant="outline" className="text-[10px] bg-indigo-100 text-indigo-700 border-none dark:bg-indigo-900/40 dark:text-indigo-300">Active</Badge>
                  </div>
                  <div className="text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-1">IP: 192.168.1.45 • Chrome 120.0</div>
               </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
               <Smartphone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
               <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <div className="font-medium text-sm text-slate-900 dark:text-white">Mobile App (iOS)</div>
                     <button className="text-xs text-rose-500 hover:text-rose-600 transition-colors">Revoke</button>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">IP: 172.56.21.9 • Last active: 2h ago</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function PrefRow({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
      </div>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
        {value}
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, trend, trendUp }: { title: string, value: string, unit: string, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
      <div className="relative z-10 text-xs font-medium text-slate-500 dark:text-slate-400">{title}</div>
      <div className="relative z-10 flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</span>
          {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
        </div>
        <div className={`text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ percent, color, label }: { percent: number, color: string, label: string }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 80 80">
          <circle
            className="text-slate-100 dark:text-slate-800 stroke-current"
            strokeWidth="6"
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
          />
          <motion.circle
            className={`${color} stroke-current drop-shadow-sm`}
            strokeWidth="6"
            strokeLinecap="round"
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-display text-slate-900 dark:text-white">{percent}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center max-w-[80px] leading-tight">{label}</span>
    </div>
  );
}
