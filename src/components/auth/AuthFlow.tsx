
function Particles() {
  const [particles] = useState(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * -20,
    x: Math.random() * 50 - 25
  })));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, p.x, 0],
            opacity: [0.1, 0.8, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, Key, ShieldCheck,ArrowRight, Eye, EyeOff, Loader2, AlertCircle,Keyboard, ShieldAlert, Building2, User,CheckCircle2 } from 'lucide-react';

type AuthState = 'login' | 'forgot' | 'reset' | 'authenticated';

interface AuthFlowProps {
  onAuthenticated: () => void;
}

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [authState, setAuthState] = useState<AuthState>('login');
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden font-sans text-slate-50">
      {/* Animated Stadium Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-900 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[40%] rounded-full bg-emerald-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-blue-600/20 blur-[140px]" />
        <Particles />
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <AnimatePresence mode="wait">
          {authState === 'login' && (
            <LoginForm key="login" onNext={() => { setAuthState('authenticated'); onAuthenticated(); }} onForgot={() => setAuthState('forgot')} onOAuthSuccess={() => { setAuthState('authenticated'); onAuthenticated(); }} />
          )}
          {authState === 'forgot' && (
            <ForgotForm key="forgot" onNext={() => setAuthState('reset')} onBack={() => setAuthState('login')} />
          )}
          {authState === 'reset' && (
            <ResetForm key="reset" onNext={() => setAuthState('login')} onBack={() => setAuthState('login')} />
          )}
        </AnimatePresence>
      </div>
      
      {/* Platform Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center opacity-50 text-xs text-slate-400 tracking-widest font-mono">
        <div>STADIAOS</div>
        <div className="mt-2 flex items-center gap-2">
          <ShieldAlert className="h-3 w-3" /> SECURE ENTERPRISE ENVIRONMENT
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onNext, onForgot, onOAuthSuccess }: { onNext: () => void, onForgot: () => void, onOAuthSuccess?: () => void }) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'OAUTH_SUCCESS' && onOAuthSuccess) {
        onOAuthSuccess();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onOAuthSuccess]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    // Simulate validation
    setTimeout(() => {
      if (password.length < 8) {
        setError('Invalid credentials. Please verify and try again.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onNext();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-2">Platform Access</h1>
        <p className="text-slate-400 text-sm">Authenticate to StadiaOS operational environment</p>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6 flex gap-3">
         <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
         <p className="text-xs text-amber-200/80 leading-relaxed">
            This is a secure system. All activities are monitored and logged. Concurrent logins from different IP addresses will result in forced logout.
         </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
           <p className="text-sm text-slate-300 font-medium mb-1">Demo Mode</p>
           <p className="text-xs text-slate-400 mb-3">Local only, no server validation</p>
           <button 
             type="button" 
             onClick={() => onNext()}
             className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm rounded-lg py-2 px-4 transition-colors"
           >
             Enter Demo Workspace
           </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-3 text-slate-500">Enterprise Integrations</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={() => window.open('/api/auth/google', 'google_login', 'width=500,height=600')} className="w-full flex items-center justify-center gap-2 bg-slate-950/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl py-2.5 text-sm font-medium transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </motion.div>
  );
}


function ForgotForm({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNext();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-2">Account Recovery</h1>
        <p className="text-slate-400 text-sm">Verify your identity to initiate secure recovery flow.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="forgot-email" className="text-xs font-medium text-slate-300 ml-1">Enterprise Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input id="forgot-email" 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-600"
              placeholder="user@organization.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="forgot-username" className="text-xs font-medium text-slate-300 ml-1">Username / Badge ID</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="forgot-username"
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-600"
              placeholder="E.g. A-789012"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="forgot-org" className="text-xs font-medium text-slate-300 ml-1">Organization ID</label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="forgot-org"
              type="text" 
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-600"
              placeholder="FIFA-ORG"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !email || !username || !organization}
          className="w-full bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 font-medium text-sm rounded-xl py-3 px-4 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Recovery Link'}
        </button>
      </form>

      <div className="mt-6 flex justify-center text-sm">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-slate-300 transition-colors">
          Cancel recovery
        </button>
      </div>
    </motion.div>
  );
}


function ResetForm({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const hasLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const matches = password === confirm && password.length > 0;
  
  const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isSecure = score >= 4 && matches;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    
    // Simulate detecting a recent password
    if (password === 'Password123!') {
       setError('Password matches a recently used credential. Please choose a new unique password.');
       return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
         onNext();
      }, 2000);
    }, 2000);
  };

  if (isSuccess) {
     return (
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
           <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8" />
           </div>
           <h2 className="text-xl font-display font-bold text-white mb-2">Credential Updated</h2>
           <p className="text-slate-400 text-sm mb-6">Your security profile has been successfully reset. Redirecting to platform access...</p>
           <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        </motion.div>
     );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
          <Key className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-2">Reset Credential</h1>
        <p className="text-slate-400 text-sm">Establish a new secure access key.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-amber-400 text-xs font-medium bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-center">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="reset-password" className="text-xs font-medium text-slate-300 ml-1">New Password</label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              placeholder="••••••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="reset-confirm" className="text-xs font-medium text-slate-300 ml-1">Confirm Password</label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="reset-confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full bg-slate-950/50 border text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${confirm.length > 0 && !matches ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-slate-700/50 focus:ring-indigo-500/50 focus:border-indigo-500/50'}`}
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="space-y-2 py-2">
          <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden bg-slate-800">
            <div className={`h-full flex-1 transition-colors duration-300 ${score >= 1 ? 'bg-red-500' : 'bg-transparent'}`}></div>
            <div className={`h-full flex-1 transition-colors duration-300 ${score >= 2 ? 'bg-amber-500' : 'bg-transparent'}`}></div>
            <div className={`h-full flex-1 transition-colors duration-300 ${score >= 3 ? 'bg-emerald-400' : 'bg-transparent'}`}></div>
            <div className={`h-full flex-1 transition-colors duration-300 ${score >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-400' : ''}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${hasLength ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
              12+ Characters
            </div>
            <div className={`flex items-center gap-1.5 ${hasUpper && hasLower ? 'text-emerald-400' : ''}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${hasUpper && hasLower ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
              Upper & Lowercase
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : ''}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${hasNumber ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
              Number (0-9)
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : ''}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${hasSpecial ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
              Special Symbol
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !isSecure}
          className="w-full bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 font-medium text-sm rounded-xl py-3 px-4 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Reset'}
        </button>
      </form>

      <div className="mt-6 flex justify-center text-sm">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-slate-300 transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

