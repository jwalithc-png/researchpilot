import React, { useState } from 'react';
import { KnowledgeCoreScene } from '../3d/KnowledgeCoreScene';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'login' | 'register';
  onNavigateToLanding: () => void;
  onNavigateToCreateWorkspace: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  initialMode, 
  onNavigateToLanding, 
  onNavigateToCreateWorkspace 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { setUser } = useWorkspace();
  const { login, register, clearError } = useAuth();

  const handleTabSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success && res.user) {
          setUser({
            uid: res.user.uid,
            name: res.user.displayName || 'Researcher',
            email: res.user.email || email
          });
          onNavigateToCreateWorkspace();
        } else {
          setLocalError(res.error || 'Failed to sign in. Please check your credentials.');
        }
      } else {
        const res = await register(email, password, name);
        if (res.success && res.user) {
          setUser({
            uid: res.user.uid,
            name: res.user.displayName || name || 'Researcher',
            email: res.user.email || email
          });
          onNavigateToCreateWorkspace();
        } else {
          setLocalError(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#060B17] text-slate-100 overflow-hidden relative">
      {/* Back Link */}
      <button 
        onClick={onNavigateToLanding}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      {/* Left Panel: 3D Scene */}
      <div className="relative w-full md:w-[55%] h-[40vh] md:h-full">
        <KnowledgeCoreScene mode={mode} />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[#060B17]/80 to-transparent flex flex-col justify-center items-start p-10 md:p-20 pointer-events-none">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">ResearchPilot</h1>
          <p className="text-xl text-slate-300 font-sans">Your research intelligence awaits</p>
        </div>
      </div>

      {/* Right Panel: Form Card */}
      <div className="w-full md:w-[45%] h-[60vh] md:h-full flex items-center justify-center p-6 md:p-12 relative z-10 bg-[#060B17]/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        <div className="w-full max-w-md bg-[rgba(15,23,42,0.7)] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-8">
            <button 
              type="button"
              className={`flex-1 pb-4 text-center font-medium transition-colors ${
                mode === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => handleTabSwitch('login')}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`flex-1 pb-4 text-center font-medium transition-colors ${
                mode === 'register' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => handleTabSwitch('register')}
            >
              Create Account
            </button>
          </div>

          {localError && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-sm">
              <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug">{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === 'register' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                  placeholder="Ada Lovelace"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                placeholder="ada@research.edu"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
                className="bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              } ${
                mode === 'login' 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              <span>
                {isSubmitting
                  ? mode === 'login' ? 'Signing In...' : 'Creating Account...'
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
