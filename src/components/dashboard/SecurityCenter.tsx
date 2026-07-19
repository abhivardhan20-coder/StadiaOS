import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Video, Lock, Unlock, Map, Users, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';

export function SecurityCenter() {
  const [activeCamera, setActiveCamera] = useState(1);
  const [zones, setZones] = useState([
    { id: 1, name: 'North Gate', status: 'secure', people: 1450, lastIncident: '2 hours ago' },
    { id: 2, name: 'South Concourse', status: 'warning', people: 3200, lastIncident: '10 mins ago' },
    { id: 3, name: 'VIP Lounge', status: 'secure', people: 120, lastIncident: '1 day ago' },
    { id: 4, name: 'Parking Level 1', status: 'critical', people: 400, lastIncident: 'Just now' },
  ]);

  const toggleZoneLock = (id: number) => {
    setZones(zones.map(z => z.id === id ? { ...z, status: z.status === 'locked' ? 'secure' : 'locked' } : z));
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">Security Command</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time threat detection and access control</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/20">
            <CheckCircle className="h-4 w-4" /> All Systems Online
          </div>
          <div className="flex items-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-sm font-medium border border-rose-500/20">
            <AlertTriangle className="h-4 w-4" /> 2 Active Alerts
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* CCTV Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex-1 bg-slate-900 border-slate-800 overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Video className="h-5 w-5 text-indigo-400" /> Live Feed - Cam {activeCamera}
                </CardTitle>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(cam => (
                    <button
                      key={cam}
                      aria-label={`View camera ${cam}`}
                      onClick={() => setActiveCamera(cam)}
                      className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                        activeCamera === cam 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      CAM {cam}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative group">
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-2 animate-pulse">
                  <div className="h-2 w-2 bg-white rounded-full"></div> REC
                </div>
                <div className="absolute bottom-4 right-4 text-emerald-400 font-mono text-xs opacity-70">
                  {new Date().toISOString().replace('T', ' ').slice(0, 19)}
                </div>
                <div className="text-slate-700 opacity-50 flex flex-col items-center">
                  <Video className="h-16 w-16 mb-4" />
                  <span className="font-mono text-sm tracking-widest">FEED ACTIVE</span>
                </div>
                
                {/* AI Overlays (simulated) */}
                {activeCamera === 2 && (
                  <div className="absolute top-1/4 left-1/3 border-2 border-yellow-500 w-32 h-48 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="absolute -top-6 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1 py-0.5 whitespace-nowrap">
                      Unusual Crowd Density
                    </div>
                  </div>
                )}
                {activeCamera === 4 && (
                  <div className="absolute bottom-1/3 right-1/4 border-2 border-rose-500 w-24 h-40 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="absolute -top-6 left-0 bg-rose-500 text-white text-[10px] font-bold px-1 py-0.5 whitespace-nowrap">
                      Unattended Bag
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone Status */}
        <div className="flex flex-col gap-6">
          <Card className="flex-1 overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-indigo-500" /> Sector Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zones.map(zone => (
                  <div key={zone.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {zone.name}
                        {zone.status === 'locked' && <Lock className="h-3.5 w-3.5 text-rose-500" />}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                        zone.status === 'secure' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                        zone.status === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                        zone.status === 'critical' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {zone.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="h-4 w-4" /> {zone.people}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4" /> {zone.lastIncident}
                      </div>
                    </div>
                    <button
                      aria-label={zone.status === 'locked' ? 'Unlock Zone' : 'Lockdown Zone'}
                      onClick={() => toggleZoneLock(zone.id)}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        zone.status === 'locked'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                      }`}
                    >
                      {zone.status === 'locked' ? <><Unlock className="h-4 w-4" /> Unlock Zone</> : <><Lock className="h-4 w-4" /> Lockdown Zone</>}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
