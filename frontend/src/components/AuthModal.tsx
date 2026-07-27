import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  health_id: string;
  created_at: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { email, password } 
      : { name, email, password };

    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication request failed.');
      }

      // Save session
      localStorage.setItem('smart_health_token', data.token);
      localStorage.setItem('smart_health_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Server authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Guest login failed');

      localStorage.setItem('smart_health_token', data.token);
      localStorage.setItem('smart_health_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 sm:p-8 relative transition-all ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800 text-slate-100 glass-card' 
            : 'bg-white/95 border-stone-200 text-stone-900 glass-card'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-stone-100 text-stone-400 hover:text-stone-700'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-teal-50 text-teal-600 border border-teal-200'}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Secure Smart Health Passport Portal
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className={`grid grid-cols-2 p-1 mb-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-100 border-stone-200'}`}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? isDark ? 'bg-teal-600 text-slate-100 shadow' : 'bg-white text-stone-900 shadow'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? isDark ? 'bg-teal-600 text-slate-100 shadow' : 'bg-white text-stone-900 shadow'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                      : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-teal-600'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-teal-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-teal-600'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Passport' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-stone-200'}`} />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className={`px-3 ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-white text-stone-400'}`}>
              Or Continue As
            </span>
          </div>
        </div>

        {/* 1-Click Guest Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800' 
              : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Zap className="w-4 h-4 text-teal-500" />
          <span>1-Click Instant Guest Access</span>
        </button>
      </div>
    </div>
  );
};
