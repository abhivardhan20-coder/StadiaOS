import React, { useState, useEffect } from 'react';
import { useLivePipeline } from '@/src/lib/LiveEventPipeline';
import { ApiClient } from '@/src/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { 
  Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Line, ReferenceLine, ComposedChart
} from 'recharts';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { motion } from 'motion/react';
import { 
  TrendingUp, Activity, BrainCircuit, Users, Wind, 
  ShieldAlert, ArrowUpRight, Target, 
  Smile, Frown, Volume2, Footprints, Play, Pause,
  ThermometerSun, Baby, Clock, ShoppingBag, CarFront, Ambulance, Hexagon,
  History, Radio, Hourglass
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Helper for generating mock data
const generateTimelineData = () => {
  return Array.from({ length: 24 }).map((_, i) => {
    const time = `${12 + Math.floor(i/2)}:${i%2===0 ? '00' : '30'}`;
    return {
      time,
      congestion: Math.floor(20 + Math.random() * 40 + (i > 10 && i < 18 ? 30 : 0)),
      risk: Math.floor(10 + Math.random() * 20 + (i > 12 && i < 16 ? 20 : 0)),
    };
  });
};

const FLOW_VECTORS = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: 20 + Math.random() * 60,
  y: 20 + Math.random() * 60,
  angle: Math.random() * 360,
  speed: 0.5 + Math.random() * 1.5,
  intensity: Math.random()
}));

const PARTICLES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  tx: Math.random() * 100,
  ty: Math.random() * 100,
  duration: 2 + Math.random() * 4
}));

export function CrowdPulse() {
  const { data } = useLivePipeline('stadiumLive', () => ApiClient.getStadiumLive(), 4000);
  const liveContext = (data as unknown as { liveContext: Record<string, unknown> })?.liveContext;
  const occupancy = (liveContext?.totalOccupancy as number) || 82450;
  const avgSpeed = (liveContext?.avgSpeed as number) || 1.2;

  const [isPlaying, setIsPlaying] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(18); // Current "Live" point
  const [timelineData] = useState(generateTimelineData());
  
  // Real-time animation for particles
  const [particles, setParticles] = useState(PARTICLES);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.tx,
        y: p.ty,
        tx: Math.random() * 100,
        ty: Math.random() * 100,
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const predictions = [
    { id: 'buildup', label: 'Crowd Buildup', value: 'Concourse 4B', time: 'T-15m', prob: 88, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'queue', label: 'Queue Duration', value: 'Avg 12m', time: 'T-10m', prob: 75, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'gate', label: 'Gate Congestion', value: 'South Gate C', time: 'T-20m', prob: 92, icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'stampede', label: 'Potential Stampede', value: 'Low Risk', time: 'Real-time', prob: 4, icon: ShieldAlert, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'food', label: 'Food Shortages', value: 'Vendor Block 7', time: 'T-45m', prob: 64, icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'parking', label: 'Parking Overflow', value: 'East Lot Full', time: 'T-5m', prob: 98, icon: CarFront, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'medical', label: 'Medical Incidents', value: 'Heat Exhaustion', time: 'T-30m', prob: 45, icon: Ambulance, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar pb-12 @container">
      {/* Header */}
      <div className="flex flex-col @xl:flex-row items-start @xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">Crowd Intelligence Engine</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-powered behavioral analysis and predictive flow modeling</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-md shadow-sm">
          <Activity className="h-4 w-4 animate-pulse" />
          Live Telemetry Active
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 @2xl:grid-cols-5">
        <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-indigo-500" /> Attendance / Occ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl @2xl:text-3xl font-display font-bold text-slate-900 dark:text-white">{occupancy.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[10px] @2xl:text-xs font-medium text-emerald-500 mt-1">
              <ArrowUpRight className="h-3 w-3" /> 99.8% Occupancy
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Footprints className="h-3.5 w-3.5 text-emerald-500" /> Avg Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl @2xl:text-3xl font-display font-bold text-slate-900 dark:text-white">{avgSpeed.toFixed(1)} <span className="text-sm @2xl:text-lg text-slate-400 font-sans">m/s</span></div>
            <div className="flex items-center gap-1 text-[10px] @2xl:text-xs font-medium text-emerald-500 mt-1">
              Optimal Flow
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Hourglass className="h-3.5 w-3.5 text-amber-500" /> Queue Lengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl @2xl:text-3xl font-display font-bold text-slate-900 dark:text-white">8 <span className="text-sm @2xl:text-lg text-slate-400 font-sans">mins</span></div>
            <div className="flex items-center gap-1 text-[10px] @2xl:text-xs font-medium text-amber-500 mt-1">
              <TrendingUp className="h-3 w-3" /> +2m at Vendors
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-blue-500" /> Noise Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl @2xl:text-3xl font-display font-bold text-slate-900 dark:text-white">94 <span className="text-sm @2xl:text-lg text-slate-400 font-sans">dB</span></div>
            <div className="flex items-center gap-1 text-[10px] @2xl:text-xs font-medium text-slate-500 mt-1">
              Elevated / Cheering
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-rose-200/50 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10 backdrop-blur-md hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <Target className="h-3.5 w-3.5" /> Risk Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl @2xl:text-3xl font-display font-bold text-rose-600 dark:text-rose-400">2.4 <span className="text-sm @2xl:text-lg text-rose-400/50 font-sans">/ 10</span></div>
            <div className="flex items-center gap-1 text-[10px] @2xl:text-xs font-medium text-slate-500 mt-1">
              Low Risk
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid @4xl:grid-cols-3 gap-6">
        
        {/* Central Visualization (Spans 2 columns) */}
        <Card className="@4xl:col-span-2 shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-col overflow-hidden">
          <CardHeader className="pb-0 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 flex flex-row items-center justify-between px-4 py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-indigo-500" />
              Crowd Heatmap & Flow Vectors
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                <Wind className="h-3 w-3 mr-1 inline" /> Direction: N/NE
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 relative min-h-[400px] bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
            {/* Animated Heatmap Background */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply dark:mix-blend-screen pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.4) 0%, transparent 40%), radial-gradient(circle at 70% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 60%)',
              filter: 'blur(20px)'
            }}></div>
            
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Stadium Abstract Shape */}
            <svg className="relative w-full h-full max-w-[800px] max-h-[500px] drop-shadow-xl p-8" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <rect x="200" y="50" width="400" height="300" rx="150" fill="rgba(255,255,255,0.4)" stroke="rgba(99,102,241,0.2)" strokeWidth="2" className="dark:fill-black/40" />
              <rect x="250" y="100" width="300" height="200" rx="100" fill="rgba(0,0,0,0.05)" stroke="rgba(99,102,241,0.4)" strokeWidth="1" strokeDasharray="5 5" className="dark:fill-white/5" />
              
              {/* Flow Vectors */}
              {FLOW_VECTORS.map(v => (
                <g key={`vector-${v.id}`} transform={`translate(${v.x * 8}, ${v.y * 4}) rotate(${v.angle})`}>
                  <motion.path
                    d="M0 0 L15 0 M10 -3 L15 0 L10 3"
                    stroke={`rgba(99, 102, 241, ${0.3 + v.intensity * 0.5})`}
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 10, opacity: isPlaying ? [0, 1, 0] : 0.5 }}
                    transition={{ duration: v.speed, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              ))}

              {/* Moving Particles (Individuals) */}
              {particles.map(p => (
                <motion.circle
                  key={`particle-${p.id}`}
                  r="2"
                  fill={timelineIndex === 18 ? "#10b981" : "#94a3b8"} // Green if live, gray if historical
                  initial={{ cx: `${p.x}%`, cy: `${p.y}%` }}
                  animate={{ cx: `${p.tx}%`, cy: `${p.ty}%` }}
                  transition={{ duration: p.duration, ease: "linear" }}
                  className="drop-shadow-sm"
                />
              ))}
              
              {/* Hotspots */}
              <motion.circle cx="300" cy="250" r="40" fill="rgba(239, 68, 68, 0.2)" 
                animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle cx="550" cy="150" r="60" fill="rgba(245, 158, 11, 0.15)" 
                animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }} transition={{ duration: 3, repeat: Infinity }}
              />
            </svg>

            {/* Overlays */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-3 rounded-xl shadow-lg flex items-center gap-4 z-20">
              <Button aria-label={isPlaying ? "Pause simulation" : "Play simulation"} size="icon" variant={isPlaying ? "default" : "outline"} className="h-8 w-8 rounded-full shrink-0" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1 px-2 relative">
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={timelineIndex} 
                  onChange={(e) => {
                    setTimelineIndex(parseInt(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] font-mono font-medium text-slate-500 mt-1">
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:30</span>
                </div>
              </div>
              <Badge variant="secondary" className="font-mono text-xs w-24 justify-center flex shrink-0 border-slate-200 dark:border-slate-700">
                {timelineIndex === 18 ? (
                  <span className="flex items-center gap-1.5 text-rose-500"><Radio className="h-3 w-3 animate-pulse" /> LIVE</span>
                ) : (
                  <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> {timelineData[timelineIndex]?.time}</span>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right Intelligence Panel */}
        <div className="space-y-4 flex flex-col">
          <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="py-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Emotion & Fan Engagement</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold">High Joy / Cheering</span>
                </div>
                <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50/50 font-mono">72%</Badge>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[72%] rounded-full" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Frown className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">Stress / Frustration</span>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50 font-mono">15%</Badge>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[15%] rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="py-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Safety & Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/50">
                <ThermometerSun className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400">Heat Stress Prediction</h4>
                  <p className="text-xs text-orange-600/80 dark:text-orange-300/80 mt-1 leading-snug">South stand upper deck reaching 32°C. Elevated risk of dehydration.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
                <Baby className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Children Separated</h4>
                  <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-1 leading-snug">1 active case near Concourse B. Security personnel dispatched.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Predictions & Congestion Timeline */}
      <div className="grid @4xl:grid-cols-3 gap-6">
        
        {/* Congestion Timeline Chart */}
        <Card className="@4xl:col-span-2 shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="py-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Congestion Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine yAxisId="left" x={timelineData[timelineIndex]?.time} stroke={timelineIndex === 18 ? "#f43f5e" : "#10b981"} strokeDasharray="3 3" label={{ position: 'top', value: timelineIndex === 18 ? 'LIVE' : 'PLAYBACK', fill: timelineIndex === 18 ? '#f43f5e' : '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                <Area yAxisId="left" type="monotone" dataKey="congestion" stroke="#6366f1" fillOpacity={1} fill="url(#colorCongestion)" name="Congestion Level" />
                <Line yAxisId="right" type="step" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={false} name="Risk Index" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Predictions Rail */}
        <Card className="shadow-sm border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-col">
          <CardHeader className="py-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-indigo-500" /> AI Predictions
            </CardTitle>
          </CardHeader>
          <CardContent role="log" aria-live="polite" className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-64">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {predictions.map(pred => (
                <div key={pred.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", pred.bg)}>
                    <pred.icon className={cn("h-4 w-4", pred.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{pred.label}</h4>
                      <Badge variant="outline" className="text-[9px] font-mono py-0">{pred.time}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-500 truncate">{pred.value}</p>
                      <span className={cn(
                        "text-[10px] font-mono font-bold",
                        pred.prob > 85 ? "text-rose-500" : pred.prob > 60 ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {pred.prob}% prob
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
