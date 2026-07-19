import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, Menu, Moon, Sun, Search, 
  MapPin, Users, CloudRain, Clock, Trophy, 
  AlertTriangle, Globe, BrainCircuit,
  Command, ChevronDown, ActivitySquare, Server,
  ChevronRight, Mic
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { usePipelineHealth } from '@/src/lib/LiveEventPipeline';

export function Header({ onMenuClick, isDark, toggleTheme, setActiveTab }: { onMenuClick: () => void, isDark: boolean, toggleTheme: () => void, setActiveTab: (tab: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { isOnline } = usePipelineHealth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Dropdowns state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    const handleScroll = () => {
      setIsScrolled(mainContent.scrollTop > 10);
    };
    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Keyboard navigation for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const searchCategories = [
    'Players', 'Gates', 'Security', 'Food vendors', 'Parking', 
    'Medical stations', 'AI commands', 'Historical events', 'Recent incidents'
  ];

  return (
    <header className="sticky top-2 md:top-4 z-50 px-2 md:px-4 pointer-events-none pb-4">
      <div className={cn(
        "pointer-events-auto flex min-h-[4rem] md:min-h-[5rem] shrink-0 items-center justify-between bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-all duration-500 rounded-2xl mx-auto w-full group/header relative",
        isScrolled 
          ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.03)] border border-slate-200/50 dark:border-slate-800/50 translate-y-0 bg-white/80 dark:bg-slate-950/80" 
          : "shadow-md border border-slate-200/50 dark:border-slate-800/50"
      )}>
        {/* Animated Gradient Border effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 group-hover/header:from-indigo-500/10 group-hover/header:via-purple-500/10 group-hover/header:to-indigo-500/10 pointer-events-none transition-all duration-1000"></div>

        {/* Left: Operational Context */}
        <div className="flex items-center gap-2 md:gap-4 lg:w-1/3 px-2 md:px-4">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-200/50 rounded-lg dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex flex-col gap-1.5 py-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">World Cup '26</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">ARG vs BRA</span>
              <Badge variant="outline" className="ml-1 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800 text-[9px] py-0 px-1.5 animate-pulse shadow-sm">LIVE</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400 font-mono">
              <div className="flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-default"><MapPin className="h-3 w-3 text-indigo-400" /> MetLife Stadium</div>
              <div className="flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-default"><Users className="h-3 w-3 text-indigo-400" /> 82,500 / 82,500</div>
              <div className="flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-default"><CloudRain className="h-3 w-3 text-indigo-400" /> 72°F</div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500 hover:text-amber-400 transition-colors cursor-default"><Clock className="h-3 w-3" /> -00:15:00</div>
            </div>
          </div>
        </div>

        {/* Center: Command Search */}
        <div className="flex-1 flex justify-center px-2 lg:w-1/3 max-w-2xl relative z-50">
          <div className={cn(
            "relative w-full transition-all duration-300 group",
            searchFocused ? "scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.15)] rounded-2xl" : "scale-100"
          )}>
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl transition-opacity duration-300 rounded-2xl pointer-events-none",
              searchFocused ? "opacity-100" : "opacity-0"
            )} />
            <div className="relative flex items-center">
              <Search className={cn(
                "absolute left-4 h-5 w-5 transition-colors",
                searchFocused ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500"
              )} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Universal AI Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  // Small delay to allow clicking dropdown items
                  setTimeout(() => setSearchFocused(false), 200);
                }}
                className={cn(
                  "w-full h-10 md:h-12 pl-12 pr-12 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all shadow-inner placeholder:text-slate-400",
                  searchFocused ? "rounded-t-2xl rounded-b-none border-b-0 bg-white dark:bg-slate-950" : "rounded-2xl"
                )}
                aria-label="Universal AI Search"
              />
              <div className="absolute right-3 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {!searchFocused && (
                  <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500 shadow-sm pointer-events-none">
                    <Command className="h-3 w-3" /> K
                  </kbd>
                )}
                {searchFocused && (
                   <button aria-label="Voice search" className="p-1 text-slate-400 hover:text-indigo-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-md">
                     <Mic className="h-4 w-4" />
                   </button>
                )}
              </div>
            </div>
            
            {/* Search Dropdown */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 w-full bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 border-t-0 rounded-b-2xl shadow-xl overflow-hidden z-50 flex flex-col"
                >
                  <div className="p-2 px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider flex justify-between">
                    <span>Quick Categories</span>
                    <span>Use ↑↓ to navigate</span>
                  </div>
                  <div className="grid grid-cols-2 p-2 gap-1 text-sm max-h-[300px] overflow-y-auto custom-scrollbar">
                    {searchCategories.map((cat) => (
                      <button 
                        key={cat} 
                        className="px-3 py-2 flex items-center justify-between text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md cursor-pointer transition-colors text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:bg-indigo-50 focus:text-indigo-600 outline-none group/item"
                      >
                        <span className="truncate">{cat}</span>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">AI powered semantic search</span>
                    <Badge variant="secondary" className="text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-none">Gemini 3.5</Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: System & Profile */}
        <div className="flex items-center justify-end gap-1 md:gap-3 lg:w-1/3 px-2 md:px-4">
          
          {/* System Indicators - Hidden on small screens */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-inner mr-1 transition-all">
            
            {/* AI Model Activity */}
            <div className="flex items-center gap-1.5 group cursor-help hover:text-indigo-500 transition-colors" title="AI Model Activity: Active">
              <BrainCircuit className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </div>
            </div>
            
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            
            {/* Connection Quality & API Status */}
            <div className="flex items-center gap-1.5 group cursor-help" title={isOnline ? "API Status: OK | Connection: Excellent" : "API Status: Offline | Connection: Poor"}>
              <Server className={cn("h-3.5 w-3.5 transition-colors", isOnline ? "text-slate-400 group-hover:text-emerald-500" : "text-rose-500")} />
              <div className={cn("h-1.5 w-1.5 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]")} />
            </div>
            
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            
            {/* Language Selector */}
            <div className="flex items-center gap-1 group cursor-pointer hover:text-indigo-500 transition-colors" title="Language Selector">
              <Globe className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-500">EN</span>
            </div>
            
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            
            {/* Live Clock */}
            <div className="flex items-center font-mono text-[11px] text-slate-600 dark:text-slate-300 font-medium w-16" title="Current system time">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Theme Switcher */}
          <button 
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
          </button>
          
          {/* Notifications & Live Alerts */}
          <div className="relative">
            <button 
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5 group-hover:text-indigo-500 transition-colors" />
              <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="font-semibold text-sm">Notifications & Alerts</span>
                    <Badge variant="outline" className="text-[10px] py-0 text-indigo-500 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20">3 New</Badge>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {[
                      { title: 'Live Alert: Gate C Density High', time: 'Just now', type: 'alert' },
                      { title: 'AI Assistant: Route optimized', time: '5m ago', type: 'info' },
                      { title: 'Weather update: Rain expected', time: '12m ago', type: 'info' }
                    ].map((notif, i) => (
                      <div key={i} className="p-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 group/notif">
                        <div className="mt-0.5">
                          {notif.type === 'alert' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <ActivitySquare className="h-4 w-4 text-indigo-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover/notif:text-indigo-600 dark:group-hover/notif:text-indigo-400 transition-colors">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }} className="w-full p-2 text-xs font-medium text-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-t border-slate-100 dark:border-slate-800">
                    View all notifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative pl-1 md:pl-3 border-l border-slate-200/50 dark:border-slate-700/50 ml-1">
            <button 
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 md:p-1.5 md:pr-3 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group/profile"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
            >
              <div className="relative group-hover/profile:scale-105 transition-transform duration-300">
                <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
                  <User className="h-4 w-4" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-sm" />
              </div>
              <div className="hidden sm:flex flex-col items-start justify-center">
                <span className="text-sm font-semibold leading-none text-slate-900 dark:text-white">Amara</span>
                <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-widest font-bold">Ops Cmdr</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block ml-1 group-hover/profile:text-indigo-500 transition-colors" />
            </button>
            
            <AnimatePresence>
              {showProfile && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="font-semibold text-sm">Amara Singh</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">amara.s@stadium.gov</p>
                  </div>
                  <div className="p-1.5">
                    {['Profile Settings', 'Platform Settings', 'Help & Documentation', 'Sign out'].map((item) => (
                      <button 
                        key={item} 
                        onClick={() => {
                          if (item === 'Profile Settings') {
                            setActiveTab('profile');
                            setShowProfile(false);
                          }
                          if (item === 'Platform Settings') {
                            setActiveTab('settings');
                            setShowProfile(false);
                          }
                        }}
                        className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                        item === 'Sign out' 
                          ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 mt-1 border-t border-slate-100 dark:border-slate-800" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}>
                        {item}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
