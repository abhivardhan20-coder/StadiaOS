import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Navigation, Loader2, Map as MapIcon, Compass, UserCircle2, Activity, TriangleAlert, ShieldAlert, Accessibility, Baby, Crown, Users } from 'lucide-react';
import { ApiClient } from '@/src/lib/api';
import { WayfinderRoute } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { motion,  } from 'motion/react';
import { cn } from '@/src/lib/utils';

const AVOID_OPTIONS = [
  { id: 'crowds', label: 'Crowds', icon: Users },
  { id: 'maintenance', label: 'Maintenance', icon: TriangleAlert },
  { id: 'security', label: 'Security Incidents', icon: ShieldAlert },
  { id: 'closed_gates', label: 'Closed Gates', icon: MapIcon },
  { id: 'blocked', label: 'Blocked Corridors', icon: TriangleAlert },
];

export function WayfinderAI() {
  const [destination, setDestination] = useState('');
  const [role, setRole] = useState('Visitor');
  const [avoid, setAvoid] = useState<string[]>([]);
  const [stepFree, setStepFree] = useState(false);
  const [evacuationMode, setEvacuationMode] = useState(false);
  const [vipAccess, setVipAccess] = useState(false);
  
  const [route, setRoute] = useState<WayfinderRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const { addToast } = useToast();

  const handleSearch = React.useCallback(async (silent = false) => {
    if (!destination.trim()) return;
    if (!silent) {
      setIsLoading(true);
      setRoute(null);
    }
    
    try {
      const data = await ApiClient.getWayfinderRoute({
        destination,
        stepFreeOnly: stepFree,
        role,
        avoid,
        evacuationMode
      });
      setRoute(data);
      if (!silent) addToast('Route generated successfully', 'success');
      setIsLiveActive(true);
    } catch (e) {
      if (!silent) addToast(e.message || 'Failed to fetch route', 'error');
      setIsLiveActive(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [avoid, stepFree, evacuationMode, addToast, destination, role]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isLiveActive && route) {
      interval = setInterval(() => {
        handleSearch(true);
      }, 10000); // Reroute every 10s using live data
    }
    return () => clearInterval(interval);
  }, [isLiveActive, route, handleSearch]);

  const toggleAvoid = (id: string) => {
    setAvoid(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="grid gap-6 @4xl:grid-cols-12 h-full max-w-[1400px] mx-auto pb-10 @container">
      
      {/* Config Panel */}
      <Card className="@4xl:col-span-5 flex flex-col h-full shadow-2xl border-indigo-500/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-800/50 relative z-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-inner">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold tracking-tight text-xl">Wayfinder AI</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mt-0.5">Live Dynamic Routing</span>
              </div>
            </div>
            {isLiveActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Sync</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-6 p-6 relative z-10 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-6">
            
            <div className={cn("p-4 rounded-xl border transition-all duration-300", evacuationMode ? "bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50")}>
               <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 flex items-center gap-2">
                 <ShieldAlert className={cn("h-4 w-4", evacuationMode ? "text-red-500" : "")} /> 
                 Emergency & Evacuation
               </div>
               <Button 
                  variant={evacuationMode ? "destructive" : "outline"}
                  className="w-full justify-start h-12 font-bold"
                  onClick={() => setEvacuationMode(!evacuationMode)}
                >
                  {evacuationMode ? "EVACUATION MODE ACTIVE" : "Enable Evacuation Routing"}
                </Button>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 flex items-center gap-2">
                <UserCircle2 className="h-3.5 w-3.5" /> Identity Profile
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Visitor', 'VIP', 'Staff', 'Security', 'Medical', 'Cleaning', 'Emergency'].map((r) => (
                  <Button 
                    key={r}
                    variant={role === r ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "justify-start h-9 text-xs",
                      role === r ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : "bg-white/60 dark:bg-slate-800/60"
                    )}
                    onClick={() => { setRole(r); setIsLiveActive(false); }}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">Destination Target</div>
              <div className="flex gap-2">
                <Input 
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setIsLiveActive(false); }}
                  placeholder="e.g. Gate 4, Medical Tent B, VIP Lounge"
                  className="bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-inner h-12 focus-visible:ring-indigo-500/50"
                  onKeyDown={(e) => { if(e.key === 'Enter') handleSearch(); }}
                />
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={isLoading || !destination.trim()}
                  className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 mr-2" />}
                  {isLoading ? '' : 'Route'}
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Accessibility & Access</div>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={stepFree ? "default" : "outline"} 
                  className={cn("cursor-pointer py-1.5 px-3 text-xs flex items-center gap-1.5", stepFree ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white/60 dark:bg-slate-800/60")}
                  onClick={() => setStepFree(!stepFree)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setStepFree(!stepFree)}
                >
                  <Accessibility className="h-3 w-3" /> Step-Free (Wheelchairs)
                </Badge>
                <Badge 
                  variant={stepFree ? "default" : "outline"} 
                  className={cn("cursor-pointer py-1.5 px-3 text-xs flex items-center gap-1.5", stepFree ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white/60 dark:bg-slate-800/60")}
                  onClick={() => setStepFree(!stepFree)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setStepFree(!stepFree)}
                >
                  <Baby className="h-3 w-3" /> Stroller / Parents
                </Badge>
                <Badge 
                  variant={vipAccess ? "default" : "outline"} 
                  className={cn("cursor-pointer py-1.5 px-3 text-xs flex items-center gap-1.5", vipAccess ? "bg-amber-500 hover:bg-amber-600 text-amber-950" : "bg-white/60 dark:bg-slate-800/60")}
                  onClick={() => setVipAccess(!vipAccess)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setVipAccess(!vipAccess)}
                >
                  <Crown className="h-3 w-3" /> VIP Access
                </Badge>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
               <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">AI Routing Restrictions (Avoid)</div>
               <div className="flex flex-wrap gap-2">
                 {AVOID_OPTIONS.map(opt => {
                   const isActive = avoid.includes(opt.id);
                   return (
                     <Badge 
                        key={opt.id}
                        variant={isActive ? "destructive" : "outline"}
                        className={cn("cursor-pointer py-1.5 px-3 text-xs flex items-center gap-1.5 transition-all", isActive ? "opacity-100" : "opacity-70 bg-white/60 dark:bg-slate-800/60")}
                        onClick={() => toggleAvoid(opt.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleAvoid(opt.id)}
                     >
                       <opt.icon className="h-3 w-3" />
                       {opt.label}
                     </Badge>
                   );
                 })}
               </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Navigation Telemetry & Map */}
      <Card className="@4xl:col-span-7 flex flex-col h-full shadow-2xl border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-800/50 relative z-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shrink-0">
          <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-indigo-500" />
            Navigational Telemetry & Guidance
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col">
          {!route && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[300px] p-8 text-center flex-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center rotate-12">
                <Navigation className="h-8 w-8 opacity-40 -rotate-12" />
              </div>
              <div>
                <p className="font-display font-medium text-slate-600 dark:text-slate-400">No active route</p>
                <p className="text-xs mt-1 opacity-70">Initialize a search to generate pathfinding data.</p>
              </div>
            </div>
          )}
          
          {isLoading && !isLiveActive && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px] gap-4 flex-1">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900/50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <Compass className="absolute inset-0 m-auto h-6 w-6 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-indigo-500 animate-pulse mt-2">Calculating Vectors & Hazards...</p>
            </div>
          )}
          
          {route && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 space-y-6 relative z-10 flex flex-col h-full"
            >
              <div className="flex items-start justify-between bg-white/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden shrink-0">
                {isLiveActive && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-pulse" />}
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white leading-tight pr-4">{route.destination}</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed max-w-md">{route.rationale}</p>
                </div>
                <div className="text-right shrink-0 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                  <div className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 leading-none">{route.estimated_walk_time_min}<span className="text-xl text-indigo-400 dark:text-indigo-600 font-sans ml-1">min</span></div>
                  <div className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest mt-2 flex items-center justify-end gap-1">
                    <Activity className="h-3 w-3" /> Est. Walk
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 shrink-0">
                {route.step_free && (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-800/50 rounded-md text-emerald-600 dark:text-emerald-400">
                      <Accessibility className="h-4 w-4" />
                    </div>
                    <span className="text-emerald-800 dark:text-emerald-300 text-xs">Step-Free Confirmed</span>
                  </motion.div>
                )}
                {route.predicted_congestion && (
                   <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm">
                     <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-md text-amber-600 dark:text-amber-400">
                       <Users className="h-4 w-4" />
                     </div>
                     <span className="text-amber-800 dark:text-amber-300 text-xs">{route.predicted_congestion}</span>
                   </motion.div>
                )}
                {route.alternative_entrance && (
                   <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm col-span-2">
                     <div className="p-1.5 bg-blue-100 dark:bg-blue-800/50 rounded-md text-blue-600 dark:text-blue-400">
                       <MapIcon className="h-4 w-4" />
                     </div>
                     <span className="text-blue-800 dark:text-blue-300 text-xs">Suggested Entry: {route.alternative_entrance}</span>
                   </motion.div>
                )}
              </div>

              {/* Animated Map Visualization */}
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shrink-0 mt-4 shadow-inner">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                {/* SVG Path Animation */}
                <svg className="w-full h-full absolute inset-0 drop-shadow-md" preserveAspectRatio="none" viewBox="0 0 400 150">
                   <motion.path
                     d="M 20 130 Q 100 130, 150 80 T 300 50 T 380 20"
                     fill="transparent"
                     strokeWidth="4"
                     stroke={evacuationMode ? "#ef4444" : "#6366f1"}
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeDasharray="10 10"
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 0.5 }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                   />
                   <motion.path
                     d="M 20 130 Q 100 130, 150 80 T 300 50 T 380 20"
                     fill="transparent"
                     strokeWidth="4"
                     stroke={evacuationMode ? "#ef4444" : "#818cf8"}
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                   />
                   {/* Start Point */}
                   <circle cx="20" cy="130" r="6" fill={evacuationMode ? "#ef4444" : "#4f46e5"} />
                   {/* End Point */}
                   <motion.circle cx="380" cy="20" r="8" fill="#10b981"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: 'spring' }}
                   />
                   <motion.circle cx="380" cy="20" r="16" fill="transparent" stroke="#10b981" strokeWidth="2"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                   />
                </svg>

                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                   <div className="flex items-center gap-2">
                     <Navigation className="h-3 w-3 text-indigo-500" />
                     <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Live Path Visualizer</span>
                   </div>
                </div>
              </div>

              {/* Turn-by-Turn Instructions */}
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-2">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 pl-2">Turn-by-turn Navigation</h4>
                <div className="relative before:absolute before:inset-0 before:ml-[1.125rem] before:h-full before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                  {route.route_steps.map((step, i) => {
                    const isStaff = step.type === 'staff_corridor' || step.type === 'emergency_exit' || step.type === 'vip_corridor';
                    const isWarning = step.congestion === 'high' || step.congestion === 'blocked';
                    
                    const IconColors = isWarning
                      ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 border-red-200 dark:border-red-800"
                      : isStaff 
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400 border-amber-200 dark:border-amber-800 group-hover:bg-amber-500"
                        : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 border-white dark:border-slate-950 group-hover:bg-indigo-600";
                    
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 + 0.1 }}
                        className="relative flex items-start gap-6 pb-8 last:pb-0 group"
                      >
                        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-[3px] shadow-sm shrink-0 z-10 group-hover:scale-110 group-hover:text-white transition-all duration-300", IconColors)}>
                          <span className="text-sm font-bold font-mono">{i + 1}</span>
                        </div>
                        <div className="w-full pt-1.5 bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm group-hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={cn("text-[10px] uppercase font-bold tracking-widest", 
                              isWarning ? "text-red-500" : isStaff ? "text-amber-500 dark:text-amber-400" : "text-indigo-500 dark:text-indigo-400"
                            )}>
                              {step.type.replace('_', ' ')}
                            </span>
                            {step.distance && (
                              <span className="text-[10px] font-mono font-medium text-slate-400">{step.distance}m</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{step.instruction}</p>
                          
                          {step.congestion && step.congestion !== 'low' && (
                             <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                <Users className="h-3 w-3" /> {step.congestion} Congestion
                             </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
