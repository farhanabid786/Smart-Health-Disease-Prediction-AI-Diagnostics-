import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Zap, 
  FileText, 
  MessageSquare, 
  Sliders, 
  Lock, 
  Sun, 
  Moon, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenAuth }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex flex-col font-poppins transition-colors duration-300">
      {/* Landing Navbar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-stone-200/80 bg-white/80 shadow-sm'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-md">
                <Heart className="h-5 w-5 fill-current animate-pulse" />
              </div>
              <div>
                <h1 className={`text-base font-extrabold tracking-wide m-0 leading-none ${isDark ? 'text-slate-100' : 'text-stone-900'}`}>
                  SmartHealth
                </h1>
                <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">AI Clinical Platform</span>
              </div>
            </div>

            {/* Navbar Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-850 hover:bg-slate-800 text-amber-400 border-slate-700' 
                    : 'bg-stone-100 hover:bg-stone-200 text-indigo-600 border-stone-300'
                }`}
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              <button
                onClick={onOpenAuth}
                className={`hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-teal-500" />
                <span>Sign In / Register</span>
              </button>

              <button
                onClick={onGetStarted}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 px-4 py-2 text-xs font-extrabold tracking-wider uppercase transition-all shadow-md cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wider uppercase border border-teal-500/30 bg-teal-500/10 text-teal-500">
            <Sparkles className="w-4 h-4 animate-spin text-teal-500" />
            <span>AI CLINICAL COMMAND & DYNAMIC PASSPORT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Next-Gen Smart Health Triage &{' '}
            <span className="font-serif-title italic text-teal-500 underline decoration-teal-400/40">
              AI Diagnostics
            </span>
          </h1>

          <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
            Configure your digital health card in real time, evaluate disease risk severity using Gemini AI, interact with a clinical context assistant, and export authenticated PDF diagnostic reports.
          </p>

          {/* Action CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm tracking-widest uppercase shadow-xl transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={onOpenAuth}
              className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200' 
                  : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800 shadow-sm'
              }`}
            >
              <Lock className="w-4 h-4 text-teal-500" />
              <span>Sign In / Create Account</span>
            </button>
          </div>

          {/* Feature Badge Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini 3.6 Flash Engine</span>
            </span>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Encrypted Passport</span>
            </span>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}>
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Auth-Gated PDF Export</span>
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {/* Card 1 */}
          <div className={`p-6 rounded-2xl border glass-card space-y-3 transition-all transform hover:-translate-y-1 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-lg'
          }`}>
            <div className="p-3 rounded-xl bg-teal-500/15 text-teal-500 w-fit">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title font-bold text-lg">Smart Health Passport</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Interactive vitals sliders for pulse rate, systolic/diastolic blood pressure, and SpO2 oxygen levels with instant status indicators.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`p-6 rounded-2xl border glass-card space-y-3 transition-all transform hover:-translate-y-1 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-lg'
          }`}>
            <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-500 w-fit">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title font-bold text-lg">Gemini 3.6 Diagnostics</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Clinical JSON risk assessment calculating disease likelihood, triage severity levels, and tailored action plans.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`p-6 rounded-2xl border glass-card space-y-3 transition-all transform hover:-translate-y-1 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-lg'
          }`}>
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-500 w-fit">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title font-bold text-lg">Context AI Assistant</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Clinical assistant with full context memory synchronized to your vitals history, symptoms, and predictions.
            </p>
          </div>

          {/* Card 4 */}
          <div className={`p-6 rounded-2xl border glass-card space-y-3 transition-all transform hover:-translate-y-1 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-lg'
          }`}>
            <div className="p-3 rounded-xl bg-rose-500/15 text-rose-500 w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title font-bold text-lg">Official PDF Reports</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Export clean formatted clinical PDF reports reserved for authenticated registered users.
            </p>
          </div>
        </div>

        {/* Demo Teaser Box */}
        <div className={`p-8 rounded-3xl border shadow-2xl glass-card flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-slate-800' 
            : 'bg-gradient-to-r from-white via-teal-50/30 to-stone-50 border-stone-300'
        }`}>
          <div className="space-y-2">
            <h3 className="font-serif-title text-2xl font-extrabold tracking-tight">Ready to test your Health Passport?</h3>
            <p className={`text-xs max-w-xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Click "Get Started" to initialize your session, configure vitals, and generate instant clinical risk reports.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-lg cursor-pointer shrink-0"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Landing Footer */}
      <footer className={`py-6 border-t text-center text-xs transition-colors ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-stone-200 text-stone-500'
      }`}>
        <div className="mx-auto max-w-7xl px-4">
          <p>© 2026 SmartHealth AI Platform. AI triage guidance is for informational purposes and does not replace licensed medical care.</p>
        </div>
      </footer>
    </div>
  );
};
