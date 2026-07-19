import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Loader2, Volume2, Globe, Sparkles, Mic, MicOff, Send, QrCode, Map as MapIcon, Activity, ShieldAlert, Coffee, Ticket, Bot, User, Clock, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '@/src/lib/api';

import { useToast } from '@/src/hooks/useToast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  original?: string;
  content: string;
  targetLang: string;
  detectedLang?: string;
  intent?: string;
  timestamp: Date;
  confidence?: number;
}

const STORAGE_KEY = 'ssip_polyglot_history';
export function PolyglotConcierge() {
  const [input, setInput] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);
  const { addToast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); 

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isDetecting]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      
      const SpeechRecognition = (window as unknown).SpeechRecognition || (window as unknown).webkitSpeechRecognition;
      
      recognitionRef.current = new (SpeechRecognition as unknown)();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: unknown) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      
      recognitionRef.current.onerror = (event: unknown) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleTranslate = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    setInput('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsLoading(true);
    setIsDetecting(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString() + '_user',
      role: 'user',
      original: textToSend,
      content: textToSend, // Will update with translation once received
      targetLang,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);

    try {
      const historyPayload = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));
      const data = await ApiClient.translate(textToSend, targetLang, historyPayload);
      
      setTimeout(() => {
        setIsDetecting(false);
        // Update user message with translation and intent
        setMessages(prev => prev.map(m => 
          m.id === userMsg.id 
            ? { ...m, content: data.translatedText || textToSend, intent: data.intent, detectedLang: data.detectedLanguage, confidence: data.confidence } 
            : m
        ));

        if (data.recommendation) {
          const aiMsg: ChatMessage = {
            id: Date.now().toString() + '_ai',
            role: 'assistant',
            content: data.recommendation,
            targetLang,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      }, 800); // Fake delay for language detection animation
      
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Translation failed';
      addToast(msg, 'error');
      setIsDetecting(false);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const playTTS = (text: string, lang: string) => {
    if (!('speechSynthesis' in window)) {
      addToast('Text-to-speech not supported', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'Arabic': 'ar-SA',
      'Japanese': 'ja-JP',
      'English': 'en-US'
    };
    utterance.lang = langMap[lang] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const latestUserMessage = [...messages].reverse().find(m => m.role === 'user');

  return (
    <div className="grid gap-6 @4xl:grid-cols-3 h-full max-h-[85vh] @container">
      
      {/* Left: Chat Interface */}
      <Card className="@4xl:col-span-2 flex flex-col shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden h-full">
        <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-inner">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold tracking-tight text-xl">Polyglot Concierge</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mt-0.5">Live Universal Translator</span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
               <span className="text-xs font-semibold uppercase text-slate-500">Respond in:</span>
               <select 
                  className="h-8 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Arabic</option>
                  <option>Japanese</option>
                </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30 relative">
          <AnimatePresence>
            {messages.length === 0 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
                 <Globe className="h-16 w-16 opacity-20" />
                 <p className="text-base font-medium">Start typing or speaking in any language...</p>
                 <div className="flex flex-wrap justify-center gap-2 max-w-lg mt-4">
                   <Badge variant="outline" className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800 py-2 px-4 shadow-sm" onClick={() => handleTranslate('Where is my seat? Ticket: Block 102')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleTranslate('Where is my seat? Ticket: Block 102')}>Navigation Help</Badge>
                   <Badge variant="outline" className="cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-800 py-2 px-4 shadow-sm" onClick={() => handleTranslate('Can I order 2 hotdogs to my seat?')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleTranslate('Can I order 2 hotdogs to my seat?')}>Food Ordering</Badge>
                   <Badge variant="outline" className="cursor-pointer hover:bg-rose-50 dark:hover:bg-slate-800 py-2 px-4 shadow-sm" onClick={() => handleTranslate('Medical emergency, need help')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleTranslate('Medical emergency, need help')}>Emergency</Badge>
                   <Badge variant="outline" className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-800 py-2 px-4 shadow-sm" onClick={() => handleTranslate('Is there wheelchair access near Gate 4?')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleTranslate('Is there wheelchair access near Gate 4?')}>Accessibility</Badge>
                   <Badge variant="outline" className="cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 py-2 px-4 shadow-sm" onClick={() => handleTranslate('I lost my child near the west entrance')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleTranslate('I lost my child near the west entrance')}>Lost Child</Badge>
                 </div>
               </motion.div>
            )}
            
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border backdrop-blur-md",
                  msg.role === 'user' ? "bg-slate-900/80 text-white dark:bg-slate-100/90 dark:text-slate-900 border-slate-700/50 dark:border-white/20" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500/30"
                )}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                
                <div className={cn("space-y-1", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "p-5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed border backdrop-blur-md",
                    msg.role === 'user' 
                      ? "bg-slate-900 text-white rounded-tr-sm dark:bg-slate-800 border-slate-700/50" 
                      : "bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 rounded-tl-sm text-slate-800 dark:text-slate-200"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body prose prose-sm dark:prose-invert max-w-none font-sans">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                  
                  {msg.role === 'user' && msg.original && msg.original !== msg.content && (
                    <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500 font-medium mt-2 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full w-fit ml-auto">
                      <span className="italic truncate max-w-[200px]">"{msg.original}"</span>
                      {msg.detectedLang && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-white dark:bg-slate-700 shadow-sm">{msg.detectedLang}</Badge>}
                      {msg.confidence !== undefined && <Badge variant={msg.confidence > 80 ? "default" : "secondary"} className={`text-[9px] px-1.5 py-0 shadow-sm ${msg.confidence > 80 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{msg.confidence}% Conf</Badge>}
                      <Button size="icon" variant="ghost" className="h-5 w-5 hover:text-indigo-600" onClick={() => playTTS(msg.content, msg.targetLang)} aria-label="Play text-to-speech">
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                     <div className="flex items-center gap-2 mt-2 px-1">
                        <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-400 hover:text-indigo-500 px-2" onClick={() => playTTS(msg.content, msg.targetLang)}>
                          <Volume2 className="h-3.5 w-3.5 mr-1.5" /> Speak
                        </Button>
                     </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isDetecting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-900/80 text-white dark:bg-slate-100/90 dark:text-slate-900 flex items-center justify-center shrink-0 shadow-sm border border-slate-700/50 dark:border-white/20">
                  <User className="h-5 w-5" />
                </div>
                <div className="p-4 rounded-2xl rounded-tr-sm bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/50 flex flex-col gap-2 items-end">
                  <div className="flex gap-2 items-center text-xs text-slate-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Detecting language & translating...
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            {!isDetecting && isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[85%]"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex gap-1 items-center h-12 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-1" />
        </CardContent>

        <CardFooter className="border-t border-slate-200/50 dark:border-slate-800/50 p-4 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl relative z-10 flex-col gap-3 items-start">
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="w-full flex items-center justify-center gap-1 py-2 text-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <motion.div
                  key={i}
                  className="w-1 bg-indigo-500 rounded-full"
                  animate={{ height: ["8px", "24px", "8px"] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
              <span className="text-xs font-medium ml-3 animate-pulse text-slate-500">Listening...</span>
            </motion.div>
          )}
          
          <div className="flex w-full gap-2 relative">
            <Button size="icon" variant="outline" className="shrink-0 h-12 w-12 rounded-xl text-slate-500 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 shadow-sm" onClick={() => addToast('QR Scanner activated (Mock)', 'info')} aria-label="Scan QR Code">
              <QrCode className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative group">
               <textarea 
                 className="w-full h-12 py-3 px-4 rounded-xl border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/80 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm resize-none text-sm transition-all custom-scrollbar"
                placeholder={`Type or speak in any language to translate...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              size="icon"
              variant="outline"
              type="button"
              onClick={toggleListening} 
              className={cn("shrink-0 h-12 w-12 rounded-xl shadow-sm transition-all duration-300", isListening ? "bg-red-50 text-red-500 border-red-200 animate-pulse" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700")}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button 
              onClick={() => handleTranslate()} 
              className="shrink-0 h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:scale-95"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Right: Real-time Context Analysis & Timeline */}
      <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
        <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shrink-0">
          <CardHeader className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Live Intent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Detected Language</span>
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                {isDetecting ? (
                  <span className="animate-pulse text-indigo-400">Detecting...</span>
                ) : (
                  latestUserMessage?.detectedLang || '--'
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Intent Vector</span>
              <div className="flex items-center gap-2 min-h-[28px]">
                {isDetecting ? (
                  <span className="animate-pulse text-indigo-400 text-sm font-mono">ANALYZING...</span>
                ) : latestUserMessage?.intent ? (
                  <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-3 py-1 font-mono uppercase shadow-sm border border-indigo-100 dark:border-indigo-800">
                    {latestUserMessage.intent}
                  </Badge>
                ) : (
                  <span className="text-sm font-mono text-slate-500">AWAITING_INPUT</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {latestUserMessage?.intent && !isDetecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0"
          >
             <Card className="shadow-lg border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 backdrop-blur-xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Activity className="h-24 w-24" />
               </div>
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2">
                    Action Recommendations
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3 relative z-10 pt-2">
                 
                 {(latestUserMessage.intent.toLowerCase().includes('nav') || latestUserMessage.intent.toLowerCase().includes('where') || latestUserMessage.intent.toLowerCase().includes('park')) && (
                   <Button variant="default" className="w-full justify-start bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 shadow-sm h-auto py-3">
                     <MapIcon className="h-5 w-5 mr-3" />
                     <div className="text-left">
                       <div className="font-semibold text-sm">Launch Wayfinder Route</div>
                       <div className="text-xs opacity-80 font-normal mt-0.5">Push turn-by-turn map to user</div>
                     </div>
                   </Button>
                 )}
                 
                 {(latestUserMessage.intent.toLowerCase().includes('food') || latestUserMessage.intent.toLowerCase().includes('order') || latestUserMessage.intent.toLowerCase().includes('restaurant')) && (
                   <Button variant="default" className="w-full justify-start bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 shadow-sm h-auto py-3">
                     <Coffee className="h-5 w-5 mr-3" />
                     <div className="text-left">
                       <div className="font-semibold text-sm">Open Express Menu</div>
                       <div className="text-xs opacity-80 font-normal mt-0.5">Show nearby vendors in {targetLang}</div>
                     </div>
                   </Button>
                 )}
                 
                 {latestUserMessage.intent.toLowerCase().includes('ticket') && (
                   <Button variant="default" className="w-full justify-start bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 shadow-sm h-auto py-3">
                     <Ticket className="h-5 w-5 mr-3" />
                     <div className="text-left">
                       <div className="font-semibold text-sm">Verify Seat Block</div>
                       <div className="text-xs opacity-80 font-normal mt-0.5">Scan ticket barcode QR</div>
                     </div>
                   </Button>
                 )}

                 {(latestUserMessage.intent.toLowerCase().includes('access') || latestUserMessage.intent.toLowerCase().includes('wheelchair')) && (
                   <Button variant="default" className="w-full justify-start bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/30 shadow-sm h-auto py-3">
                     <CheckCircle2 className="h-5 w-5 mr-3" />
                     <div className="text-left">
                       <div className="font-semibold text-sm">Accessibility Support</div>
                       <div className="text-xs opacity-80 font-normal mt-0.5">Show accessible routes & seating</div>
                     </div>
                   </Button>
                 )}
                 
                 {(latestUserMessage.intent.toLowerCase().includes('emerg') || latestUserMessage.intent.toLowerCase().includes('medical') || latestUserMessage.intent.toLowerCase().includes('lost')) && (
                   <Button variant="default" className="w-full justify-start bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 shadow-sm h-auto py-3 group">
                     <ShieldAlert className="h-5 w-5 mr-3 group-hover:animate-pulse" />
                     <div className="text-left">
                       <div className="font-semibold text-sm">Dispatch Security/Medical</div>
                       <div className="text-xs opacity-80 font-normal mt-0.5">Send alert to nearest stewards</div>
                     </div>
                   </Button>
                 )}
                 
               </CardContent>
             </Card>
          </motion.div>
        )}

        {/* Conversation Timeline */}
        {messages.length > 0 && (
          <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex-1 min-h-[200px]">
             <CardHeader className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Conversation Timeline
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-4 space-y-4 relative">
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                {messages.map((msg) => (
                  <div key={`timeline-${msg.id}`} className="flex gap-4 items-start relative z-10">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 text-[10px]",
                      msg.role === 'user' ? "bg-slate-800 text-white" : "bg-indigo-500 text-white"
                    )}>
                      {msg.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className="flex-1 pt-1">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                           {msg.role === 'user' ? 'Visitor Request' : 'Concierge Response'}
                         </span>
                         <span className="text-[10px] text-slate-400">
                           {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                         </span>
                       </div>
                       <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                         {msg.role === 'user' ? msg.original : msg.content}
                       </div>
                    </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
