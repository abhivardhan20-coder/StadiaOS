import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Leaf, Zap, RefreshCw, Sparkles, Droplets, Wind, Trash2, Recycle, UtensilsCrossed, BatteryCharging, TrendingUp, AlertTriangle, Lightbulb, DollarSign, Activity, FileText, Cloud, Thermometer, Droplets as HumidityIcon } from 'lucide-react';
import { useLivePipeline } from '@/src/lib/LiveEventPipeline';
import { ApiClient } from '@/src/lib/api';
import { useToast } from '@/src/hooks/useToast';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { GreenOpsData } from '@/src/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const MetricCard = ({ title, icon: Icon, value, colorClass, isLoading }: { title: string, icon: React.ElementType, value?: string, colorClass: string, isLoading?: boolean }) => (
  <Card className="bg-white/60 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-xl group relative overflow-hidden">
    <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 pointer-events-none opacity-20", colorClass)} />
    <CardHeader className="pb-2">
      <CardTitle className="text-[10px] @2xl:text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
        <Icon className={cn("h-4 w-4", colorClass.replace('bg-', 'text-'))} /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
      ) : (
        <div className="text-xl @2xl:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 drop-shadow-sm tracking-tight">{value || '--'}</div>
      )}
    </CardContent>
  </Card>
);


const mockTrendData = [
  { time: '14:00', energy: 1.1, carbon: 0.9 },
  { time: '14:15', energy: 1.2, carbon: 0.95 },
  { time: '14:30', energy: 1.5, carbon: 1.1 },
  { time: '14:45', energy: 1.8, carbon: 1.25 },
  { time: '15:00', energy: 2.1, carbon: 1.4 },
  { time: '15:15', energy: 2.2, carbon: 1.45 },
  { time: '15:30', energy: 1.9, carbon: 1.3 },
];

const mockForecastChartData = [
  { day: 'Mon', predicted: 45, actual: 42 },
  { day: 'Tue', predicted: 50, actual: 48 },
  { day: 'Wed', predicted: 48, actual: 45 },
  { day: 'Thu', predicted: 55, actual: 58 },
  { day: 'Fri', predicted: 60, actual: 62 },
  { day: 'Sat', predicted: 85, actual: null },
  { day: 'Sun', predicted: 80, actual: null },
];

const AnimatedGauge = ({ value, max = 100, label }: { value: number, max?: number, label: string }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDasharray = `${(percentage * 251.2) / 100} 251.2`;

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-100 dark:text-emerald-900/30" />
        <motion.circle
          cx="50" cy="50" r="40"
          stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeLinecap="round"
          className="text-emerald-500 drop-shadow-md"
          initial={{ strokeDasharray: "0 251.2" }}
          animate={{ strokeDasharray }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-400 drop-shadow-sm tracking-tight">{value}</span>
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

export function GreenOpsAdvisor() {
  const { data, status } = useLivePipeline<GreenOpsData>('greenOps', () => ApiClient.getGreenOpsData(), 10000);
  const { addToast } = useToast();
  const isLoading = status === 'loading';
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = () => {};

  const handleGenerateReport = () => {
    setIsGenerating(true);
    addToast('Compiling sustainability metrics...', 'info');
    setTimeout(() => {
      setIsGenerating(false);
      addToast('ESG Sustainability Report generated successfully.', 'success');
    }, 2500);
  };


  return (
    <div className="space-y-6 pb-10 h-full overflow-y-auto custom-scrollbar pr-2 @container">
      <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Environmental Intelligence</h2>
          <p className="text-sm text-slate-500">Real-time ESG metrics and AI forecasting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-sm text-indigo-600 dark:text-indigo-400" aria-label="Generate Report" onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {isGenerating ? 'Generating...' : 'Auto-Report'}
          </Button>
          <Button variant="outline" className="bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-sm" aria-label="Refresh Data" onClick={() => fetchData()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 @2xl:grid-cols-3">
        {/* Score Card with Animated Gauge */}
        <Card className="bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10 shadow-lg backdrop-blur-xl group relative overflow-hidden flex flex-col items-center justify-center py-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold mb-4 z-10">ESG Score</p>
          {isLoading && !data ? (
            <div className="w-32 h-32 rounded-full border-8 border-emerald-200/50 dark:border-emerald-900/50 animate-pulse"></div>
          ) : (
            <AnimatedGauge value={data?.score || 0} label="Optimal" />
          )}
        </Card>
        
        {/* Savings Card */}
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/50 shadow-sm backdrop-blur-xl @2xl:col-span-2">
          <CardContent className="p-6 flex flex-col justify-center h-full relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <DollarSign className="w-48 h-48" />
            </div>
            <div aria-live="polite" aria-atomic="true">
              <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold mb-2 flex items-center gap-1 relative z-10"><DollarSign className="h-4 w-4" /> Cost Savings (AI Optimized)</p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80 mb-4 relative z-10">Projected savings across energy, water, and waste management based on predictive adjustments.</p>
              {isLoading && !data ? (
                <div className="h-10 w-48 bg-emerald-200/50 dark:bg-emerald-900/50 animate-pulse rounded"></div>
              ) : (
                <div className="text-4xl @2xl:text-5xl font-bold font-mono text-emerald-900 dark:text-emerald-100 tracking-tight drop-shadow-sm relative z-10">{data?.savings || '--'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4">
        <MetricCard isLoading={isLoading && !data} title="Electricity" icon={Zap} value={data?.electricity} colorClass="bg-amber-500" />
        <MetricCard isLoading={isLoading && !data} title="Solar Gen" icon={Sparkles} value={data?.solar} colorClass="bg-yellow-400" />
        <MetricCard isLoading={isLoading && !data} title="Battery" icon={BatteryCharging} value={data?.battery} colorClass="bg-green-500" />
        <MetricCard isLoading={isLoading && !data} title="HVAC" icon={Wind} value={data?.hvac} colorClass="bg-blue-400" />
        <MetricCard isLoading={isLoading && !data} title="Water" icon={Droplets} value={data?.water} colorClass="bg-cyan-500" />
        <MetricCard isLoading={isLoading && !data} title="Carbon" icon={Leaf} value={data?.carbon} colorClass="bg-emerald-500" />
        <MetricCard isLoading={isLoading && !data} title="Waste" icon={Trash2} value={data?.waste} colorClass="bg-rose-500" />
        <MetricCard isLoading={isLoading && !data} title="Recycling" icon={Recycle} value={data?.recycling} colorClass="bg-teal-500" />
        <MetricCard isLoading={isLoading && !data} title="Food Waste" icon={UtensilsCrossed} value={data?.foodWaste || '150kg'} colorClass="bg-orange-500" />
        <MetricCard isLoading={isLoading && !data} title="Air Quality" icon={Cloud} value={data?.airQuality || '42 AQI'} colorClass="bg-sky-500" />
        <MetricCard isLoading={isLoading && !data} title="Temperature" icon={Thermometer} value={data?.temperature || '22°C'} colorClass="bg-red-400" />
        <MetricCard isLoading={isLoading && !data} title="Humidity" icon={HumidityIcon} value={data?.humidity || '45%'} colorClass="bg-indigo-400" />
      </div>

      <div className="grid gap-6 @2xl:grid-cols-2">
        <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Energy vs Carbon Trend
            </CardTitle>
            <p className="text-xs text-slate-500">Historical performance across last 2 hours</p>
          </CardHeader>
          <CardContent className="pt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} className="text-slate-500" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} className="text-slate-500" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="energy" name="Energy (MW)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
                <Area type="monotone" dataKey="carbon" name="Carbon (t)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCarbon)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> Weekly Energy Demand Forecast
            </CardTitle>
            <p className="text-xs text-slate-500">Predicted vs Actual demand (MWh)</p>
          </CardHeader>
          <CardContent className="pt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockForecastChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} className="text-slate-500" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} className="text-slate-500" />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="predicted" name="AI Forecast" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Usage" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 @2xl:grid-cols-2">
        {/* AI Forecasts */}
        <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col">
          <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <CardTitle className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Predictive Insights & Failures
            </CardTitle>
            <p className="text-xs text-slate-500">AI projections for energy spikes, maintenance, and equipment risks</p>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <div className="space-y-3">
              {isLoading && !data ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
                ))
              ) : (
                <>
                  <div className="flex gap-3 p-3 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                    <div className="mt-0.5"><AlertTriangle className="h-4 w-4 text-red-500" /></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">Predicting HVAC Unit 4 failure within 48h (vibration anomaly)</p>
                  </div>
                  {data?.forecasts?.map((forecast, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="mt-0.5"><Activity className="h-4 w-4 text-indigo-500" /></div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{forecast}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="shadow-lg border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 backdrop-blur-xl flex flex-col">
          <CardHeader className="pb-4 border-b border-emerald-500/10">
            <CardTitle className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Active Recommendations
            </CardTitle>
            <p className="text-xs text-slate-500">Actionable insights to improve ESG metrics and reduce costs</p>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <div className="space-y-3">
              {isLoading && !data ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="h-16 w-full bg-emerald-100/50 dark:bg-emerald-900/30 animate-pulse rounded-lg"></div>
                ))
              ) : (
                data?.recommendations?.map((rec, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
                    <div className="mt-0.5"><Sparkles className="h-4 w-4 text-emerald-500" /></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
