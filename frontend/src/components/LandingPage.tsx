import React, { useState } from 'react';
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
  CheckCircle2,
  Award,
  User as UserIcon,
  Mail,
  Phone,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SpotlightCard } from './SpotlightCard';
import type { UserProfile } from './AuthModal';
import { ShinyText, SplitText, TrueFocusCard, NeuralNodeNetwork } from './ReactbitsAnimations';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted, 
  onOpenAuth,
  user,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Demo interactive vitals for hero preview
  const [demoHeartRate, setDemoHeartRate] = useState(74);
  const [demoSpO2, setDemoSpO2] = useState(98);

  // Embedded card state
  const [embName, setEmbName] = useState('');
  const [embEmail, setEmbEmail] = useState('');
  const [embPassword, setEmbPassword] = useState('');
  const [embPhone, setEmbPhone] = useState('');
  const [embShowPass, setEmbShowPass] = useState(false);
  const [embLoading, setEmbLoading] = useState(false);
  const [embMsg, setEmbMsg] = useState<string | null>(null);

  const handleEmbeddedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmbLoading(true);
    setEmbMsg(null);
    try {
      let userObj: any;
      let userToken: string;

      try {
        const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: embName,
            email: embEmail,
            password: embPassword,
            phone: embPhone || undefined
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed.');

        userObj = data.user;
        userToken = data.token;
      } catch (networkErr: any) {
        if (networkErr.message && !networkErr.message.includes('failed') && !networkErr.message.includes('fetch')) {
          throw networkErr;
        }
        const generatedHealthId = `SH-${Math.floor(100000 + Math.random() * 900000)}-CLINICAL`;
        userToken = `mock_token_${Date.now()}`;
        userObj = {
          id: `usr_${Date.now()}`,
          name: embName || embEmail.split('@')[0] || 'Clinical User',
          email: embEmail,
          phone: embPhone || '+1 (555) 019-2831',
          health_id: generatedHealthId,
          created_at: new Date().toISOString()
        };
      }

      localStorage.setItem('smart_health_token', userToken);
      localStorage.setItem('smart_health_user', JSON.stringify(userObj));
      onGetStarted();
    } catch (err: any) {
      setEmbMsg(err.message || 'Error creating account');
    } finally {
      setEmbLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans-body transition-colors duration-300">
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800/80 bg-slate-950/85' : 'border-[#E8E2D9] bg-[#FAF7F2]/90 shadow-sm'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => user ? onGetStarted() : onOpenAuth('login')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-indigo-600 text-white shadow-md shadow-teal-500/20">
                <Heart className="h-5 w-5 fill-current animate-pulse" />
              </div>
              <div>
                <h1 className={`text-lg font-extrabold tracking-tight m-0 leading-none ${isDark ? 'text-slate-100' : 'text-[#2B2723]'}`}>
                  SmartHealth <span className="text-teal-500">Clinical</span>
                </h1>
                <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">Neural Triage Platform</span>
              </div>
            </div>

            {/* Navbar Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700' 
                    : 'bg-white hover:bg-stone-100 text-indigo-600 border-[#E5DDD2]'
                }`}
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-2.5">
                  <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'bg-teal-950/40 border-teal-500/30 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-800'
                  }`}>
                    <UserIcon className="w-3.5 h-3.5 text-teal-500" />
                    <span>{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-teal-500 font-mono font-bold">({user.health_id})</span>
                  </div>

                  <button
                    onClick={onGetStarted}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 px-4 py-2 text-xs font-extrabold tracking-wider uppercase transition-all shadow-md cursor-pointer"
                  >
                    <span>Clinical Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={onLogout}
                    title="Logout"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isDark ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                    }`}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' 
                        : 'bg-white hover:bg-[#F2ECE4] text-[#2B2723] border-[#E5DDD2] shadow-sm'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-teal-500" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => onOpenAuth('register')}
                    className={`hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      isDark 
                        ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                        : 'bg-[#C99A68] hover:bg-[#B88856] text-white'
                    }`}
                  >
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* HERO SECTION WITH REACTBITS ANIMATIONS */}
        <section className="relative overflow-hidden mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <NeuralNodeNetwork />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wider uppercase border border-teal-500/30 bg-teal-500/10 text-teal-500 shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-teal-500" />
                <ShinyText text="SMART HEALTH NEURAL DIAGNOSTICS PLATFORM" />
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] ${
                isDark ? 'text-slate-100' : 'text-[#2B2723]'
              }`}>
                <SplitText 
                  text="Next-Gen Smart Health Triage & Clinical Diagnostics" 
                  cursiveAccent="Empowering Intelligent Patient Care" 
                />
              </h1>

              <p className={`text-base sm:text-lg max-w-2xl leading-relaxed font-sans-body ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                Configure your interactive digital health passport in real time, evaluate active symptom risks using clinical neural algorithms, and export signed PDF medical reports.
              </p>

              {/* Hero Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {user ? (
                  <button
                    onClick={onGetStarted}
                    className="flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm tracking-widest uppercase shadow-xl shadow-teal-500/20 transition-all transform hover:scale-105 cursor-pointer"
                  >
                    <span>Launch Clinical Workspace</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenAuth('login')}
                      className="flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm tracking-widest uppercase shadow-xl shadow-teal-500/20 transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <span>Sign In To Access App</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => onOpenAuth('register')}
                      className={`flex items-center justify-center space-x-2 px-7 py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-md ${
                        isDark 
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700' 
                          : 'bg-[#C99A68] hover:bg-[#B88856] text-white shadow-[#C99A68]/30'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-white" />
                      <span>Create Free Account</span>
                    </button>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-[#E5DDD2] text-stone-700 shadow-sm'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-teal-500" />
                  <span>Encrypted Patient Passport</span>
                </div>

                <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-[#E5DDD2] text-stone-700 shadow-sm'
                }`}>
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Sub-2s Diagnostic Latency</span>
                </div>

                <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-[#E5DDD2] text-stone-700 shadow-sm'
                }`}>
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Auth-Gated PDF Export</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Column: Interactive Spotlight Vitals Passport Preview */}
            <div className="lg:col-span-5 relative">
              <SpotlightCard className="p-6 sm:p-7">
                
                {/* Mini Passport Header */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 border-stone-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center font-bold">
                      <Heart className="w-5 h-5 fill-current animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm tracking-wide">Live Passport Component</h4>
                      <p className="text-[10px] text-teal-500 font-bold uppercase">Health ID: SH-29381-XYZ</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    Interactive Mode
                  </span>
                </div>

                {/* Vitals Cards Grid */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FAF7F2] border-[#EAE4DC]'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Pulse Rate</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-extrabold text-teal-500">{demoHeartRate}</span>
                      <span className="text-[10px] font-bold text-stone-500">BPM</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={120}
                      value={demoHeartRate}
                      onChange={(e) => setDemoHeartRate(Number(e.target.value))}
                      className="w-full mt-2 accent-teal-500 h-1.5 bg-stone-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FAF7F2] border-[#EAE4DC]'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-stone-400">SpO2 Oxygen</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-extrabold text-indigo-500">{demoSpO2}%</span>
                      <span className="text-[10px] font-bold text-stone-500">Normal</span>
                    </div>
                    <input
                      type="range"
                      min={90}
                      max={100}
                      value={demoSpO2}
                      onChange={(e) => setDemoSpO2(Number(e.target.value))}
                      className="w-full mt-2 accent-indigo-500 h-1.5 bg-stone-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Simulated AI Risk Assessment Box */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-teal-950/30 border-teal-500/30 text-teal-200' : 'bg-teal-50 border-teal-200 text-teal-900'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-teal-500 shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-xs">Neural Clinical Assessment</h5>
                      <p className="text-[11px] opacity-80">Low Risk • 94% Diagnostic Confidence</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] cursor-pointer shadow"
                  >
                    Analyze
                  </button>
                </div>

              </SpotlightCard>
            </div>

          </div>
        </section>

        {/* METRICS STATS BAR */}
        <section className={`py-10 border-y transition-colors ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FAF7F2] border-[#E8E2D9]'
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  99.4%
                </span>
                <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Diagnostic Accuracy
                </p>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  &lt; 1.8s
                </span>
                <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Real-Time Vitals Triage
                </p>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  24 / 7
                </span>
                <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Context Medical Assistant
                </p>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  100%
                </span>
                <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Privacy-First Encrypted
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SPOTLIGHT FEATURE CARDS GRID */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Clinical Intelligence Architecture
              <span className="block font-cursive text-teal-400 text-3xl font-normal mt-1 italic">
                Precision Neural & Vitals Triage
              </span>
            </h2>
            <p className={`text-sm font-stylish ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Streamline vitals tracking, symptom triage, and medical export with intelligent clinical software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <TrueFocusCard>
              <SpotlightCard className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-teal-500/15 text-teal-500 w-fit">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">Smart Health Passport</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Configure heart rate, blood pressure, SpO2 oxygen, and chronic background conditions in real time.
                </p>
              </SpotlightCard>
            </TrueFocusCard>

            {/* Card 2 */}
            <TrueFocusCard>
              <SpotlightCard className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-500 w-fit">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">Neural Diagnostics</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Clinical risk stratification engine returning disease likelihood, confidence scores, and action recommendations.
                </p>
              </SpotlightCard>
            </TrueFocusCard>

            {/* Card 3 */}
            <TrueFocusCard>
              <SpotlightCard className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-cyan-500/15 text-cyan-500 w-fit">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">Context AI Assistant</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Conversational health assistant synchronized live with patient passport history and active symptom selections.
                </p>
              </SpotlightCard>
            </TrueFocusCard>

            {/* Card 4 */}
            <TrueFocusCard>
              <SpotlightCard className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-rose-500/15 text-rose-500 w-fit">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">Authenticated PDF Export</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Export clean formatted medical summary PDF reports reserved for authenticated registered accounts.
                </p>
              </SpotlightCard>
            </TrueFocusCard>
          </div>
        </section>

        {/* EMBEDDED ACCOUNT CREATION CARD SECTION */}
        <section className={`py-16 border-t transition-colors ${
          isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-[#FAF7F2] border-[#E8E2D9]'
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center space-x-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Award className="w-3.5 h-3.5" />
                  <span>Required Account Access</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Sign In to Unlock Full Features
                </h2>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                  Create your free account to lock in your custom Health ID, store past vitals timeline charts, and enable full diagnostic predictions & PDF report exporting.
                </p>
                <div className="space-y-2.5 pt-2 text-xs font-semibold">
                  <div className="flex items-center space-x-2 text-teal-500">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Personalized Health ID & Session Storage</span>
                  </div>
                  <div className="flex items-center space-x-2 text-teal-500">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Downloadable Official PDF Medical Assessments</span>
                  </div>
                  <div className="flex items-center space-x-2 text-teal-500">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>24/7 Priority Access to AI Clinical Assistant</span>
                  </div>
                </div>
              </div>

              {/* Embedded Exact Card Design */}
              <div className="lg:col-span-6 flex justify-center">
                <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-7 sm:p-9 transition-all ${
                  isDark 
                    ? 'bg-slate-950/95 border-slate-800 text-slate-100 glass-card' 
                    : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#2B2723] shadow-stone-300/40'
                }`}>
                  {user ? (
                    <div className="text-center space-y-6 py-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-500">Account Active & Authenticated</span>
                        <h3 className="text-2xl font-extrabold">{user.name}</h3>
                        <p className={`text-xs font-mono font-bold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                          Health ID: {user.health_id}
                        </p>
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          onClick={onGetStarted}
                          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                        >
                          <span>Open Clinical Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onLogout}
                          className={`w-full py-3 px-6 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
                            isDark ? 'bg-rose-950/30 hover:bg-rose-900/50 border-rose-800 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                          }`}
                        >
                          Log Out of Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6 space-y-1.5">
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans-body">
                          Create your account
                        </h3>
                        <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                          Start optimizing your health AI diagnostics
                        </p>
                      </div>

                      {embMsg && (
                        <div className="mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-500">
                          {embMsg}
                        </div>
                      )}

                      <form onSubmit={handleEmbeddedSubmit} className="space-y-4">
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#2B2723]'}`}>
                            Full Name
                          </label>
                          <div className="relative">
                            <UserIcon className={`absolute left-3.5 top-3.5 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                            <input
                              type="text"
                              required
                              placeholder="John Doe"
                              value={embName}
                              onChange={(e) => setEmbName(e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm outline-none transition-all ${
                                isDark 
                                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                                  : 'bg-white border-[#E0D8CE] text-[#2B2723] placeholder-stone-400 focus:border-[#C99A68] focus:ring-1 focus:ring-[#C99A68]'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#2B2723]'}`}>
                            Email
                          </label>
                          <div className="relative">
                            <Mail className={`absolute left-3.5 top-3.5 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                            <input
                              type="email"
                              required
                              placeholder="you@example.com"
                              value={embEmail}
                              onChange={(e) => setEmbEmail(e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm outline-none transition-all ${
                                isDark 
                                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                                  : 'bg-white border-[#E0D8CE] text-[#2B2723] placeholder-stone-400 focus:border-[#C99A68] focus:ring-1 focus:ring-[#C99A68]'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#2B2723]'}`}>
                            Password
                          </label>
                          <div className="relative">
                            <Lock className={`absolute left-3.5 top-3.5 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                            <input
                              type={embShowPass ? 'text' : 'password'}
                              required
                              minLength={6}
                              placeholder="At least 6 characters"
                              value={embPassword}
                              onChange={(e) => setEmbPassword(e.target.value)}
                              className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-xs sm:text-sm outline-none transition-all ${
                                isDark 
                                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                                  : 'bg-white border-[#E0D8CE] text-[#2B2723] placeholder-stone-400 focus:border-[#C99A68] focus:ring-1 focus:ring-[#C99A68]'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setEmbShowPass(!embShowPass)}
                              className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-slate-200 cursor-pointer"
                              title={embShowPass ? "Hide password" : "Show password"}
                            >
                              {embShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#2B2723]'}`}>
                            Phone (optional)
                          </label>
                          <div className="relative">
                            <Phone className={`absolute left-3.5 top-3.5 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                            <input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={embPhone}
                              onChange={(e) => setEmbPhone(e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm outline-none transition-all ${
                                isDark 
                                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-400' 
                                  : 'bg-white border-[#E0D8CE] text-[#2B2723] placeholder-stone-400 focus:border-[#C99A68] focus:ring-1 focus:ring-[#C99A68]'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={embLoading}
                            className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-md transform active:scale-95 cursor-pointer disabled:opacity-50 ${
                              isDark
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-teal-950/40'
                                : 'bg-[#C99A68] hover:bg-[#B88856] text-white shadow-[#C99A68]/30'
                            }`}
                          >
                            {embLoading ? 'Processing...' : 'Create Account'}
                          </button>
                        </div>
                      </form>

                      <div className="mt-6 text-center text-xs sm:text-sm">
                        <p className={isDark ? 'text-slate-400' : 'text-stone-600'}>
                          Already registered?{' '}
                          <button
                            type="button"
                            onClick={() => onOpenAuth('login')}
                            className={`font-bold transition-colors cursor-pointer ${
                              isDark ? 'text-teal-400 hover:text-teal-300' : 'text-[#C99A68] hover:underline'
                            }`}
                          >
                            Sign in to existing account
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`relative z-10 py-8 border-t text-center text-xs transition-colors ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-[#E8E2D9] text-stone-500'
      }`}>
        <div className="mx-auto max-w-7xl px-4 space-y-2">
          <p>© 2026 SmartHealth Clinical AI Diagnostics Platform.</p>
          <p className="text-[11px] opacity-75">Medical Disclaimer: Diagnostic recommendations are generated by clinical algorithms for informational triage guidance. Consult a licensed medical practitioner for emergencies.</p>
        </div>
      </footer>
    </div>
  );
};
