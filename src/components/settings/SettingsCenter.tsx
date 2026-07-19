import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Layout, Bell, Shield, Eye, BrainCircuit, 
  Link as LinkIcon, Accessibility, Terminal, Building2, 
  ClipboardList, Server, Search, Star, Undo2, CheckCircle2,
  Monitor, Smartphone, ShieldCheck
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

const SECTIONS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Eye },
  { id: 'dashboard', label: 'Dashboard', icon: Layout },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { id: 'ai', label: 'AI Configuration', icon: BrainCircuit },
  { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'api', label: 'API & Webhooks', icon: Terminal },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
  { id: 'system', label: 'System', icon: Server },
];

interface SettingProps { label: string; desc: string; recommended?: string | boolean; value: unknown; onChange: (val: unknown) => void; isFavorite?: boolean; toggleFavorite?: () => void; options?: {value: string, label: string}[]; }

function SettingToggle({ label, desc, recommended, value, onChange, isFavorite, toggleFavorite }: SettingProps) {
  const [showSaved, setShowSaved] = useState(false);
  
  const handleChange = () => {
    onChange(!value);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="group relative flex items-start justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all shadow-sm">
      <div className="flex-1 pr-6">
        <div className="flex items-center gap-2 mb-1">
          <button type="button" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer text-left hover:opacity-80" onClick={handleChange}>{label}</button>
          {recommended && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">Recommended: {recommended ? 'On' : 'Off'}</Badge>}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <AnimatePresence>
          {showSaved && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </motion.div>
          )}
        </AnimatePresence>
        
        <button onClick={handleChange} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>

        <button onClick={toggleFavorite} className="text-slate-400 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}

function SettingSelect({ label, desc, options = [], value, onChange, recommended, isFavorite, toggleFavorite }: SettingProps) {
  const [showSaved, setShowSaved] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrevValue(value);
    onChange(e.target.value);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleUndo = () => {
    onChange(prevValue);
    setShowSaved(false);
  };

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all shadow-sm gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-bold text-slate-900 dark:text-white">{label}</label>
          {recommended && <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800">Rec: {recommended}</Badge>}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{desc}</p>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <AnimatePresence>
          {showSaved && (
            <motion.button onClick={handleUndo} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Undo2 className="h-3 w-3" /> Undo
            </motion.button>
          )}
        </AnimatePresence>

        <select 
          value={value as string} 
          onChange={handleChange}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48"
        >
          {options.map((opt: {value: string, label: string}) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button onClick={toggleFavorite} className="text-slate-400 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export function SettingsCenter() {
  const [activeSection, setActiveSection] = useState('appearance');
  const [search, setSearch] = useState('');
  
  // Settings State Maps
  const [settings, setSettings] = useState<Record<string, unknown>>({
    darkTheme: 'auto',
    accent: 'indigo',
    density: 'comfortable',
    animations: true,
    widgetSpacing: 'normal',
    typography: 'inter',
    
    aiModel: 'gemini-1.5-pro',
    verbosity: 'concise',
    streaming: true,
    aiMemory: true,
    suggestions: true,
    confidence: '0.8',
    
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    slackNotif: true,
    teamsNotif: false,
    emergency: true,
    quietHours: false,
    
    deviceApproval: true,
  });

  const [favorites, setFavorites] = useState<string[]>([]);

  const handleSettingChange = (key: string, val: unknown) => {
    setSettings((s: Record<string, unknown>) => ({ ...s, [key]: val }));
  };

  const toggleFavorite = (key: string) => {
    setFavorites(f => f.includes(key) ? f.filter(k => k !== key) : [...f, key]);
  };

  const isFav = (key: string) => favorites.includes(key);

  const sectionsRender: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Dashboard Configuration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage widget layouts, default views, and data docking.</p>
        </div>
        
        <div className="space-y-4">
          <SettingSelect 
            label="Default Layout" desc="Which dashboard layout to load upon first sign-in." recommended="Command Center"
            value={settings.defaultLayout || 'command'} onChange={(v: unknown) => handleSettingChange('defaultLayout', v)}
            options={[{value: 'command', label: 'Command Center'}, {value: 'map', label: 'Overview Map'}, {value: 'analytics', label: 'Analytics'}]}
            isFavorite={isFav('defaultLayout')} toggleFavorite={() => toggleFavorite('defaultLayout')}
          />
          <SettingToggle
            label="Dock Widgets" desc="Allow widgets to automatically snap to grid during layout editing." recommended={true}
            value={settings.docking || true} onChange={(v: unknown) => handleSettingChange('docking', v)}
            isFavorite={isFav('docking')} toggleFavorite={() => toggleFavorite('docking')}
          />
          <SettingToggle
            label="Widget Management" desc="Allow users to add, remove, and resize widgets freely." recommended={true}
            value={settings.widgetManagement || true} onChange={(v: unknown) => handleSettingChange('widgetManagement', v)}
            isFavorite={isFav('widgetManagement')} toggleFavorite={() => toggleFavorite('widgetManagement')}
          />
          <SettingSelect 
            label="Saved Layouts" desc="Select a pre-configured template from your saved presets."
            value={settings.savedLayouts || 'none'} onChange={(v: unknown) => handleSettingChange('savedLayouts', v)}
            options={[{value: 'none', label: 'No Preset'}, {value: 'morning', label: 'Morning Ops'}, {value: 'gameday', label: 'Gameday Max'}, {value: 'night', label: 'Night Watch'}]}
            isFavorite={isFav('savedLayouts')} toggleFavorite={() => toggleFavorite('savedLayouts')}
          />
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
             <div className="flex justify-between items-center">
                <div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white">Reset Layout Configuration</div>
                   <div className="text-xs text-slate-500">Restore the dashboard to factory default settings.</div>
                </div>
                <button className="text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-400 px-4 py-2 rounded-lg transition-colors">Reset Layout</button>
             </div>
          </div>
        </div>
      </div>
    ),

    appearance: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Appearance Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage the visual identity and layout structure of your platform.</p>
        </div>
        
        <div className="space-y-4">
          <SettingSelect 
            label="Color Theme" desc="Select your preferred color scheme." recommended="System Auto"
            value={settings.darkTheme} onChange={(v: unknown) => handleSettingChange('darkTheme', v)}
            options={[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}, {value: 'auto', label: 'System Auto'}]}
            isFavorite={isFav('darkTheme')} toggleFavorite={() => toggleFavorite('darkTheme')}
          />
          <SettingSelect 
            label="Accent Color" desc="Primary color used for highlights, buttons, and active states." recommended="Indigo"
            value={settings.accent} onChange={(v: unknown) => handleSettingChange('accent', v)}
            options={[{value: 'indigo', label: 'Indigo'}, {value: 'emerald', label: 'Emerald'}, {value: 'rose', label: 'Rose'}, {value: 'amber', label: 'Amber'}]}
            isFavorite={isFav('accent')} toggleFavorite={() => toggleFavorite('accent')}
          />
          <SettingSelect 
            label="Layout Density" desc="Controls the padding and margins of data grids and widgets." recommended="Comfortable"
            value={settings.density} onChange={(v: unknown) => handleSettingChange('density', v)}
            options={[{value: 'compact', label: 'Compact'}, {value: 'comfortable', label: 'Comfortable'}, {value: 'spacious', label: 'Spacious'}]}
            isFavorite={isFav('density')} toggleFavorite={() => toggleFavorite('density')}
          />
          <SettingSelect 
            label="Widget Spacing" desc="Gap between dashboard and grid elements." recommended="Normal"
            value={settings.widgetSpacing} onChange={(v: unknown) => handleSettingChange('widgetSpacing', v)}
            options={[{value: 'tight', label: 'Tight'}, {value: 'normal', label: 'Normal'}, {value: 'loose', label: 'Loose'}]}
            isFavorite={isFav('widgetSpacing')} toggleFavorite={() => toggleFavorite('widgetSpacing')}
          />
          <SettingSelect 
            label="Typography" desc="Base font family for the application." recommended="Inter"
            value={settings.typography} onChange={(v: unknown) => handleSettingChange('typography', v)}
            options={[{value: 'inter', label: 'Inter (Sans)'}, {value: 'roboto', label: 'Roboto'}, {value: 'system', label: 'System Default'}]}
            isFavorite={isFav('typography')} toggleFavorite={() => toggleFavorite('typography')}
          />
          <SettingToggle
            label="Enable UI Animations" desc="Toggles micro-interactions and transition effects across the app." recommended={true}
            value={settings.animations} onChange={(v: unknown) => handleSettingChange('animations', v)}
            isFavorite={isFav('animations')} toggleFavorite={() => toggleFavorite('animations')}
          />
        </div>
      </div>
    ),
    ai: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">AI Configuration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tune the intelligence and responsiveness of the Copilot system.</p>
        </div>
        
        <div className="space-y-4">
          <SettingSelect 
            label="Core AI Model" desc="The primary generative engine used for analytics and natural language processing." recommended="Gemini 1.5 Pro"
            value={settings.aiModel} onChange={(v: unknown) => handleSettingChange('aiModel', v)}
            options={[{value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Max Reasoning)'}, {value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fastest)'}]}
            isFavorite={isFav('aiModel')} toggleFavorite={() => toggleFavorite('aiModel')}
          />
          <SettingSelect 
            label="Response Verbosity" desc="Determines how detailed the AI's explanations will be." recommended="Concise"
            value={settings.verbosity} onChange={(v: unknown) => handleSettingChange('verbosity', v)}
            options={[{value: 'concise', label: 'Concise & Actionable'}, {value: 'detailed', label: 'Detailed Explanations'}]}
            isFavorite={isFav('verbosity')} toggleFavorite={() => toggleFavorite('verbosity')}
          />
          <SettingToggle
            label="Stream Responses" desc="Shows AI text as it is generated for lower perceived latency." recommended={true}
            value={settings.streaming} onChange={(v: unknown) => handleSettingChange('streaming', v)}
            isFavorite={isFav('streaming')} toggleFavorite={() => toggleFavorite('streaming')}
          />
          <SettingToggle
            label="Contextual Memory" desc="Allows the AI to remember recent queries within the session to provide better follow-ups." recommended={true}
            value={settings.aiMemory} onChange={(v: unknown) => handleSettingChange('aiMemory', v)}
            isFavorite={isFav('aiMemory')} toggleFavorite={() => toggleFavorite('aiMemory')}
          />
          <SettingToggle
            label="Proactive Suggestions" desc="AI will suggest prompts and actions based on current view." recommended={true}
            value={settings.suggestions} onChange={(v: unknown) => handleSettingChange('suggestions', v)}
            isFavorite={isFav('suggestions')} toggleFavorite={() => toggleFavorite('suggestions')}
          />
          <SettingSelect 
            label="Action Confidence Threshold" desc="Minimum certainty required before the AI suggests automated operational actions." recommended="0.80"
            value={settings.confidence} onChange={(v: unknown) => handleSettingChange('confidence', v)}
            options={[{value: '0.6', label: '0.60 (Aggressive)'}, {value: '0.8', label: '0.80 (Balanced)'}, {value: '0.95', label: '0.95 (Conservative)'}]}
            isFavorite={isFav('confidence')} toggleFavorite={() => toggleFavorite('confidence')}
          />
        </div>
      </div>
    ),
    notifications: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Notification Routing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure how and when you receive operational alerts.</p>
        </div>
        
        <div className="space-y-4">
          <SettingToggle
            label="Emergency Broadcasts" desc="Bypasses all rules to deliver critical safety and security alerts immediately." recommended={true}
            value={settings.emergency} onChange={(v: unknown) => handleSettingChange('emergency', v)}
            isFavorite={isFav('emergency')} toggleFavorite={() => toggleFavorite('emergency')}
          />
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
          <SettingToggle
            label="Push Notifications" desc="Browser and mobile app push notifications for standard alerts." recommended={true}
            value={settings.pushNotif} onChange={(v: unknown) => handleSettingChange('pushNotif', v)}
            isFavorite={isFav('pushNotif')} toggleFavorite={() => toggleFavorite('pushNotif')}
          />
          <SettingToggle
            label="Slack Integration" desc="Route notifications to linked Slack channels."
            value={settings.slackNotif} onChange={(v: unknown) => handleSettingChange('slackNotif', v)}
            isFavorite={isFav('slackNotif')} toggleFavorite={() => toggleFavorite('slackNotif')}
          />
          <SettingToggle
            label="Microsoft Teams" desc="Route notifications to linked Teams channels."
            value={settings.teamsNotif} onChange={(v: unknown) => handleSettingChange('teamsNotif', v)}
            isFavorite={isFav('teamsNotif')} toggleFavorite={() => toggleFavorite('teamsNotif')}
          />
          <SettingSelect 
            label="Escalation Rules" desc="Action taken if an alert is unacknowledged for 15 minutes." recommended="Manager"
            value={settings.escalation || 'manager'} onChange={(v: unknown) => handleSettingChange('escalation', v)}
            options={[{value: 'none', label: 'No Escalation'}, {value: 'manager', label: 'Alert Manager'}, {value: 'all', label: 'Alert All On-Duty'}]}
            isFavorite={isFav('escalation')} toggleFavorite={() => toggleFavorite('escalation')}
          />
          <SettingToggle
            label="Email Digest" desc="Receive a daily digest and critical alerts via email."
            value={settings.emailNotif} onChange={(v: unknown) => handleSettingChange('emailNotif', v)}
            isFavorite={isFav('emailNotif')} toggleFavorite={() => toggleFavorite('emailNotif')}
          />
          <SettingToggle
            label="SMS Alerts" desc="Text message delivery for high-priority incidents."
            value={settings.smsNotif} onChange={(v: unknown) => handleSettingChange('smsNotif', v)}
            isFavorite={isFav('smsNotif')} toggleFavorite={() => toggleFavorite('smsNotif')}
          />
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
          <SettingToggle
            label="Quiet Hours" desc="Suppress non-emergency notifications during scheduled offline times."
            value={settings.quietHours} onChange={(v: unknown) => handleSettingChange('quietHours', v)}
            isFavorite={isFav('quietHours')} toggleFavorite={() => toggleFavorite('quietHours')}
          />
        </div>
      </div>
    ),
    security: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Security Controls</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage authentication, access policies, and session security.</p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
             <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Account Password</div>
                <div className="text-xs text-slate-500">Last changed 45 days ago.</div>
             </div>
             <button className="text-xs font-medium text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">Change Password</button>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
             <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">API Keys</div>
                <div className="text-xs text-slate-500">Manage programmable access tokens.</div>
             </div>
             <button className="text-xs font-medium text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">Manage Keys</button>
          </div>
          <SettingToggle
            label="New Device Approval" desc="Require email verification when logging in from an unrecognized device." recommended={true}
            value={settings.deviceApproval} onChange={(v: unknown) => handleSettingChange('deviceApproval', v)}
            isFavorite={isFav('deviceApproval')} toggleFavorite={() => toggleFavorite('deviceApproval')}
          />
          
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
             <div className="flex justify-between items-center mb-4">
                <div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white">Active Sessions</div>
                   <div className="text-xs text-slate-500">Manage devices currently logged into your account.</div>
                </div>
                <button className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 px-3 py-1.5 rounded-lg transition-colors">Terminate All</button>
             </div>
             <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <Monitor className="h-5 w-5 text-indigo-500" />
                   <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">MacBook Pro (Current)</div>
                      <div className="text-xs text-slate-500">New York, US • Chrome 120</div>
                   </div>
                   <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-none">Active</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <Smartphone className="h-5 w-5 text-slate-400" />
                   <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">iPhone 14 Pro</div>
                      <div className="text-xs text-slate-500">New York, US • Safari Mobile</div>
                   </div>
                   <button className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Revoke</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    )
  };

  const renderContent = () => {
    if (sectionsRender[activeSection]) {
      return sectionsRender[activeSection];
    }
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Module Offline</h3>
        <p className="text-sm text-slate-500 max-w-sm">This configuration section is currently under maintenance. Please check back later.</p>
      </div>
    );
  };

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 pb-20">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        <nav className="flex flex-col gap-1 custom-scrollbar overflow-y-auto max-h-[calc(100vh-200px)]">
          {SECTIONS.filter(s => s.label.toLowerCase().includes(search.toLowerCase())).map(section => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <section.icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {section.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden min-h-[600px]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

// Add missing ShieldCheck import from lucide-react (Added above)
