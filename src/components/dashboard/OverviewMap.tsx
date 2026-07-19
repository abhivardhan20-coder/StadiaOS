import React, { useState, useEffect, } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { 
  Users, AlertTriangle, ShieldCheck, Activity, 
  Map as MapIcon, Zap, Droplets,
  Car, Sparkles, Clock, 
  Info, X, ShieldAlert,
  Thermometer, Wrench, Sparkles as CleanIcon,
  Video, DoorOpen, History, HardHat, Crosshair, 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LiveContext } from '@/src/types';
import { useLivePipeline } from '@/src/lib/LiveEventPipeline';
import { ApiClient } from '@/src/lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { CartesianGrid, Line, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Area, AreaChart } from 'recharts';

// Enhanced SVG Paths for Stadium Zones
const STADIUM_ZONES = [
  { id: 'north_stand', name: 'North Stand', type: 'seating', path: 'M80 400 L80 200 L0 150 Q-40 300 0 450 Z', center: [40, 300] },
  { id: 'south_stand', name: 'South Stand', type: 'seating', path: 'M420 400 L420 200 L500 150 Q540 300 500 450 Z', center: [460, 300] },
  { id: 'east_stand', name: 'East Stand', type: 'seating', path: 'M100 180 L50 100 Q250 60 450 100 L400 180 Z', center: [250, 140] },
  { id: 'west_stand', name: 'West Stand', type: 'seating', path: 'M100 420 L50 500 Q250 540 450 500 L400 420 Z', center: [250, 460] },
  { id: 'gate_north', name: 'North Gate', type: 'gate', path: 'M-35 315 L-35 285 L-15 285 L-15 315 Z', center: [-25, 300] },
  { id: 'gate_south', name: 'South Gate', type: 'gate', path: 'M515 315 L515 285 L535 285 L535 315 Z', center: [525, 300] },
  { id: 'vip_lounge', name: 'VIP Lounge', type: 'restricted', path: 'M85 350 L85 250 L110 250 L110 350 Z', center: [97, 300] },
  { id: 'food_court_e', name: 'East Food Court', type: 'vendor', path: 'M200 195 L200 165 L300 165 L300 195 Z', center: [250, 180] },
  { id: 'food_court_w', name: 'West Food Court', type: 'vendor', path: 'M200 435 L200 405 L300 405 L300 435 Z', center: [250, 420] },
  { id: 'medical_n', name: 'Medical Tent N', type: 'medical', path: 'M10 200 L10 170 L40 170 L40 200 Z', center: [25, 185], radius: 15 },
  { id: 'medical_s', name: 'Medical Tent S', type: 'medical', path: 'M460 430 L460 400 L490 400 L490 430 Z', center: [475, 415], radius: 15 },
  { id: 'restroom_nw', name: 'Restroom NW', type: 'restroom', path: 'M90 460 L90 430 L120 430 L120 460 Z', center: [105, 445] },
  { id: 'restroom_se', name: 'Restroom SE', type: 'restroom', path: 'M380 170 L380 140 L410 140 L410 170 Z', center: [395, 155] },
  { id: 'parking_w', name: 'West Parking', type: 'parking', path: 'M150 540 L150 510 L350 510 L350 540 Z', center: [250, 525] },
  { id: 'parking_e', name: 'East Parking', type: 'parking', path: 'M150 90 L150 60 L350 60 L350 90 Z', center: [250, 75] },
  { id: 'hvac_central', name: 'Central HVAC Unit', type: 'hvac', path: 'M240 310 L240 290 L260 290 L260 310 Z', center: [250, 300], radius: 10 },
  { id: 'camera_1', name: 'Camera Feed 1', type: 'camera', path: 'M-10 305 L-10 295 L0 295 L0 305 Z', center: [-5, 300], radius: 5 },
  { id: 'exit_e1', name: 'Emergency Exit E1', type: 'exit', path: 'M150 120 L150 100 L170 100 L170 120 Z', center: [160, 110] },
];

const LAYERS = [
  { id: 'density', label: 'Crowd Density', icon: Users, color: 'from-indigo-500 to-purple-500' },
  { id: 'occupancy', label: 'Seat Occupancy', icon: Activity, color: 'from-rose-500 to-orange-500' },
  { id: 'parking', label: 'Parking', icon: Car, color: 'from-slate-400 to-slate-600' },
  { id: 'restrooms', label: 'Restrooms', icon: Droplets, color: 'from-cyan-400 to-blue-500' },
  { id: 'queues', label: 'Food Queues', icon: Clock, color: 'from-amber-500 to-yellow-500' },
  { id: 'security', label: 'Security Patrols', icon: ShieldCheck, color: 'from-red-500 to-rose-600' },
  { id: 'medical', label: 'Medical Teams', icon: ShieldAlert, color: 'from-rose-400 to-red-500' },
  { id: 'cameras', label: 'Camera Locations', icon: Video, color: 'from-slate-600 to-slate-800' },
  { id: 'exits', label: 'Emergency Exits', icon: DoorOpen, color: 'from-emerald-500 to-teal-500' },
  { id: 'vip', label: 'VIP Areas', icon: Sparkles, color: 'from-amber-300 to-yellow-400' },
  { id: 'restricted', label: 'Restricted Zones', icon: AlertTriangle, color: 'from-red-600 to-rose-700' },
  { id: 'maintenance', label: 'Maintenance Work', icon: Wrench, color: 'from-orange-400 to-amber-500' },
  { id: 'cleaning', label: 'Cleaning Progress', icon: CleanIcon, color: 'from-teal-300 to-cyan-400' },
  { id: 'hvac', label: 'HVAC Zones', icon: Thermometer, color: 'from-blue-400 to-indigo-500' },
  { id: 'energy', label: 'Energy Usage', icon: Zap, color: 'from-yellow-400 to-amber-500' },
  { id: 'water', label: 'Water Consumption', icon: Droplets, color: 'from-blue-500 to-cyan-600' },
];

function generateMockDataForLayer(layerId: string) {
  return STADIUM_ZONES.reduce((acc, zone) => {
    let val = Math.random() * 100;
    
    // Logic for contextual mapping
    if (layerId === 'occupancy' && zone.type !== 'seating') val = 0;
    if (layerId === 'parking' && zone.type !== 'parking') val = 0;
    if (layerId === 'restrooms' && zone.type !== 'restroom') val = 0;
    if (layerId === 'queues' && zone.type !== 'vendor') val = 0;
    if (layerId === 'medical' && zone.type !== 'medical') val = 0;
    if (layerId === 'cameras' && zone.type !== 'camera') val = 0;
    if (layerId === 'exits' && zone.type !== 'exit') val = 0;
    if (layerId === 'vip' && zone.type !== 'restricted') val = 0;
    if (layerId === 'restricted' && zone.type !== 'restricted') val = 0;
    if (layerId === 'hvac' && zone.type !== 'hvac') val = 0;

    acc[zone.id] = {
      value: val,
      status: val > 85 ? 'critical' : val > 65 ? 'warning' : 'normal',
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    return acc;
  }, {} as Record<string, any> );
}

const mockHistoricalData = Array.from({ length: 12 }).map((_, i) => ({
  time: `${12 + i}:00`,
  metric: Math.floor(Math.random() * 100),
  predicted: Math.floor(Math.random() * 100)
}));

export function OverviewMap() {
  const { data } = useLivePipeline('stadiumLive', () => ApiClient.getStadiumLive(), 4000);
  const liveContext: LiveContext | undefined = (data as unknown as { liveContext?: LiveContext })?.liveContext;
  
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]?.id || 'density');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  
  // Synchronize with live pipeline
  const baseData = generateMockDataForLayer(activeLayer);
  
  // Override with live context if available
  if (liveContext?.zones) {
    liveContext.zones.forEach(z => {
      if (baseData[z.id]) {
        baseData[z.id].value = z.density;
        baseData[z.id].status = z.status;
      }
    });
  }
  const layerData = baseData;

  const getColorForValue = (value: number, layer: string) => {
    if (value === 0) return 'rgba(100, 116, 139, 0.1)';
    
    // Scale from blue -> green -> yellow -> red based on 0-100
    if (['security', 'medical', 'cameras', 'exits'].includes(layer)) {
      return `rgba(99, 102, 241, 0.7)`; // Indigo for static/asset locations
    }
    
    if (['water', 'energy', 'cleaning'].includes(layer)) {
      return `rgba(56, 189, 248, ${Math.max(0.2, value / 100)})`; // Blueish
    }

    if (value > 85) return `rgba(239, 68, 68, 0.8)`; // Red
    if (value > 65) return `rgba(245, 158, 11, 0.7)`; // Amber
    if (value > 40) return `rgba(234, 179, 8, 0.6)`;  // Yellow
    if (value > 20) return `rgba(16, 185, 129, 0.5)`; // Green
    return `rgba(99, 102, 241, 0.3)`; // Indigo base
  };

  const selectedZoneDetails = STADIUM_ZONES.find(z => z.id === selectedZone);
  const selectedZoneData = selectedZone ? layerData[selectedZone] : null;

  return (
    <div className="flex flex-col h-full overflow-hidden @container">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2 shrink-0 px-1">
        {LAYERS.map(layer => (
          <Button
            key={layer.id}
            variant={activeLayer === layer.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLayer(layer.id)}
            className={cn(
              "rounded-full whitespace-nowrap border-slate-200/50 dark:border-slate-800/50 transition-all text-xs h-8",
              activeLayer === layer.id 
                 ? `bg-gradient-to-r ${layer.color} border-transparent text-white shadow-md` 
                 : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            )}
          >
            <layer.icon className="h-3.5 w-3.5 mr-1.5" />
            {layer.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col @4xl:flex-row gap-6 flex-1 min-h-0">
        {/* Main Digital Twin Canvas */}
        <Card className="flex-1 overflow-hidden relative flex flex-col group border-slate-200/50 dark:border-slate-700/50 shadow-lg bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="absolute top-0 left-0 right-0 z-20 pointer-events-none pb-0 border-none bg-gradient-to-b from-white/80 via-white/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/40 px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display text-lg drop-shadow-md text-slate-800 dark:text-slate-100">
                <MapIcon className="h-5 w-5 text-indigo-500" />
                Live Digital Twin
              </CardTitle>
              <div className="flex items-center gap-3" aria-live="polite" aria-atomic="true">
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 backdrop-blur-md shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                  SYNC: {LAYERS.find(l => l.id === activeLayer)?.label.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative overflow-hidden flex items-center justify-center">
            
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <motion.div 
              className="relative w-full h-full max-w-[800px] max-h-[800px] flex items-center justify-center p-8 z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-2xl overflow-hidden">
                {/* Field */}
                <rect x="120" y="200" width="260" height="200" rx="20" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
                <circle cx="250" cy="300" r="30" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
                <line x1="250" y1="200" x2="250" y2="400" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
                
                {STADIUM_ZONES.map((zone) => {
                  const data = layerData[zone.id];
                  const value = data?.value || 0;
                  const isSelected = selectedZone === zone.id;
                  
                  return (
                    <g 
                      key={zone.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${zone.name} - Status: ${data?.status || 'unknown'}, Value: ${value.toFixed(0)}`}
                      onClick={() => setSelectedZone(zone.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedZone(zone.id);
                        }
                      }}
                      className={cn(
                        "cursor-pointer transition-all duration-500 ease-out",
                        isSelected ? "drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                      )}
                      style={{
                        transform: isSelected ? `scale(1.02)` : 'scale(1)',
                        transformOrigin: `${zone.center[0]}px ${zone.center[1]}px`
                      }}
                    >
                      {zone.radius ? (
                        <circle
                          cx={zone.center[0]}
                          cy={zone.center[1]}
                          r={zone.radius}
                          fill={getColorForValue(value, activeLayer)}
                          stroke={isSelected ? "#6366f1" : "rgba(255,255,255,0.2)"}
                          strokeWidth={isSelected ? 3 : 1}
                          className="transition-colors duration-1000"
                        />
                      ) : (
                        <path 
                          d={zone.path} 
                          fill={getColorForValue(value, activeLayer)}
                          stroke={isSelected ? "#6366f1" : "rgba(255,255,255,0.2)"}
                          strokeWidth={isSelected ? 3 : 1}
                          strokeLinejoin="round"
                          className="transition-colors duration-1000"
                        />
                      )}
                      
                      {/* Only show text on larger zones or when selected/hovered */}
                      {(zone.type === 'seating' || zone.type === 'parking' || isSelected) && (
                        <text 
                          x={zone.center[0]} 
                          y={zone.center[1]} 
                          textAnchor="middle" 
                          dominantBaseline="middle"
                          className="text-[10px] font-bold fill-slate-800 dark:fill-white pointer-events-none drop-shadow-md select-none"
                          style={{ opacity: isSelected ? 1 : 0.7 }}
                        >
                          {zone.name}
                        </text>
                      )}
                      
                      {/* Metric Indicator if selected or critical */}
                      {(isSelected || data?.status === 'critical') && value > 0 && zone.center && (
                        <g transform={`translate(${zone.center[0]}, ${(zone.center[1] ?? 0) + 15})`}>
                          <rect x="-15" y="-8" width="30" height="16" rx="8" fill="rgba(0,0,0,0.7)" />
                          <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-mono font-bold fill-white">
                            {value.toFixed(0)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          </CardContent>
        </Card>

        {/* Right Side Panel: Zone Details & AI Insights */}
        <AnimatePresence mode="wait">
          {selectedZone ? (
            <motion.div
              key="zone-details"
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '420px' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="shrink-0 flex flex-col gap-4 overflow-hidden"
            >
              <Card className="flex-1 flex flex-col border-slate-200/50 dark:border-slate-700/50 shadow-lg bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="pb-3 flex flex-row items-start justify-between relative border-b border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                      {selectedZoneDetails?.type.toUpperCase()} ZONE
                    </Badge>
                    <CardTitle className="text-xl font-display">{selectedZoneDetails?.name}</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">ID: {selectedZoneDetails?.id.toUpperCase()}</p>
                  </div>
                  <Button aria-label="Close zone details" size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setSelectedZone(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
                  <div className="p-4 space-y-6">
                    
                    {/* Real-time Metric */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 relative overflow-hidden group shadow-sm">
                      <div className={cn(
                        "absolute inset-0 opacity-10 transition-colors",
                        selectedZoneData?.status === 'critical' ? 'bg-red-500' : 
                        selectedZoneData?.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      )} />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          {LAYERS.find(l => l.id === activeLayer)?.icon && React.createElement(LAYERS.find(l => l.id === activeLayer)!.icon, { className: "h-5 w-5 text-slate-500" })}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Current {LAYERS.find(l => l.id === activeLayer)?.label}</span>
<span className="text-xs uppercase px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-bold ml-2">{selectedZoneData?.status}</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                          {selectedZoneData?.value.toFixed(1) || 0}
                          <span className="text-sm font-normal text-slate-500 ml-1">{activeLayer === 'density' || activeLayer === 'occupancy' ? '%' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedZoneData?.value || 0}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            selectedZoneData?.status === 'critical' ? 'bg-red-500' : 
                            selectedZoneData?.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                          )}
                        />
                      </div>
                    </div>

                    {/* Historical Data Chart */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <History className="h-3.5 w-3.5" />
                        Historical Data & Forecast
                      </h4>
                      <div className="h-40 w-full p-2 border border-slate-100 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-950/50">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockHistoricalData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="metric" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMetric)" />
                            <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Predictions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        AI Predictions
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                           <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Predicted Congestion</div>
                           <div className="text-sm font-bold text-amber-600 dark:text-amber-400">High in 15m</div>
                        </div>
                        <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                           <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Evacuation Time</div>
                           <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">4m 20s (Optimal)</div>
                        </div>
                        <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                           <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Queue Formation</div>
                           <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Trending Up</div>
                        </div>
                        <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                           <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Emergency Risk</div>
                           <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Low (12%)</div>
                        </div>
                      </div>
                    </div>

                    {/* Contextual Info */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                        Zone Context
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Users className="h-4 w-4 text-slate-400"/> Nearest Staff</div>
                          <span className="font-mono text-xs">Unit Alpha (1m away)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Video className="h-4 w-4 text-slate-400"/> Camera Feed</div>
                          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold cursor-pointer hover:underline">View CAM-04</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><AlertTriangle className="h-4 w-4 text-slate-400"/> Recent Incidents</div>
                          <span className="font-mono text-xs text-amber-600">1 (Minor spill)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><HardHat className="h-4 w-4 text-slate-400"/> Maintenance</div>
                          <span className="font-mono text-xs text-emerald-600">Clear</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                       <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                         Execute AI Recommendations
                       </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
             <motion.div
              key="default-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, position: 'absolute' }}
              className="shrink-0 w-80 flex flex-col gap-4 hidden @4xl:flex"
            >
              <Card className="flex-1 flex flex-col border-slate-200/50 dark:border-slate-700/50 shadow-lg bg-white/40 dark:bg-slate-900/20 backdrop-blur-md items-center justify-center p-8 text-center text-slate-500">
                 <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/50">
                   <Crosshair className="h-8 w-8 text-indigo-400" />
                 </div>
                 <h3 className="font-display font-semibold text-lg text-slate-700 dark:text-slate-300 mb-2">Digital Twin</h3>
                 <p className="text-sm leading-relaxed">Select any zone on the stadium map to view comprehensive live telemetry, historical data, and AI-powered operational insights.</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
