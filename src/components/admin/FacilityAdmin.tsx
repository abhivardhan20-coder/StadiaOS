import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Map, DoorOpen, Armchair, SquareParking, 
  Utensils, Droplets, Shield, HeartPulse, MonitorPlay, 
  Wifi, Plus, Search, Edit2, Trash2, Activity, Settings2, ShieldAlert, X, Save
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

type FacilityCategory = 
  | 'stadiums' | 'zones' | 'entrances' | 'seats' | 'parking' 
  | 'restaurants' | 'restrooms' | 'checkpoints' | 'medical' 
  | 'digital_signage' | 'iot';

const CATEGORIES: { id: FacilityCategory; label: string; icon: React.ElementType }[] = [
  { id: 'stadiums', label: 'Stadiums', icon: Building2 },
  { id: 'zones', label: 'Zones', icon: Map },
  { id: 'entrances', label: 'Entrances', icon: DoorOpen },
  { id: 'seats', label: 'Seats', icon: Armchair },
  { id: 'parking', label: 'Parking', icon: SquareParking },
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'restrooms', label: 'Restrooms', icon: Droplets },
  { id: 'checkpoints', label: 'Checkpoints', icon: Shield },
  { id: 'medical', label: 'Medical', icon: HeartPulse },
  { id: 'digital_signage', label: 'Digital Signage', icon: MonitorPlay },
  { id: 'iot', label: 'IoT Devices', icon: Wifi },
];

interface FacilityItem {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'offline';
  capacity: number | string;
  aiHealth: number;
  lastMaintenance: string;
}

const MOCK_DATA: Record<FacilityCategory, FacilityItem[]> = {
  stadiums: [
    { id: 'st1', name: 'Main Stadium', status: 'active', capacity: 80000, aiHealth: 98, lastMaintenance: '2026-07-15' },
    { id: 'st2', name: 'Arena 2', status: 'maintenance', capacity: 15000, aiHealth: 75, lastMaintenance: '2026-07-10' },
  ],
  zones: [
    { id: 'z1', name: 'North Concourse', status: 'active', capacity: 'High', aiHealth: 95, lastMaintenance: '2026-06-20' },
    { id: 'z2', name: 'VIP Lounge', status: 'active', capacity: 'Medium', aiHealth: 99, lastMaintenance: '2026-07-01' },
    { id: 'z3', name: 'South Gate Area', status: 'offline', capacity: 'Low', aiHealth: 45, lastMaintenance: '2026-07-16' },
  ],
  entrances: [
    { id: 'e1', name: 'Gate A', status: 'active', capacity: '2000/hr', aiHealth: 96, lastMaintenance: '2026-07-12' },
    { id: 'e2', name: 'Gate B', status: 'active', capacity: '1500/hr', aiHealth: 94, lastMaintenance: '2026-07-12' },
    { id: 'e3', name: 'VIP Entrance', status: 'active', capacity: '500/hr', aiHealth: 99, lastMaintenance: '2026-07-12' },
  ],
  seats: [
    { id: 's1', name: 'Section 101', status: 'active', capacity: 450, aiHealth: 99, lastMaintenance: '2026-01-15' },
    { id: 's2', name: 'Section 102', status: 'maintenance', capacity: 450, aiHealth: 60, lastMaintenance: '2025-11-20' },
  ],
  parking: [
    { id: 'p1', name: 'Lot A (North)', status: 'active', capacity: 2500, aiHealth: 97, lastMaintenance: '2026-05-05' },
    { id: 'p2', name: 'Lot B (South)', status: 'active', capacity: 3000, aiHealth: 95, lastMaintenance: '2026-05-10' },
  ],
  restaurants: [
    { id: 'r1', name: 'Burger Stand 1', status: 'active', capacity: '120/hr', aiHealth: 92, lastMaintenance: '2026-07-10' },
    { id: 'r2', name: 'Premium Dining', status: 'active', capacity: '50/hr', aiHealth: 98, lastMaintenance: '2026-07-01' },
  ],
  restrooms: [
    { id: 'rr1', name: 'North RR 1', status: 'active', capacity: 20, aiHealth: 88, lastMaintenance: '2026-07-17' },
    { id: 'rr2', name: 'South RR 2', status: 'maintenance', capacity: 15, aiHealth: 55, lastMaintenance: '2026-07-16' },
  ],
  checkpoints: [
    { id: 'c1', name: 'Security Main', status: 'active', capacity: '1500/hr', aiHealth: 99, lastMaintenance: '2026-07-15' },
  ],
  medical: [
    { id: 'm1', name: 'Med Station A', status: 'active', capacity: 10, aiHealth: 100, lastMaintenance: '2026-07-01' },
  ],
  digital_signage: [
    { id: 'ds1', name: 'Jumbotron', status: 'active', capacity: 'N/A', aiHealth: 96, lastMaintenance: '2026-06-30' },
    { id: 'ds2', name: 'Concourse Display 4', status: 'offline', capacity: 'N/A', aiHealth: 12, lastMaintenance: '2026-04-12' },
  ],
  iot: [
    { id: 'i1', name: 'Temp Sensor N1', status: 'active', capacity: 'N/A', aiHealth: 99, lastMaintenance: '2026-07-01' },
    { id: 'i2', name: 'Turnstile A4', status: 'maintenance', capacity: 'N/A', aiHealth: 70, lastMaintenance: '2026-07-15' },
  ],
};

export function FacilityAdmin() {
  const [activeCategory, setActiveCategory] = useState<FacilityCategory>('stadiums');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(MOCK_DATA);
  const [editingItem, setEditingItem] = useState<FacilityItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const activeItems = items[activeCategory].filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setItems(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(i => i.id !== id)
    }));
  };

  const handleEdit = (item: FacilityItem) => {
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleAddNew = () => {
    setEditingItem({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      status: 'active',
      capacity: '',
      aiHealth: 100,
      lastMaintenance: new Date().toISOString().split('T')[0]
    });
    setIsNew(true);
  };

  const handleSave = () => {
    if (!editingItem) return;
    
    setItems(prev => {
      const current = prev[activeCategory];
      if (isNew) {
        return { ...prev, [activeCategory]: [...current, editingItem] };
      }
      return {
        ...prev,
        [activeCategory]: current.map(i => i.id === editingItem.id ? editingItem : i)
      };
    });
    setEditingItem(null);
  };

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-20 overflow-hidden relative">
      
      {/* Sidebar navigation */}
      <div className="md:w-64 flex-shrink-0 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-indigo-500" />
            Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage infrastructure, capacities, and AI health parameters.</p>
        </div>

        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <cat.icon className={`h-4 w-4 ${activeCategory === cat.id ? 'text-indigo-500' : 'opacity-70'}`} />
              {cat.label}
              <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1.5 h-4 bg-slate-100 dark:bg-slate-800">
                {items[cat.id].length}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm h-full relative">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {CATEGORIES.find(c => c.id === activeCategory)?.label} Management
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <button 
              onClick={handleAddNew}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-6">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="pb-3 pl-4 font-bold">Name</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Capacity</th>
                  <th className="pb-3 font-bold">AI Health</th>
                  <th className="pb-3 font-bold">Last Maint.</th>
                  <th className="pb-3 pr-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {activeItems.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-4 pl-4 text-sm font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-4 text-sm">
                        <Badge 
                          variant={item.status === 'active' ? 'default' : item.status === 'maintenance' ? 'secondary' : 'destructive'}
                          className={`
                            ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                            ${item.status === 'maintenance' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                          `}
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.capacity}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            item.aiHealth >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            item.aiHealth >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                          }`}>
                            {item.aiHealth}
                          </div>
                          <Activity className={`h-3 w-3 ${item.aiHealth < 70 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'}`} />
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-500 font-mono">
                        {item.lastMaintenance}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {activeItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        No records found in this category.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal Overlay */}
        <AnimatePresence>
          {editingItem && (
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
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {isNew ? 'Add New Record' : 'Edit Record'}
                  </h3>
                  <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label htmlFor="edit-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                    <input 
                      id="edit-name"
                      type="text" 
                      value={editingItem.name} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-status" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select 
                      id="edit-status"
                      value={editingItem.status} 
                      onChange={e => setEditingItem({...editingItem, status: e.target.value as FacilityItem['status']})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-capacity" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Capacity</label>
                    <input 
                      id="edit-capacity"
                      type="text" 
                      value={editingItem.capacity} 
                      onChange={e => setEditingItem({...editingItem, capacity: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-aihealth" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Health Score (0-100)</label>
                    <input 
                      id="edit-aihealth"
                      type="number" 
                      min="0" max="100"
                      value={editingItem.aiHealth} 
                      onChange={e => setEditingItem({...editingItem, aiHealth: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-maintenance" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Maintenance Date</label>
                    <input 
                      id="edit-maintenance"
                      type="date" 
                      value={editingItem.lastMaintenance} 
                      onChange={e => setEditingItem({...editingItem, lastMaintenance: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> {isNew ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
