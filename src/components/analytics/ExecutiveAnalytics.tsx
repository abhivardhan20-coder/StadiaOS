import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Shield, Wrench, 
  Activity, Zap, Droplets, Car, HeartPulse, BrainCircuit, 
  Download, Calendar, FileText, FileSpreadsheet, Sparkles, ChevronDown, Check
} from 'lucide-react';

import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Area, Line
} from 'recharts';

const METRICS_CATEGORIES = [
  { id: 'attendance', label: 'Attendance', icon: Users, val: '82,451', trend: '+4.2%' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, val: '$3.2M', trend: '+12.5%' },
  { id: 'security', label: 'Security', icon: Shield, val: '4 Incidents', trend: '-2' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, val: '98.5%', trend: '+0.5%' },
  { id: 'crowd', label: 'Crowd Flow', icon: Activity, val: 'Smooth', trend: 'Optimal' },
  { id: 'energy', label: 'Energy', icon: Zap, val: '450 kW', trend: '-15%' },
  { id: 'water', label: 'Water', icon: Droplets, val: '12k Gal', trend: '-5%' },
  { id: 'transportation', label: 'Transport', icon: Car, val: '85% Cap', trend: '+5%' },
  { id: 'medical', label: 'Medical', icon: HeartPulse, val: '2 Cases', trend: 'Normal' },
  { id: 'ai', label: 'AI Ops', icon: BrainCircuit, val: '99.9%', trend: 'Uptime' }
];

const ATTENDANCE_DATA = [
  { time: '12:00', actual: 20000, predicted: 19000, historical: 18500 },
  { time: '13:00', actual: 45000, predicted: 43000, historical: 41000 },
  { time: '14:00', actual: 65000, predicted: 68000, historical: 62000 },
  { time: '15:00', actual: 78000, predicted: 79000, historical: 75000 },
  { time: '16:00', actual: 82451, predicted: 83000, historical: 80000 },
  { time: '17:00', actual: null, predicted: 84000, historical: 81000 },
  { time: '18:00', actual: null, predicted: 80000, historical: 78000 },
];

const REVENUE_DATA = [
  { category: 'Ticketing', current: 1800, previous: 1750 },
  { category: 'F&B', current: 950, previous: 820 },
  { category: 'Merch', current: 450, previous: 380 },
  { category: 'Parking', current: 200, previous: 190 }
];

export function ExecutiveAnalytics() {
  const [activeCategory, setActiveCategory] = useState('attendance');
  const [timeRange, setTimeRange] = useState('Today');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);

  return (
    <div className="h-full w-full max-w-7xl mx-auto space-y-6 pb-20 flex flex-col">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-500" />
            Executive Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time performance, predictive models, and historical comparisons.</p>
        </div>

        <div className="flex items-center gap-3">
          
          <div className="relative">
            <button 
              aria-label="Schedule Report"
              onClick={() => { setShowScheduleMenu(!showScheduleMenu); setShowExportMenu(false); }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
            >
              <Calendar className="h-4 w-4" /> Schedule
            </button>
            <AnimatePresence>
              {showScheduleMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800"><span className="text-xs font-bold text-slate-500 px-2">Automated Reports</span></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">Daily End-of-Day <Check className="h-4 w-4 text-emerald-500" /></button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">Weekly Executive Brief</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">Post-Event Analysis</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              aria-label="Export Report"
              onClick={() => { setShowExportMenu(!showExportMenu); setShowScheduleMenu(false); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="h-4 w-4" /> Export Data <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4 text-rose-500" /> Export as PDF
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export as Excel
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" /> Export as CSV
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 z-10">
        {METRICS_CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            aria-label={`View ${cat.label}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col gap-2 min-w-[140px] p-4 rounded-2xl border transition-all text-left ${
              activeCategory === cat.id 
                ? 'bg-indigo-600 border-indigo-500 shadow-md text-white' 
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div className="flex justify-between items-start w-full">
               <cat.icon className={`h-5 w-5 ${activeCategory === cat.id ? 'text-indigo-200' : 'text-slate-400'}`} />
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                 activeCategory === cat.id ? 'bg-indigo-500/50 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
               }`}>
                 {cat.trend}
               </span>
            </div>
            <div>
               <div className={`text-2xl font-bold ${activeCategory === cat.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{cat.val}</div>
               <div className={`text-xs font-medium ${activeCategory === cat.id ? 'text-indigo-200' : 'text-slate-500'}`}>{cat.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Analytics Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        <div className="lg:w-2/3 flex flex-col gap-6">
          {/* Main Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trend Analysis: {METRICS_CATEGORIES.find(c => c.id === activeCategory)?.label}</h2>
                <p className="text-sm text-slate-500">Actual vs Predicted vs Historical</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['Today', 'Week', 'Month', 'Year'].map(t => (
                  <button 
                    key={t}
                    aria-label={`Set time range to ${t}`}
                    onClick={() => setTimeRange(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${timeRange === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ATTENDANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-slate-200)" opacity={0.5} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(v) => v >= 1000 ? `${(v/1000)}k` : v} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-slate-900)', color: 'white' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
                  
                  <Area type="monotone" dataKey="actual" name="Actual (Live)" fill="url(#colorActual)" stroke="#6366f1" strokeWidth={3} />
                  <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="historical" name="Historical Avg" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-72">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Breakdown (vs Previous Event)</h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-slate-200)" opacity={0.5} />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(v) => `$${v}k`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-slate-900)', color: 'white' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: any) => [`$${value}k`, undefined]}
                    cursor={{ fill: 'var(--tw-colors-slate-100)', opacity: 0.5 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="current" name="Current Event" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="previous" name="Previous Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-md text-white flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-indigo-200" />
              <h2 className="text-lg font-bold">Executive AI Summary</h2>
            </div>
            
            <p className="text-sm text-indigo-100 leading-relaxed">
              Overall event performance is exceeding expectations by <strong className="text-white">4.2%</strong>. Revenue per capita is tracking at <strong className="text-white">$38.80</strong> (up 12%).
            </p>
            
            <div className="space-y-3 mt-2">
              <div className="bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Revenue Opportunity</span>
                </div>
                <p className="text-xs text-white/90">F&B sales in Concourse 2 are peaking earlier than predicted. Recommend deploying 2 additional mobile vendors.</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Predictive Alert</span>
                </div>
                <p className="text-xs text-white/90">Egress modeling predicts heavy congestion at Gate C post-event. Recommend routing 30% of traffic to Gate B.</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Predictive Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-slate-500">Estimated Final Attendance</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">84,500</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-slate-500">Projected F&B Revenue</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">$1.2M</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-slate-500">Post-Event Egress Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">38 mins</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
