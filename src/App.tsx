/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastProvider } from './hooks/useToast';
import { PipelineProvider } from './lib/LiveEventPipeline';
import { AuthFlow } from './components/auth/AuthFlow';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

import { UserProfile } from './components/profile/UserProfile';
import { SettingsCenter } from './components/settings/SettingsCenter';

import { NotificationHub } from './components/notifications/NotificationHub';

import { IncidentResponse } from './components/incident/IncidentResponse';
import { ExecutiveAnalytics } from './components/analytics/ExecutiveAnalytics';
import { FacilityAdmin } from './components/admin/FacilityAdmin';
import { SecurityCenter } from './components/dashboard/SecurityCenter';
import { StaffManagement } from './components/workforce/StaffManagement';
import { AIHistory } from './components/analytics/AIHistory';
import { InfrastructureMonitoring } from './components/system/InfrastructureMonitoring';

const CommandCenter = lazy(() => import('./components/dashboard/CommandCenter').then(m => ({ default: m.CommandCenter })));
const CrowdPulse = lazy(() => import('./components/dashboard/CrowdPulse').then(m => ({ default: m.CrowdPulse })));
const OpsCopilot = lazy(() => import('./components/dashboard/OpsCopilot').then(m => ({ default: m.OpsCopilot })));
const PolyglotConcierge = lazy(() => import('./components/dashboard/PolyglotConcierge').then(m => ({ default: m.PolyglotConcierge })));
const GreenOpsAdvisor = lazy(() => import('./components/dashboard/GreenOpsAdvisor').then(m => ({ default: m.GreenOpsAdvisor })));
const WayfinderAI = lazy(() => import('./components/dashboard/WayfinderAI').then(m => ({ default: m.WayfinderAI })));

const titles: Record<string, string> = {
  'overview': 'Stadium Overview',
  'crowd': 'Crowd Pulse Engine',
  'copilot': 'Ops Copilot',
  'polyglot': 'Polyglot Concierge',
  'greenops': 'Green Ops Advisor',
  'wayfinder': 'Wayfinder AI',
  'security': 'Security Command',
  'emergency': 'Emergency Response',
  'analytics': 'Intelligence Analytics',
};

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.title = titles[activeTab] || 'Antigravity Stadium Operations';
  }, [activeTab]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      // Delay state update to avoid synchronous set state warning during initial render cycle, though it's typically fine here
      setTimeout(() => setIsDark(true), 0);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-500 relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-indigo-600 focus:font-bold focus:rounded-md focus:shadow-md dark:focus:bg-slate-800 dark:focus:text-white">
        Skip to main content
      </a>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden w-full relative z-10">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          isDark={isDark}
          toggleTheme={toggleTheme} setActiveTab={setActiveTab}
          
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full max-w-[1600px] mx-auto"
            >
              <Suspense fallback={<LoadingFallback />}>
                {activeTab === 'overview' && <CommandCenter  />}
                {activeTab === 'crowd' && <CrowdPulse />}
                {activeTab === 'copilot' && <OpsCopilot />}
                {activeTab === 'guest' && <PolyglotConcierge />}
                {activeTab === 'greenops' && <GreenOpsAdvisor />}
                {activeTab === 'wayfinder' && <WayfinderAI  />}
                {activeTab === 'security' && <SecurityCenter />}
                {activeTab === 'profile' && <UserProfile />}
                {activeTab === 'settings' && <SettingsCenter />}
                {activeTab === 'notifications' && <NotificationHub />}
                {activeTab === 'emergency' && <IncidentResponse />}
                {activeTab === 'analytics' && <ExecutiveAnalytics />}
                {activeTab === 'admin' && <FacilityAdmin />}
                {activeTab === 'history' && <AIHistory />}
                {activeTab === 'health' && <InfrastructureMonitoring />}
                {activeTab === 'staff' && <StaffManagement />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <PipelineProvider>
      <ToastProvider>
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AuthFlow onAuthenticated={() => setIsAuthenticated(true)} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full">
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-black">Skip to main content</a>
              <DashboardContent />
            </motion.div>
          )}
        </AnimatePresence>
      </ToastProvider>
    </PipelineProvider>
  );
}
