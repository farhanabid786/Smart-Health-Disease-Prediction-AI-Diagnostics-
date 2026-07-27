import React from 'react';
import { Activity, ShieldAlert, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface Prediction {
  condition: string;
  confidence: number;
  risk_level: string;
  details: string;
  recommendations: string[];
}

interface PredictionResultProps {
  prediction: Prediction | null;
  loading: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ prediction, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className={`rounded-2xl border p-6 space-y-6 animate-pulse glass-card ${
        isDark ? 'border-slate-800 bg-slate-900/40' : 'border-stone-200 bg-white/80'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`h-6 w-6 rounded-md ${isDark ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
          <div className={`h-5 w-40 rounded ${isDark ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
          <div className={`h-28 w-28 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`}>
            <div className={`h-20 w-20 rounded-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}></div>
          </div>
          <div className="flex-1 space-y-3 w-full">
            <div className={`h-4 w-1/4 rounded ${isDark ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
            <div className={`h-6 w-3/4 rounded ${isDark ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
            <div className={`h-3 w-5/6 rounded ${isDark ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className={`rounded-2xl border border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 glass-card ${
        isDark ? 'border-slate-800 bg-slate-900/20' : 'border-stone-300 bg-stone-50/50'
      }`}>
        <div className={`rounded-full p-4 ${isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-stone-200/80 text-stone-500'}`}>
          <Activity className="h-10 w-10" />
        </div>
        <div>
          <h3 className={`text-lg font-extrabold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>Awaiting Diagnostics</h3>
          <p className={`text-xs max-w-sm mt-1 mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Select active symptoms from the checklist on the left and adjust your vitals. Click "Analyze Health Risk" to generate clinical predictions.
          </p>
        </div>
      </div>
    );
  }

  const getRiskDetails = (risk: string) => {
    switch (risk.trim().toLowerCase()) {
      case 'high':
        return {
          badge: isDark ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-rose-700 bg-rose-50 border-rose-200',
          indicator: 'bg-rose-500',
          border: isDark ? 'border-rose-500/30' : 'border-rose-200'
        };
      case 'medium':
        return {
          badge: isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-amber-700 bg-amber-50 border-amber-200',
          indicator: 'bg-amber-500',
          border: isDark ? 'border-amber-500/30' : 'border-amber-200'
        };
      case 'low':
      default:
        return {
          badge: isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
          indicator: 'bg-emerald-500',
          border: isDark ? 'border-emerald-500/30' : 'border-emerald-200'
        };
    }
  };

  const riskStyle = getRiskDetails(prediction.risk_level);
  
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (prediction.confidence / 100) * circumference;

  return (
    <div className={`rounded-2xl border p-5 sm:p-7 space-y-6 shadow-2xl glass-card relative overflow-hidden transition-all ${
      riskStyle.border
    } ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100' 
        : 'bg-white text-stone-900 shadow-stone-200/50'
    }`}>
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${riskStyle.indicator}`}></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`rounded-xl p-2.5 ${isDark ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20' : 'bg-teal-100 text-teal-700'}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="font-extrabold tracking-wide text-sm sm:text-base">DIAGNOSTIC CONCLUSION</h3>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${riskStyle.badge}`}>
          {prediction.risk_level} Risk
        </span>
      </div>

      <div className={`flex flex-col sm:flex-row items-center gap-6 py-2 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
        <div className={`relative h-28 w-28 shrink-0 flex items-center justify-center rounded-full border shadow-inner ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={isDark ? 'text-slate-800' : 'text-stone-200'}
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="url(#confidenceGradient)"
              fill="transparent"
            />
            <defs>
              <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <span className={`text-2xl font-extrabold tracking-tighter ${isDark ? 'text-slate-100' : 'text-stone-900'}`}>
              {Math.round(prediction.confidence)}
            </span>
            <span className={`text-[10px] block font-bold -mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>%</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Predicted Condition</span>
          <h4 className={`text-xl font-extrabold leading-tight tracking-wide ${isDark ? 'text-slate-100' : 'text-stone-900'}`}>
            {prediction.condition}
          </h4>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
            {prediction.details}
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        <h5 className={`text-xs uppercase font-extrabold tracking-wider flex items-center ${isDark ? 'text-slate-300' : 'text-stone-800'}`}>
          <HeartHandshake className="h-4 w-4 mr-2 text-teal-500" />
          Clinical Action Plan & Next Steps
        </h5>
        <div className="grid grid-cols-1 gap-2.5">
          {prediction.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-800' 
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <CheckCircle2 className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
              <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`pt-3 border-t text-[10px] italic text-center ${isDark ? 'border-slate-800 text-slate-500' : 'border-stone-200 text-stone-400'}`}>
        Disclaimer: This evaluation is generated by artificial intelligence for informational and triage guidance only. It does not replace professional clinical evaluation or physical examination by a licensed practitioner.
      </div>
    </div>
  );
};
