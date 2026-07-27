import { useState, useEffect } from 'react';
import { HealthCard } from './components/HealthCard';
import type { HealthCardData } from './components/HealthCard';
import { PredictionResult } from './components/PredictionResult';
import type { Prediction } from './components/PredictionResult';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ChatWidget } from './components/ChatWidget';
import { AuthModal } from './components/AuthModal';
import type { UserProfile } from './components/AuthModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { jsPDF } from 'jspdf';
import { 
  Heart, 
  Activity, 
  FileText, 
  Play, 
  ShieldCheck, 
  ClipboardList,
  Sun,
  Moon,
  User as UserIcon,
  LogIn,
  LogOut,
  Sparkles,
  Search
} from 'lucide-react';

const SYMPTOM_CATEGORIES = {
  Cardiovascular: ['Chest Pain', 'Dyspnea (Shortness of Breath)', 'Dizziness', 'Palpitations'],
  Respiratory: ['Fever', 'Cough', 'Sore Throat', 'Chills'],
  General: ['Fatigue', 'Headache', 'Nausea', 'Joint Pain']
};

const ALL_SYMPTOMS = Object.values(SYMPTOM_CATEGORIES).flat();

function MainDashboard() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('smart_health_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [healthCard, setHealthCard] = useState<HealthCardData>({
    health_id: user ? user.health_id : 'SH-29381-XYZ',
    age: 28,
    gender: 'Male',
    blood_group: 'O+',
    chronic_conditions: ['Seasonal Allergies'],
    allergies: ['Penicillin'],
    current_medications: [],
    vitals: {
      heart_rate: 72,
      bp_systolic: 120,
      bp_diastolic: 80,
      spo2: 98
    }
  });

  useEffect(() => {
    if (user && user.health_id) {
      setHealthCard(prev => ({ ...prev, health_id: user.health_id }));
    }
  }, [user]);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomSearch, setSymptomSearch] = useState('');

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAuthSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    setHealthCard(prev => ({ ...prev, health_id: userProfile.health_id }));
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_health_token');
    localStorage.removeItem('smart_health_user');
    setUser(null);
    setHealthCard(prev => ({ ...prev, health_id: 'SH-29381-XYZ' }));
  };

  const handleAnalyzeHealth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('smart_health_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        health_card: healthCard,
        symptoms: selectedSymptoms
      };

      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/predict-disease`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server returned an error when evaluating vitals and symptoms.');
      }

      const data: Prediction = await response.json();
      setPrediction(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to the prediction API.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(20, 184, 166);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SMART HEALTH PASSPORT REPORT', 15, 18);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('AI-POWERED PREDICTOR & CLINICAL TRIAGE ADVISOR', 15, 24);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 145, 15);
    doc.text(`Health ID: ${healthCard.health_id}`, 145, 21);
    doc.text(`User: ${user ? user.name : 'Guest User'}`, 145, 27);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text('1. Patient Identity & Profile', 15, 45);
    doc.line(15, 47, 195, 47);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Age: ${healthCard.age} years`, 15, 54);
    doc.text(`Gender: ${healthCard.gender}`, 65, 54);
    doc.text(`Blood Group: ${healthCard.blood_group}`, 125, 54);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. Vitals Profile at Analysis', 15, 66);
    doc.line(15, 68, 195, 68);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Pulse Rate: ${healthCard.vitals.heart_rate} bpm`, 15, 75);
    doc.text(`Blood Pressure: ${healthCard.vitals.bp_systolic}/${healthCard.vitals.bp_diastolic} mmHg`, 65, 75);
    doc.text(`Oxygen Saturation (SpO2): ${healthCard.vitals.spo2}%`, 125, 75);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Medical Background & History', 15, 87);
    doc.line(15, 89, 195, 89);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const conditionsStr = healthCard.chronic_conditions.join(', ') || 'None';
    const allergiesStr = healthCard.allergies.join(', ') || 'None';
    const medsStr = healthCard.current_medications.join(', ') || 'None';
    doc.text(`Chronic Conditions: ${conditionsStr}`, 15, 96);
    doc.text(`Known Allergies: ${allergiesStr}`, 15, 102);
    doc.text(`Current Medications: ${medsStr}`, 15, 108);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. Evaluated Active Symptoms', 15, 120);
    doc.line(15, 122, 195, 122);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const symptomsStr = selectedSymptoms.join(', ') || 'No symptoms selected at submission time.';
    doc.text(symptomsStr, 15, 129);

    if (prediction) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('5. AI Diagnostic Assessment & Prediction', 15, 142);
      doc.line(15, 144, 195, 144);

      doc.setFontSize(11);
      doc.text(`Predicted Condition: ${prediction.condition}`, 15, 152);
      doc.text(`Risk Severity Level: ${prediction.risk_level} Risk`, 15, 158);
      doc.text(`AI Prediction Confidence: ${Math.round(prediction.confidence)}%`, 15, 164);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Diagnostic Reasoning & Clinical Details:', 15, 173);
      
      doc.setFont('Helvetica', 'normal');
      const splitDetails = doc.splitTextToSize(prediction.details, 180);
      doc.text(splitDetails, 15, 179);

      const recsYStart = 179 + (splitDetails.length * 5.2) + 5;
      doc.setFont('Helvetica', 'bold');
      doc.text('Clinical Action Plan & Next Steps:', 15, recsYStart);
      
      doc.setFont('Helvetica', 'normal');
      let currentY = recsYStart + 6;
      prediction.recommendations.forEach((rec) => {
        const splitRec = doc.splitTextToSize(`• ${rec}`, 180);
        doc.text(splitRec, 15, currentY);
        currentY += (splitRec.length * 5.2);
      });
    } else {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(120, 120, 120);
      doc.text('5. AI Diagnostic Assessment: Not Performed', 15, 142);
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(10, 270, 190, 17, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.text('Disclaimer: This report was compiled by an artificial intelligence model for informational guidance.', 15, 276);
    doc.text('It does not replace professional medical diagnosis or physical consultation with a licensed practitioner.', 15, 280);

    doc.save(`SmartHealth_Report_${healthCard.health_id}.pdf`);
  };

  const filteredSymptoms = ALL_SYMPTOMS.filter(s => s.toLowerCase().includes(symptomSearch.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col pb-16 transition-colors duration-300">
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-stone-200/80 bg-white/80 shadow-sm'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-md">
                <Heart className="h-5 w-5 fill-current animate-pulse" />
              </div>
              <div>
                <h1 className={`text-base font-extrabold tracking-wide m-0 leading-none ${isDark ? 'text-slate-100' : 'text-stone-900'}`}>
                  SmartHealth
                </h1>
                <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">AI Clinical Command</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleExportPDF}
                className={`hidden sm:flex items-center space-x-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                  isDark 
                    ? 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                }`}
              >
                <FileText className="h-4 w-4 text-teal-500" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Sesame.ai Light Theme" : "Switch to Google Antigravity Dark Theme"}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-850 hover:bg-slate-800 text-amber-400 border-slate-700' 
                    : 'bg-stone-100 hover:bg-stone-200 text-indigo-600 border-stone-300'
                }`}
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'bg-teal-950/40 border-teal-500/30 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-800'
                  }`}>
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{user.name.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      isDark ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center space-x-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 text-xs font-extrabold tracking-wider transition-colors cursor-pointer shadow"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 flex-1 flex flex-col space-y-8">
        
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl glass-card ${
          isDark 
            ? 'bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/30 border-slate-800' 
            : 'bg-gradient-to-r from-white via-stone-50 to-teal-50/40 border-stone-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <h2 className={`text-lg font-extrabold tracking-wide m-0 ${isDark ? 'text-slate-100' : 'text-stone-900'}`}>
                Dynamic Clinical AI Prediction Panel
              </h2>
            </div>
            <p className={`text-xs leading-relaxed max-w-2xl ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Adjust vitals on the Smart Health Passport, select active symptoms below, and generate real-time clinical diagnostics. Fully synchronized with your interactive AI Chat Assistant and timeline analytics.
            </p>
          </div>
          <div className={`flex items-center space-x-2 text-xs font-bold p-2.5 rounded-xl border shrink-0 ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-white border-stone-200 text-stone-700 shadow-sm'
          }`}>
            <ShieldCheck className="h-4 w-4 text-teal-500 shrink-0" />
            <span>HIPAA Compliant & Secure</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-7 space-y-8">
            <div className="space-y-3">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                <ClipboardList className="h-4 w-4 mr-2 text-teal-500" />
                1. Smart Health Passport Configuration
              </h3>
              <HealthCard data={healthCard} onChange={setHealthCard} />
            </div>

            <div className={`p-6 rounded-2xl border shadow-xl glass-card space-y-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/90 border-stone-200 shadow-stone-200/50'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
                <div>
                  <h4 className={`font-extrabold text-sm tracking-wide ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                    2. Select Active Symptoms
                  </h4>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Choose all symptoms currently present</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-800'
                  }`}>
                    {selectedSymptoms.length} Selected
                  </span>
                </div>
              </div>

              <div className="relative">
                <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                <input
                  type="text"
                  placeholder="Filter symptoms (e.g. Fever, Chest Pain)..."
                  value={symptomSearch}
                  onChange={(e) => setSymptomSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                    isDark 
                      ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-teal-500' 
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-teal-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {filteredSymptoms.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`flex items-center justify-between text-left p-3 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
                        isChecked
                          ? isDark 
                            ? 'bg-teal-950/60 border-teal-500/60 text-teal-300 shadow-sm' 
                            : 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm'
                          : isDark 
                            ? 'bg-slate-850/50 border-slate-800 text-slate-300 hover:border-slate-700' 
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span className="truncate pr-1">{symptom}</span>
                      <span className={`h-4 w-4 rounded-md border flex items-center justify-center text-[10px] shrink-0 ${
                        isChecked 
                          ? 'border-teal-500 bg-teal-500 text-white' 
                          : isDark ? 'border-slate-600' : 'border-stone-300'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAnalyzeHealth}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs tracking-widest uppercase py-3.5 px-6 rounded-xl disabled:opacity-50 transition-all duration-300 shadow-lg shadow-teal-950/20 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{loading ? 'Analyzing Health Metrics...' : 'Analyze Health Risk'}</span>
                </button>
              </div>

              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-500">
                  <p className="font-bold">Diagnostics error:</p>
                  <p className="mt-1">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              <Activity className="h-4 w-4 mr-2 text-teal-500" />
              3. AI Clinical Assessment
            </h3>
            <PredictionResult prediction={prediction} loading={loading} />
            
            <div className={`p-5 rounded-2xl border glass-card text-xs leading-relaxed space-y-2 ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white/80 border-stone-200 text-stone-600'
            }`}>
              <h5 className={`font-bold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>How does AI Inference work?</h5>
              <p>
                The engine processes real-time vitals alongside selected active symptoms using Gemini AI structured JSON output schemas to calculate clinical confidence scores, triage severity, and personalized lifestyle next steps.
              </p>
            </div>
          </div>

        </div>

        <div className="space-y-3 pt-4">
          <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            <Activity className="h-4 w-4 mr-2 text-teal-500" />
            4. Vitals Timeline & Analytics Trends
          </h3>
          <AnalyticsCharts currentVitals={healthCard.vitals} />
        </div>

      </main>

      <ChatWidget
        healthCard={healthCard}
        symptoms={selectedSymptoms}
        prediction={prediction}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainDashboard />
    </ThemeProvider>
  );
}
