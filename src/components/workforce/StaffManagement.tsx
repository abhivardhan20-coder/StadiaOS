import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Shield, HeartPulse, Sparkles, Coffee, 
  Settings2, Wrench, HandHeart, Search, Plus, 
  MapPin, Calendar, Clock, Award, Phone, AlertCircle, 
  Activity, Navigation, CheckCircle2, X
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

type Department = 
  | 'security' | 'medical' | 'cleaning' | 'hospitality' 
  | 'operations' | 'maintenance' | 'volunteers';

const DEPARTMENTS: { id: Department; label: string; icon: React.ElementType }[] = [
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'medical', label: 'Medical', icon: HeartPulse },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { id: 'hospitality', label: 'Hospitality', icon: Coffee },
  { id: 'operations', label: 'Operations', icon: Settings2 },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'volunteers', label: 'Volunteers', icon: HandHeart },
];

interface Employee {
  id: string;
  name: string;
  role: string;
  department: Department;
  status: 'on_duty' | 'off_duty' | 'break' | 'absent';
  location: string;
  shift: string;
  schedule: string[];
  performance: number; // 0-100
  certifications: string[];
  availability: 'available' | 'busy' | 'do_not_disturb';
  phone: string;
  emergencyContact: { name: string; relation: string; phone: string };
  trainingStatus: 'up_to_date' | 'pending' | 'expired';
}

const MOCK_DATA: Record<Department, Employee[]> = {
  security: [
    {
      id: 'SEC001', name: 'James Wilson', role: 'Security Supervisor', department: 'security',
      status: 'on_duty', location: 'Gate A - North', shift: '08:00 - 16:00',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], performance: 95,
      certifications: ['Crowd Control L3', 'First Aid', 'Emergency Evacuation'],
      availability: 'available', phone: '+1 555-0101',
      emergencyContact: { name: 'Sarah Wilson', relation: 'Spouse', phone: '+1 555-0102' },
      trainingStatus: 'up_to_date'
    },
    {
      id: 'SEC002', name: 'Marcus Johnson', role: 'Security Officer', department: 'security',
      status: 'break', location: 'Staff Breakroom 2', shift: '06:00 - 14:00',
      schedule: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'], performance: 88,
      certifications: ['Crowd Control L1', 'First Aid'],
      availability: 'busy', phone: '+1 555-0103',
      emergencyContact: { name: 'Robert Johnson', relation: 'Father', phone: '+1 555-0104' },
      trainingStatus: 'pending'
    }
  ],
  medical: [
    {
      id: 'MED001', name: 'Dr. Emily Chen', role: 'Chief Medical Officer', department: 'medical',
      status: 'on_duty', location: 'Medical Station A', shift: '08:00 - 20:00',
      schedule: ['Mon', 'Wed', 'Fri'], performance: 98,
      certifications: ['MD', 'Advanced Life Support', 'Trauma Care'],
      availability: 'available', phone: '+1 555-0201',
      emergencyContact: { name: 'David Chen', relation: 'Spouse', phone: '+1 555-0202' },
      trainingStatus: 'up_to_date'
    }
  ],
  cleaning: [
    {
      id: 'CLN001', name: 'Maria Garcia', role: 'Head of Janitorial Services', department: 'cleaning',
      status: 'on_duty', location: 'Level 1 Concourse', shift: '06:00 - 14:00',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], performance: 96,
      certifications: ['Biohazard Handling', 'Advanced Sanitation'],
      availability: 'busy', phone: '+1 555-0401',
      emergencyContact: { name: 'Juan Garcia', relation: 'Husband', phone: '+1 555-0402' },
      trainingStatus: 'up_to_date'
    },
    {
      id: 'CLN002', name: 'Alex Wong', role: 'Cleaner', department: 'cleaning',
      status: 'break', location: 'Staff Breakroom 1', shift: '14:00 - 22:00',
      schedule: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'], performance: 85,
      certifications: ['Basic Sanitation'],
      availability: 'busy', phone: '+1 555-0403',
      emergencyContact: { name: 'Linda Wong', relation: 'Mother', phone: '+1 555-0404' },
      trainingStatus: 'up_to_date'
    }
  ],
  hospitality: [
    {
      id: 'HOS001', name: 'Sophie Martin', role: 'Guest Experience Manager', department: 'hospitality',
      status: 'on_duty', location: 'VIP Lounge', shift: '10:00 - 18:00',
      schedule: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'], performance: 99,
      certifications: ['Hospitality Management', 'Conflict Resolution'],
      availability: 'available', phone: '+1 555-0501',
      emergencyContact: { name: 'Thomas Martin', relation: 'Brother', phone: '+1 555-0502' },
      trainingStatus: 'up_to_date'
    }
  ],
  operations: [
    {
      id: 'OPS001', name: 'David Chen', role: 'Operations Coordinator', department: 'operations',
      status: 'on_duty', location: 'Command Center', shift: '08:00 - 16:00',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], performance: 94,
      certifications: ['Event Management', 'Crisis Management'],
      availability: 'do_not_disturb', phone: '+1 555-0601',
      emergencyContact: { name: 'Emily Chen', relation: 'Wife', phone: '+1 555-0602' },
      trainingStatus: 'up_to_date'
    }
  ],
  maintenance: [
    {
      id: 'MNT001', name: 'Carlos Rodriguez', role: 'Lead Technician', department: 'maintenance',
      status: 'on_duty', location: 'HVAC Plant Room', shift: '07:00 - 15:00',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], performance: 92,
      certifications: ['HVAC Level 2', 'Electrical Safety'],
      availability: 'do_not_disturb', phone: '+1 555-0301',
      emergencyContact: { name: 'Maria Rodriguez', relation: 'Sister', phone: '+1 555-0302' },
      trainingStatus: 'expired'
    }
  ],
  volunteers: [
    {
      id: 'VOL001', name: 'Emma Taylor', role: 'Wayfinding Volunteer', department: 'volunteers',
      status: 'on_duty', location: 'Main Entrance', shift: '09:00 - 13:00',
      schedule: ['Sat', 'Sun'], performance: 100,
      certifications: ['Basic Orientation'],
      availability: 'available', phone: '+1 555-0701',
      emergencyContact: { name: 'John Taylor', relation: 'Father', phone: '+1 555-0702' },
      trainingStatus: 'up_to_date'
    }
  ]
};

export function StaffManagement() {
  const [activeDepartment, setActiveDepartment] = useState<Department>('security');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const employees = MOCK_DATA[activeDepartment].filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-20 overflow-hidden relative">
      
      {/* Sidebar navigation */}
      <div className="md:w-64 flex-shrink-0 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            Workforce
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage staff across all departments.</p>
        </div>

        <div className="space-y-1">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => { setActiveDepartment(dept.id); setSelectedEmployee(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeDepartment === dept.id
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <dept.icon className={`h-4 w-4 ${activeDepartment === dept.id ? 'text-indigo-500' : 'opacity-70'}`} />
              {dept.label}
              <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1.5 h-4 bg-slate-100 dark:bg-slate-800">
                {MOCK_DATA[dept.id].length}
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
              {DEPARTMENTS.find(d => d.id === activeDepartment)?.label} Staff
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <button className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors shadow-sm">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {employees.map((emp, idx) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedEmployee(emp)}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {emp.name}
                        </h3>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={emp.status === 'on_duty' ? 'default' : 'secondary'}
                      className={`text-[10px] ${
                        emp.status === 'on_duty' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        emp.status === 'break' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''
                      }`}
                    >
                      {emp.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="mt-auto space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">{emp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 opacity-70" />
                      <span>{emp.shift}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {employees.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  No staff members found.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Employee Details Side Panel */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50 rounded-r-3xl"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xl">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h2>
                  <p className="text-sm text-slate-500">{selectedEmployee.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* Status & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</div>
                  <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    {selectedEmployee.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Availability</div>
                  <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <div className={`h-2 w-2 rounded-full ${
                      selectedEmployee.availability === 'available' ? 'bg-emerald-500' :
                      selectedEmployee.availability === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {selectedEmployee.availability.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Live Tracking */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-indigo-500" /> Live Tracking
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-rose-500" />
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-white">{selectedEmployee.location}</div>
                      <div className="text-xs text-slate-500">Last updated: 1m ago</div>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                    View on Map
                  </button>
                </div>
              </div>

              {/* Schedule & Shift */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" /> Schedule
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Current Shift</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.shift}</span>
                  </div>
                  <div className="flex gap-1 justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div 
                        key={day} 
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          selectedEmployee.schedule.includes(day) 
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' 
                            : 'text-slate-400'
                        }`}
                      >
                        {day[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance & Certifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-500" /> Performance
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                    <div className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                      {selectedEmployee.performance}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Score (0-100)</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" /> Training
                  </h3>
                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center h-[90px] ${
                    selectedEmployee.trainingStatus === 'up_to_date' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                    selectedEmployee.trainingStatus === 'pending' ? 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' :
                    'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'
                  }`}>
                    <div className={`text-sm font-bold capitalize ${
                      selectedEmployee.trainingStatus === 'up_to_date' ? 'text-emerald-700 dark:text-emerald-400' :
                      selectedEmployee.trainingStatus === 'pending' ? 'text-amber-700 dark:text-amber-400' :
                      'text-rose-700 dark:text-rose-400'
                    }`}>
                      {selectedEmployee.trainingStatus.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications List */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400">
                    {selectedEmployee.certifications.length}
                  </Badge>
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.certifications.map(cert => (
                    <Badge key={cert} variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Communication & Emergency */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-indigo-500" /> Contact Info
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Direct Line</div>
                      <div className="font-medium text-sm text-slate-900 dark:text-white">{selectedEmployee.phone}</div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-200 transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-rose-600/70 dark:text-rose-400/70 mb-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Emergency Contact
                      </div>
                      <div className="font-medium text-sm text-rose-900 dark:text-rose-100">
                        {selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relation})
                      </div>
                      <div className="text-sm text-rose-700 dark:text-rose-300 mt-1">{selectedEmployee.emergencyContact.phone}</div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-rose-200 dark:bg-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-center hover:bg-rose-300 transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
