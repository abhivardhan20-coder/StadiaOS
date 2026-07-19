import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Search, Download, Pin, Play, MessageSquare, 
  Clock, CheckCircle2, ChevronRight, X, ThumbsUp, ThumbsDown,
  Bookmark, Zap, Filter
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

interface Interaction {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  confidence: number;
  executionTime: number; // in ms
  systems: string[];
  userFeedback: 'positive' | 'negative' | 'none';
  isBookmarked: boolean;
  isPinned: boolean;
}

const MOCK_INTERACTIONS: Interaction[] = [
  {
    id: 'ai-1',
    timestamp: '2026-07-17T09:42:15Z',
    prompt: 'Reroute staff from North Concourse to South Gate to handle the crowd surge.',
    response: 'Staff rerouted successfully. 12 security personnel and 5 guest services staff have been dispatched to South Gate. Estimated arrival time: 4 minutes.',
    confidence: 98.5,
    executionTime: 450,
    systems: ['Workforce Management', 'Crowd Intelligence', 'Notifications'],
    userFeedback: 'positive',
    isBookmarked: false,
    isPinned: true
  },
  {
    id: 'ai-2',
    timestamp: '2026-07-17T09:15:22Z',
    prompt: 'What is the current wait time at Premium Dining?',
    response: 'The current wait time at Premium Dining is approximately 25 minutes. Capacity is at 85%. Would you like me to send a notification to guests in the VIP lounge?',
    confidence: 95.0,
    executionTime: 320,
    systems: ['Facility Admin', 'IoT Sensors'],
    userFeedback: 'none',
    isBookmarked: true,
    isPinned: false
  },
  {
    id: 'ai-3',
    timestamp: '2026-07-17T08:30:10Z',
    prompt: 'Analyze yesterday\'s energy usage peak and suggest optimizations.',
    response: 'Yesterday\'s peak occurred at 19:00 (4.2MW). This correlates with the main event start. Suggested optimizations: 1. Pre-cool the arena by 2°C between 15:00-17:00 (estimated savings: 5%). 2. Dim concourse lighting to 70% during the main event (estimated savings: 2%).',
    confidence: 88.2,
    executionTime: 1250,
    systems: ['Sustainability', 'Analytics'],
    userFeedback: 'positive',
    isBookmarked: false,
    isPinned: false
  },
  {
    id: 'ai-4',
    timestamp: '2026-07-17T08:05:00Z',
    prompt: 'Unlock all turnstiles at Gate A.',
    response: 'Action requires manual authorization from a Security Supervisor. I have sent an authorization request to James Wilson.',
    confidence: 99.9,
    executionTime: 150,
    systems: ['Security', 'Access Control'],
    userFeedback: 'none',
    isBookmarked: false,
    isPinned: true
  },
  {
    id: 'ai-5',
    timestamp: '2026-07-17T07:45:33Z',
    prompt: 'Find Dr. Emily Chen.',
    response: 'Dr. Emily Chen is currently on duty at Medical Station A. Her status is Available.',
    confidence: 97.4,
    executionTime: 210,
    systems: ['Workforce Management', 'Location Services'],
    userFeedback: 'positive',
    isBookmarked: false,
    isPinned: false
  }
];

export function AIHistory() {
  const [interactions, setInteractions] = useState<Interaction[]>(MOCK_INTERACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'pinned' | 'bookmarked'>('all');

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = interaction.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          interaction.response.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'pinned') return interaction.isPinned;
    if (filter === 'bookmarked') return interaction.isBookmarked;
    return true;
  });

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setInteractions(prev => prev.map(i => i.id === id ? { ...i, isPinned: !i.isPinned } : i));
    if (selectedInteraction?.id === id) {
      setSelectedInteraction(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
    }
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setInteractions(prev => prev.map(i => i.id === id ? { ...i, isBookmarked: !i.isBookmarked } : i));
    if (selectedInteraction?.id === id) {
      setSelectedInteraction(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const setFeedback = (id: string, feedback: 'positive' | 'negative') => {
    setInteractions(prev => prev.map(i => i.id === id ? { ...i, userFeedback: i.userFeedback === feedback ? 'none' : feedback } : i));
    if (selectedInteraction?.id === id) {
      setSelectedInteraction(prev => prev ? { ...prev, userFeedback: prev.userFeedback === feedback ? 'none' : feedback } : null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col gap-6 pb-20 overflow-hidden relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            AI Interaction History
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review, replay, and manage your Copilot interactions.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              aria-label="Search history"
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <button className="flex-shrink-0 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2 font-medium text-sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'pinned', 'bookmarked'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === f 
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {f === 'all' && <Filter className="h-4 w-4" />}
            {f === 'pinned' && <Pin className="h-4 w-4" />}
            {f === 'bookmarked' && <Bookmark className="h-4 w-4" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Interaction List */}
        <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            <AnimatePresence>
              {filteredInteractions.map((interaction, idx) => (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedInteraction(interaction)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedInteraction(interaction);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                    selectedInteraction?.id === interaction.id
                      ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-slate-900 dark:text-white truncate pr-4">
                        {interaction.prompt}
                      </div>
                      <div className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0 flex items-center gap-2">
                        {interaction.isPinned && <Pin className="h-3 w-3 text-indigo-500 fill-indigo-500" />}
                        {formatTime(interaction.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {interaction.response}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="outline" className="bg-white dark:bg-slate-900 font-mono text-slate-500">
                        {interaction.confidence}% Conf
                      </Badge>
                      <Badge variant="outline" className="bg-white dark:bg-slate-900 font-mono text-slate-500">
                        {interaction.executionTime}ms
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredInteractions.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  No interactions found.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Interaction Details Side Panel */}
        <AnimatePresence>
          {selectedInteraction && (
            <motion.div
              initial={{ x: '100%', opacity: 0, width: 0 }}
              animate={{ x: 0, opacity: 1, width: '400px' }}
              exit={{ x: '100%', opacity: 0, width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg flex flex-col z-10 overflow-hidden hidden md:flex"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Details
                </h3>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => toggleBookmark(e, selectedInteraction.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedInteraction.isBookmarked 
                        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/20' 
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    aria-label={selectedInteraction.isBookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <Bookmark className={`h-4 w-4 ${selectedInteraction.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => togglePin(e, selectedInteraction.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedInteraction.isPinned 
                        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/20' 
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    aria-label={selectedInteraction.isPinned ? "Unpin" : "Pin"}
                  >
                    <Pin className={`h-4 w-4 ${selectedInteraction.isPinned ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => setSelectedInteraction(null)} 
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-2"
                    aria-label="Close details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* User Prompt */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">US</div>
                    User Prompt
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none text-slate-900 dark:text-white text-sm border border-slate-200 dark:border-slate-700/50">
                    {selectedInteraction.prompt}
                  </div>
                </div>

                {/* AI Response */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    Copilot Response
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl rounded-tl-none text-slate-900 dark:text-white text-sm border border-indigo-100 dark:border-indigo-500/20 leading-relaxed">
                    {selectedInteraction.response}
                  </div>
                </div>

                {/* Execution Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Confidence Score</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${selectedInteraction.confidence > 95 ? 'text-emerald-500' : 'text-amber-500'}`} />
                      {selectedInteraction.confidence}%
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Execution Time</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-500" />
                      {selectedInteraction.executionTime}ms
                    </div>
                  </div>
                </div>

                {/* Referenced Systems */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Referenced Systems</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInteraction.systems.map(sys => (
                      <Badge key={sys} variant="secondary" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {sys}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Feedback</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFeedback(selectedInteraction.id, 'positive')}
                      className={`p-2 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
                        selectedInteraction.userFeedback === 'positive'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${selectedInteraction.userFeedback === 'positive' ? 'fill-current' : ''}`} />
                      Helpful
                    </button>
                    <button 
                      onClick={() => setFeedback(selectedInteraction.id, 'negative')}
                      className={`p-2 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
                        selectedInteraction.userFeedback === 'negative'
                          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsDown className={`h-4 w-4 ${selectedInteraction.userFeedback === 'negative' ? 'fill-current' : ''}`} />
                      Not Helpful
                    </button>
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Play className="h-4 w-4" /> Replay
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  <ChevronRight className="h-4 w-4" /> Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
