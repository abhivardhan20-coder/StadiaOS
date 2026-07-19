import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Bot, User, Send, Zap, Sparkles, Terminal, Activity, Mic, MicOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LiveContext, Message } from '@/src/types';
import { useLivePipeline } from '@/src/lib/LiveEventPipeline';
import { ApiClient } from '@/src/lib/api';
import { useToast } from '@/src/hooks/useToast';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const STORAGE_KEY = 'ssip_ops_copilot_history';
export function OpsCopilot() {
  const { data } = useLivePipeline('stadiumLive', () => ApiClient.getStadiumLive(), 4000);
  const liveContext: LiveContext | undefined = (data as unknown as { liveContext?: LiveContext })?.liveContext;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [
      {
        id: '1',
        role: 'assistant',
        content: 'System initialized. I am Ops Copilot. I have access to real-time crowd telemetry, weather data, and transit feeds. How can I assist you with stadium operations?',
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null); 
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    if (!(overrideInput || input).trim() || isLoading) return;
    
    const textToSend = overrideInput || input;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsListening(false);
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    
    setIsLoading(true);

    const assistantMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/ops-copilot', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: textToSend,
          context: liveContext
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMsgId 
                  ? { ...msg, content: msg.content + parsed.text } 
                  : msg
              ));
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error communicating with AI services.';
      addToast(msg, 'error');
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, content: 'Error communicating with AI services. Please try again.' } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full max-h-[85vh] @container">
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/50 dark:border-slate-800/50 shadow-lg bg-slate-50/50 dark:bg-slate-900/30">
        <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl shrink-0">
          <CardTitle className="flex items-center gap-2 font-display text-lg drop-shadow-md">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Antigravity Ops Copilot
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Natural language stadium control interface.</p>
        </CardHeader>
        <CardContent role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className={cn("flex gap-4 max-w-[85%] @2xl:max-w-[80%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn(
                  "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-md border backdrop-blur-md", 
                  msg.role === 'user' 
                    ? "bg-slate-900/80 text-white dark:bg-slate-100/90 dark:text-slate-900 border-slate-700/50 dark:border-white/20" 
                    : "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/30"
                )}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "rounded-2xl p-5 text-sm shadow-sm backdrop-blur-md border", 
                  msg.role === 'user' 
                    ? "bg-slate-900 text-white rounded-tr-sm dark:bg-slate-800 border-slate-700/50" 
                    : "bg-white/80 dark:bg-slate-900/80 rounded-tl-sm border-slate-200/50 dark:border-slate-700/50 shadow-indigo-500/5"
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body prose prose-sm dark:prose-invert max-w-none font-sans">
                      {msg.content === '' ? (
                        <div className="flex space-x-1 h-5 items-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        </div>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean, node?: unknown }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              if (!inline && match) {
                                const type = match[1];
                                if (type === 'chart') {
                                  try {
                                    const data = JSON.parse(String(children).replace(/\n$/, ''));
                                    return (
                                      <div className="h-64 w-full mt-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    );
                                  } catch { /* ignore */ }
                                } else if (type === 'timeline') {
                                  try {
                                    const data = JSON.parse(String(children).replace(/\n$/, ''));
                                    return (
                                      <div className="mt-4 border-l-2 border-indigo-200 dark:border-indigo-800 ml-3 pl-4 space-y-4">
                                        {data.map((item: { type: string, time: string, title: string, description?: string }, i: number) => (
                                          <div className="relative pt-1 pl-4 pb-2 border-l-2 border-slate-100 dark:border-slate-800">
                                            <div className={cn("absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center", 
                                              item.type === 'critical' ? 'bg-red-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                                            )}>
                                              <span className="sr-only">{item.type}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 mb-0.5">{item.time}</div>
                                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</div>
                                            {item.description && <div className="text-xs text-slate-500 mt-1">{item.description}</div>}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  } catch { /* ignore */ }
                                } else if (type === 'map') {
                                  try {
                                    const data = JSON.parse(String(children).replace(/\n$/, ''));
                                    return (
                                      <div className="h-48 w-full mt-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                        {data.map((point: { x: number, y: number, intensity: string, label: string }, i: number) => (
                                          <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                                            <div className={cn("h-4 w-4 rounded-full animate-ping absolute opacity-50", point.intensity === 'high' ? 'bg-red-500' : point.intensity === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500')}></div>
                                            <div className={cn("h-3 w-3 rounded-full relative z-10 border-2 border-white shadow-sm flex items-center justify-center", point.intensity === 'high' ? 'bg-red-500' : point.intensity === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500')}>
                                              <span className="sr-only">{point.intensity}</span>
                                            </div>
                                            <div className="text-[9px] font-bold mt-1 bg-white/90 dark:bg-slate-800/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap border border-slate-200 dark:border-slate-700">{point.label}</div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  } catch { /* ignore */ }
                                }
                              }
                              return <code className={className} {...props}>{children}</code>;
                            },
                            table: ({ ...props }) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse text-sm" {...props} /></div>,
                            th: ({ ...props }) => <th className="border-b border-slate-200 dark:border-slate-700 py-2 px-3 font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50" {...props} />,
                            td: ({ ...props }) => <td className="border-b border-slate-100 dark:border-slate-800 py-2 px-3 text-slate-600 dark:text-slate-300" {...props} />,
                            a: ({ href, children, ...props }) => {
                              if (href?.startsWith('action:')) {
                                return (
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md block w-fit"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      addToast(`Executing action: ${children}`, 'success');
                                    }}
                                  >
                                    <Zap className="h-3.5 w-3.5 mr-2" />
                                    {children}
                                  </Button>
                                );
                              }
                              return <a href={href} className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props}>{children}</a>;
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </CardContent>
        <CardFooter className="border-t border-slate-200/50 dark:border-slate-800/50 p-4 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl relative z-10 flex-col gap-3 items-start">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 w-full max-w-full">
            {[
              "Show Gate 7 issues",
              "Predict halftime congestion",
              "Locate nearest medical team",
              "Open Camera 12",
              "Generate evacuation route"
            ].map((suggestion, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="cursor-pointer whitespace-nowrap bg-white/60 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setInput('');
                    handleSend(suggestion);
                  }
                }}
                onClick={() => {
                  setInput('');
                  handleSend(suggestion);
                }}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
          <div className="flex w-full gap-2 relative group/input">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Terminal className="h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
            </div>
            <Input 
              placeholder="Ask about crowd management, transit delays, or generate an incident report..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              className="pl-12 pr-24 py-6 rounded-xl shadow-inner bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-base font-medium placeholder:font-normal placeholder:text-slate-400 transition-all duration-300"
            />
            <Button 
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              size="icon"
              variant="outline"
              type="button"
              onClick={toggleListening} 
              className={cn("absolute right-12 top-1.5 rounded-lg h-9 w-9 shadow-sm transition-all duration-300", isListening ? "bg-red-50 text-red-500 border-red-200 animate-pulse" : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 border-slate-200 dark:border-slate-700")}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              aria-label="Send message"
              size="icon"
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 top-1.5 rounded-lg h-9 w-9 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all duration-300 disabled:opacity-50 disabled:scale-95"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="space-y-6 hidden @2xl:flex @2xl:flex-col h-full w-[350px]">
        <Card className="shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 flex-shrink-0">
          <CardHeader className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Live RAG Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md shrink-0">
                <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xs w-full">
                <span className="font-semibold block mb-1 text-slate-900 dark:text-slate-200">Crowd Pulse Engine</span>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-mono mt-1 border-t border-slate-200/50 dark:border-slate-700/50 pt-1">
                  <span>Occupancy:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">{liveContext?.totalOccupancy?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-mono mt-1">
                  <span>Alerts:</span>
                  <span className={cn("font-bold", (liveContext?.alerts?.length || 0) > 0 ? "text-red-500" : "text-emerald-500")}>{liveContext?.alerts?.length || 0} active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md shrink-0">
                <Zap className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-xs w-full">
                <span className="font-semibold block mb-1 text-slate-900 dark:text-slate-200">Transport Auth Feed</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-1 line-clamp-2">{liveContext?.transit || '-'}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md shrink-0">
                <Zap className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-xs w-full">
                <span className="font-semibold block mb-1 text-slate-900 dark:text-slate-200">Environmental Array</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-1">{liveContext?.weather || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 flex-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-500" />
              Suggested Directives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 flex-1 overflow-y-auto custom-scrollbar">
            <PromptButton onClick={() => { setInput(''); handleSend("Show Gate 7 issues"); }}>
              Show Gate 7 issues
            </PromptButton>
            <PromptButton onClick={() => { setInput(''); handleSend("Predict halftime congestion"); }}>
              Predict halftime congestion
            </PromptButton>
            <PromptButton onClick={() => { setInput(''); handleSend("Locate nearest medical team"); }}>
              Locate nearest medical team
            </PromptButton>
            <PromptButton onClick={() => { setInput(''); handleSend("Open Camera 12"); }}>
              Open Camera 12
            </PromptButton>
            <PromptButton onClick={() => { setInput(''); handleSend("Generate evacuation route"); }}>
              Generate evacuation route
            </PromptButton>
            <PromptButton onClick={() => { setInput(''); handleSend("Summarize security incidents"); }}>
              Summarize security incidents
            </PromptButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PromptButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <Button 
      type="button"
      variant="outline" 
      className="w-full text-left justify-start h-auto whitespace-normal p-3.5 text-xs bg-white/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />
      <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white relative z-10">{children}</span>
    </Button>
  );
}
