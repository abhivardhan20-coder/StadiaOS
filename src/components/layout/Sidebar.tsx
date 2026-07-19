import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, Map, MessageSquare, Leaf, Settings, Settings2, Bell, MapPinned, 
  Shield, AlertTriangle, BarChart3, Search, ChevronLeft, ChevronRight, Pin, Clock,
  Users, UserCog, Briefcase, HeartPulse, Sparkles, Server, 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'good' | 'warning' | 'critical' | 'normal' | 'offline';
  notifications: number;
  health: number;
  severity: 'low' | 'med' | 'high' | 'critical' | 'none';
  aiRecommendation: boolean;
  category: 'core' | 'departments' | 'infrastructure' | 'system';
};

const allNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Map, status: 'good', notifications: 0, health: 99.9, severity: 'none', aiRecommendation: false, category: 'core' },
  { id: 'crowd', label: 'Crowd Intelligence', icon: Users, status: 'warning', notifications: 3, health: 92.4, severity: 'med', aiRecommendation: true, category: 'core' },
  { id: 'copilot', label: 'Operations Center', icon: Briefcase, status: 'good', notifications: 12, health: 100, severity: 'low', aiRecommendation: true, category: 'core' },
  { id: 'security', label: 'Security', icon: Shield, status: 'good', notifications: 0, health: 98.1, severity: 'none', aiRecommendation: false, category: 'departments' },
  { id: 'staff', label: 'Workforce', icon: UserCog, status: 'good', notifications: 0, health: 100, severity: 'none', aiRecommendation: false, category: 'departments' },
  { id: 'emergency', label: 'Emergency Response', icon: AlertTriangle, status: 'critical', notifications: 1, health: 45.2, severity: 'critical', aiRecommendation: true, category: 'departments' },
  { id: 'wayfinder', label: 'Wayfinding', icon: MapPinned, status: 'good', notifications: 0, health: 100, severity: 'none', aiRecommendation: false, category: 'departments' },
  { id: 'guest', label: 'Guest Services', icon: MessageSquare, status: 'good', notifications: 45, health: 96.5, severity: 'low', aiRecommendation: false, category: 'departments' },
  { id: 'greenops', label: 'Sustainability', icon: Leaf, status: 'warning', notifications: 2, health: 88.0, severity: 'med', aiRecommendation: true, category: 'departments' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, status: 'normal', notifications: 0, health: 100, severity: 'none', aiRecommendation: false, category: 'infrastructure' },
  { id: 'notifications', label: 'Notifications', icon: Bell, status: 'normal', notifications: 7, health: 100, severity: 'none', aiRecommendation: false, category: 'infrastructure' },
  { id: 'health', label: 'System Health', icon: HeartPulse, status: 'good', notifications: 0, health: 99.9, severity: 'none', aiRecommendation: false, category: 'system' },
  { id: 'history', label: 'AI History', icon: Sparkles, status: 'normal', notifications: 0, health: 100, severity: 'none', aiRecommendation: false, category: 'system' },
  { id: 'admin', label: 'Facility Admin', icon: Settings2, status: 'normal', notifications: 0, health: 100, severity: 'none', aiRecommendation: false, category: 'system' },
];

const statusColors = {
  normal: 'bg-slate-400 dark:bg-slate-500 shadow-none',
  good: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  critical: 'bg-rose-500 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_12px_rgba(225,29,72,0.8)]',
  offline: 'bg-slate-300 dark:bg-slate-700 shadow-none'
};

const severityConfig = {
  none: null,
  low: { color: 'text-sky-500 bg-sky-500/10 border-sky-500/20', label: 'LOW' },
  med: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'MED' },
  high: { color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', label: 'HIGH' },
  critical: { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: 'CRIT' }
};

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['overview', 'crowd']);
  const [recent, setRecent] = useState<string[]>(['overview', 'copilot', 'emergency']);
  const [hoveredItem, setHoveredItem] = useState<{ id: string, y: number, item: NavItem | { id: 'settings', label: string, icon: React.ElementType, status: string, badge: number, category: string } } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('sidebar-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setRecent(prev => {
      const next = [id, ...prev.filter(item => item !== id)].slice(0, 3);
      return next;
    });
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allNavItems;
    return allNavItems.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const favoriteItems = allNavItems.filter(item => favorites.includes(item.id));
  const recentItems = recent.map(id => allNavItems.find(item => item.id === id)).filter(Boolean) as NavItem[];
  
  const coreItems = allNavItems.filter(item => item.category === 'core' && !favorites.includes(item.id));
  const deptItems = allNavItems.filter(item => item.category === 'departments' && !favorites.includes(item.id));
  const infraItems = allNavItems.filter(item => item.category === 'infrastructure' && !favorites.includes(item.id));
  const systemItems = allNavItems.filter(item => item.category === 'system' && !favorites.includes(item.id));

  const renderNavItem = (item: NavItem, context: 'favorite' | 'recent' | 'normal' = 'normal') => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;
    const sev = severityConfig[item.severity];
    
    return (
      <button
        key={`${context}-${item.id}`}
        onClick={() => handleTabClick(item.id)}
        onMouseEnter={(e) => {
          if (isCollapsed) {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredItem({ 
              id: item.id, 
              y: rect.top + rect.height / 2, 
              item: item
            });
          }
        }}
        onMouseLeave={() => setHoveredItem(null)}
        className={cn(
          "group relative flex w-full items-center rounded-xl p-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          isActive 
            ? "bg-white/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
            : "text-slate-600 dark:text-slate-400 hover:bg-white/40 hover:dark:bg-slate-800/40 hover:text-slate-900 hover:dark:text-white border border-transparent",
          isCollapsed && "justify-center"
        )}
      >
        {/* Active Indicator Bar */}
        {isActive && (
          <motion.div 
            layoutId="activeTabIndicator"
            className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500"
          />
        )}
        
        {isActive && !isCollapsed && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
        )}

        <div className="relative flex items-center justify-center shrink-0">
          <Icon className={cn(
            "h-5 w-5 transition-transform duration-300",
            isActive && "scale-110",
            !isActive && "group-hover:scale-110"
          )} />
          {/* Status Dot */}
          <span className={cn(
            "absolute -right-1 -top-1 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900 transition-colors duration-300",
            statusColors[item.status]
          )} />
        </div>

        <div className={cn(
          "flex flex-col overflow-hidden transition-all duration-300", 
          isCollapsed ? "w-0 opacity-0 ml-0" : "flex-1 opacity-100 ml-3 text-left"
        )}>
          <div className="flex items-center justify-between">
            <span className={cn(
              "font-display font-medium text-sm truncate",
              isActive && "font-semibold"
            )}>
              {item.label}
            </span>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {item.aiRecommendation && (
                <div title="AI Recommendation" className="flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                </div>
              )}
              {item.notifications > 0 && (
                <span className={cn(
                  "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                  isActive ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-400 transition-colors"
                )}>
                  {item.notifications > 99 ? '99+' : item.notifications}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" />
              {item.health.toFixed(1)}%
            </span>
            {sev && (
              <span className={cn("text-[9px] font-bold px-1 rounded border", sev.color)}>
                {sev.label}
              </span>
            )}
          </div>
        </div>

        {/* Pin Button */}
        <div 
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleFavorite(e as unknown as React.MouseEvent, item.id);
            }
          }}
          onClick={(e) => toggleFavorite(e, item.id)}
          className={cn(
            "absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700",
            isCollapsed && "hidden",
            context === 'favorite' && "opacity-100 text-indigo-500"
          )}
        >
          <Pin className={cn("h-3 w-3", context === 'favorite' ? "fill-current" : "")} />
        </div>
      </button>
    );
  };

  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl text-slate-900 dark:text-slate-200 shadow-2xl z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative group/sidebar",
      isCollapsed ? "w-[80px]" : "w-72"
    )}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-500 hover:text-indigo-500 transition-colors z-50 opacity-0 group-hover/sidebar:opacity-100"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Header */}
      <div className={cn("flex h-20 items-center border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 relative overflow-hidden", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <div className="flex items-center shrink-0 z-10 w-full">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] overflow-hidden group/logo shrink-0">
            <div className="absolute inset-0 bg-white/20 w-full translate-x-[-100%] group-hover/logo:animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
            <Server className="h-4 w-4 relative z-10" />
          </div>
          <div className={cn("overflow-hidden transition-all duration-300 flex flex-col justify-center", isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3")}>
            <div className="flex items-center">
              <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">StadiaOS</span>
              <span className="font-light ml-1.5 text-slate-500 dark:text-slate-400 text-sm">Nexus</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-mono font-medium text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={cn("px-4 py-4 transition-all duration-300", isCollapsed ? "h-0 py-0 opacity-0 overflow-hidden" : "opacity-100")}>
        <div className="relative group/search">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur transition-opacity opacity-0 group-focus-within/search:opacity-100" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
            <input 
              id="sidebar-search"
              type="text" 
              placeholder="Command search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm placeholder:text-slate-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-focus-within/search:opacity-0 transition-opacity">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1 font-mono text-[9px] font-medium text-slate-500 shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-5 relative pb-4">
        {searchQuery ? (
          <div className="px-3 space-y-1">
            <div className={cn("px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest", isCollapsed && "sr-only")}>Search Results</div>
            {filteredItems.map(item => renderNavItem(item, 'normal'))}
            {filteredItems.length === 0 && (
              <div className={cn("px-3 py-8 text-sm text-slate-500 text-center flex flex-col items-center justify-center gap-2", isCollapsed && "hidden")}>
                <Search className="h-8 w-8 opacity-20" />
                <span>No modules found</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {favoriteItems.length > 0 && (
              <div className="px-3 space-y-1">
                <div className={cn("px-3 mb-2 text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-widest flex items-center gap-2", isCollapsed && "justify-center px-0")}>
                  {isCollapsed ? <Pin className="h-3.5 w-3.5" /> : 'Pinned'}
                </div>
                {favoriteItems.map(item => renderNavItem(item, 'favorite'))}
              </div>
            )}

            <div className="px-3 space-y-1">
              <div className={cn("px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2", isCollapsed && "justify-center px-0")}>
                {isCollapsed ? <Activity className="h-3.5 w-3.5" /> : 'Core Platform'}
              </div>
              {coreItems.map(item => renderNavItem(item, 'normal'))}
            </div>

            <div className="px-3 space-y-1">
              <div className={cn("px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2", isCollapsed && "justify-center px-0")}>
                {isCollapsed ? <Shield className="h-3.5 w-3.5" /> : 'Departments'}
              </div>
              {deptItems.map(item => renderNavItem(item, 'normal'))}
            </div>

            <div className="px-3 space-y-1">
              <div className={cn("px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2", isCollapsed && "justify-center px-0")}>
                {isCollapsed ? <Server className="h-3.5 w-3.5" /> : 'Infrastructure'}
              </div>
              {infraItems.map(item => renderNavItem(item, 'normal'))}
              {systemItems.map(item => renderNavItem(item, 'normal'))}
            </div>
            
            {recentItems.length > 0 && (
              <div className="px-3 space-y-1 mt-4">
                <div className={cn("px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2", isCollapsed && "justify-center px-0")}>
                  {isCollapsed ? <Clock className="h-3.5 w-3.5" /> : 'Recent Modules'}
                </div>
                {recentItems.map(item => renderNavItem(item, 'recent'))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings / Footer */}
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-3 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md">
        <button 
          className={cn(
            "group relative flex w-full items-center rounded-xl p-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            activeTab === 'settings' 
              ? "bg-white/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
              : "text-slate-600 dark:text-slate-400 hover:bg-white/60 hover:dark:bg-slate-800/60 hover:text-slate-900 hover:dark:text-white border border-transparent",
            isCollapsed && "justify-center"
          )}
          onClick={() => setActiveTab('settings')}
          aria-label="Settings"
          onMouseEnter={(e) => {
            if (isCollapsed) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({ 
                id: 'settings', 
                y: rect.top + rect.height / 2, 
                item: { id: 'settings', label: 'System Settings', icon: Settings, status: 'normal', badge: 0, category: 'system' }
              });
            }
          }}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {activeTab === 'settings' && (
            <motion.div 
              layoutId="activeTabIndicator"
              className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500"
            />
          )}
          <Settings className="h-5 w-5 shrink-0 transition-transform duration-500 group-hover:rotate-90" />
          <span className={cn("font-display overflow-hidden transition-all duration-300 whitespace-nowrap", isCollapsed ? "w-0 opacity-0 ml-0" : "flex-1 opacity-100 ml-3 text-left")}>
            Platform Settings
          </span>
          {!isCollapsed && (
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1 font-mono text-[9px] font-medium text-slate-500 shadow-sm">
              ⌘,
            </kbd>
          )}
        </button>
      </div>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {isCollapsed && hoveredItem && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-[90px] z-[100] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl text-slate-800 dark:text-white px-3 py-2.5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-1.5 pointer-events-none min-w-[160px]"
            style={{ top: hoveredItem.y, transform: 'translateY(-50%)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold whitespace-nowrap font-display">{hoveredItem.item.label}</span>
              {(hoveredItem.item as NavItem).aiRecommendation && (
                <Sparkles className="h-3 w-3 text-indigo-500" />
              )}
            </div>
            
            {(hoveredItem.item as NavItem).health && (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Health</span>
                <span>{(hoveredItem.item as NavItem).health}%</span>
              </div>
            )}
            
            {((hoveredItem.item as NavItem).notifications > 0 || (hoveredItem.item as NavItem).severity !== 'none') && (
              <div className="flex items-center gap-2 mt-0.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                {(hoveredItem.item as NavItem).notifications > 0 && (
                  <span className="flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                    {(hoveredItem.item as NavItem).notifications} Alerts
                  </span>
                )}
                {(hoveredItem.item as NavItem).severity && (hoveredItem.item as NavItem).severity !== 'none' && (
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border", severityConfig[(hoveredItem.item as NavItem).severity]?.color)}>
                    {severityConfig[(hoveredItem.item as NavItem).severity]?.label}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
