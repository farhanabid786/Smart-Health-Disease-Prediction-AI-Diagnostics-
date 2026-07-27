import React from 'react';
import { Shield, Activity, Heart, Thermometer, User, CheckCircle2, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface Vitals {
  heart_rate: number;
  bp_systolic: number;
  bp_diastolic: number;
  spo2: number;
}

export interface HealthCardData {
  health_id: string;
  age: number;
  gender: string;
  blood_group: string;
  chronic_conditions: string[];
  allergies: string[];
  current_medications: string[];
  vitals: Vitals;
}

interface HealthCardProps {
  data: HealthCardData;
  onChange: (updatedData: HealthCardData) => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({ data, onChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [newCondition, setNewCondition] = React.useState('');
  const [newAllergy, setNewAllergy] = React.useState('');
  const [newMedication, setNewMedication] = React.useState('');

  const handleVitalChange = (key: keyof Vitals, value: number) => {
    onChange({
      ...data,
      vitals: {
        ...data.vitals,
        [key]: value,
      },
    });
  };

  const handleInfoChange = (key: keyof HealthCardData, value: any) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const applyPreset = (preset: 'normal' | 'hypertension' | 'respiratory' | 'athlete') => {
    let newVitals: Vitals = { heart_rate: 72, bp_systolic: 120, bp_diastolic: 80, spo2: 98 };
    if (preset === 'hypertension') {
      newVitals = { heart_rate: 105, bp_systolic: 165, bp_diastolic: 102, spo2: 96 };
    } else if (preset === 'respiratory') {
      newVitals = { heart_rate: 94, bp_systolic: 132, bp_diastolic: 88, spo2: 91 };
    } else if (preset === 'athlete') {
      newVitals = { heart_rate: 54, bp_systolic: 112, bp_diastolic: 74, spo2: 99 };
    }
    onChange({ ...data, vitals: newVitals });
  };

  const addItem = (key: 'chronic_conditions' | 'allergies' | 'current_medications', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    if (data[key].includes(value.trim())) return;
    onChange({
      ...data,
      [key]: [...data[key], value.trim()],
    });
    setter('');
  };

  const removeItem = (key: 'chronic_conditions' | 'allergies' | 'current_medications', index: number) => {
    const list = [...data[key]];
    list.splice(index, 1);
    onChange({
      ...data,
      [key]: list,
    });
  };

  const getHeartRateStatus = (hr: number) => {
    if (hr < 50 || hr > 110) return { label: 'Urgent Alert', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
    if (hr < 60 || hr > 100) return { label: 'Borderline', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Normal', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys >= 160 || dia >= 100 || sys < 90 || dia < 60) {
      return { label: 'Hypertensive Risk', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
    }
    if (sys >= 130 || dia >= 85) {
      return { label: 'Pre-Hypertension', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    }
    return { label: 'Optimal', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  };

  const getSpO2Status = (spo2: number) => {
    if (spo2 < 93) return { label: 'Critical Hypoxia', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
    if (spo2 < 95) return { label: 'Low Oxygen', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Excellent', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  };

  const hrStatus = getHeartRateStatus(data.vitals.heart_rate);
  const bpStatus = getBPStatus(data.vitals.bp_systolic, data.vitals.bp_diastolic);
  const spo2Status = getSpO2Status(data.vitals.spo2);

  return (
    <div className="space-y-6">
      <div 
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 shadow-2xl glass-card transition-all duration-300 ${
          isDark 
            ? 'border-teal-500/30 bg-gradient-to-br from-teal-950/40 via-slate-900/90 to-slate-950 text-slate-100' 
            : 'border-stone-200 bg-gradient-to-br from-white via-amber-50/20 to-stone-50 text-stone-900 shadow-stone-200/50'
        }`}
      >
        <div className={`absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-teal-500/10' : 'bg-teal-200/30'}`}></div>
        <div className={`absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-200/30'}`}></div>
        
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3 ${isDark ? 'border-slate-700/50' : 'border-stone-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`rounded-xl p-2.5 ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'}`}>
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold tracking-wide text-base sm:text-lg uppercase">SMART HEALTH PASSPORT</h3>
              <p className={`text-xs font-bold tracking-widest ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{data.health_id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider border ${
              isDark ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse mr-1"></span>
              <span>SECURE CARD</span>
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/70 border-stone-200'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Age</span>
            <div className="flex items-center space-x-2 mt-1">
              <User className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
              <input
                type="number"
                value={data.age}
                onChange={(e) => handleInfoChange('age', parseInt(e.target.value) || 0)}
                className={`w-full bg-transparent text-sm font-bold outline-none ${isDark ? 'text-slate-100 focus:text-teal-400' : 'text-stone-800 focus:text-teal-600'}`}
              />
            </div>
          </div>

          <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/70 border-stone-200'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Gender</span>
            <div className="mt-1">
              <select
                value={data.gender}
                onChange={(e) => handleInfoChange('gender', e.target.value)}
                className={`w-full bg-transparent text-sm font-bold outline-none cursor-pointer ${isDark ? 'text-slate-100' : 'text-stone-800'}`}
              >
                <option value="Male" className={isDark ? 'bg-slate-900' : 'bg-white'}>Male</option>
                <option value="Female" className={isDark ? 'bg-slate-900' : 'bg-white'}>Female</option>
                <option value="Other" className={isDark ? 'bg-slate-900' : 'bg-white'}>Other</option>
              </select>
            </div>
          </div>

          <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/70 border-stone-200'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Blood Group</span>
            <div className="mt-1">
              <select
                value={data.blood_group}
                onChange={(e) => handleInfoChange('blood_group', e.target.value)}
                className={`w-full bg-transparent text-sm font-bold outline-none cursor-pointer ${isDark ? 'text-slate-100' : 'text-stone-800'}`}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg} className={isDark ? 'bg-slate-900' : 'bg-white'}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/70 border-stone-200'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Encryption</span>
            <div className="flex items-center space-x-1.5 mt-1 text-emerald-500 text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-dashed border-slate-700/40 flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center mr-2 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            <Sparkles className="w-3.5 h-3.5 text-teal-400 mr-1" />
            Quick Presets:
          </span>
          <button
            onClick={() => applyPreset('normal')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
            }`}
          >
            Healthy Normal
          </button>
          <button
            onClick={() => applyPreset('hypertension')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/50 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
            }`}
          >
            Hypertension Alert
          </button>
          <button
            onClick={() => applyPreset('respiratory')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-800/50 text-amber-300' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
            }`}
          >
            Low Oxygen Risk
          </button>
          <button
            onClick={() => applyPreset('athlete')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800/50 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}
          >
            Athlete (Low HR)
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`flex flex-col justify-between p-4 rounded-xl border ${
            isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/60 border-stone-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2 text-rose-500">
                <Heart className="h-4 w-4 fill-current animate-pulse" />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Pulse Rate</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${hrStatus.color}`}>
                {hrStatus.label}
              </span>
            </div>
            <div className="my-2 flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold tracking-tight">{data.vitals.heart_rate}</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>bpm</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              value={data.vitals.heart_rate}
              onChange={(e) => handleVitalChange('heart_rate', parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div className={`flex flex-col justify-between p-4 rounded-xl border ${
            isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/60 border-stone-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2 text-indigo-500">
                <Activity className="h-4 w-4" />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Blood Pressure</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${bpStatus.color}`}>
                {bpStatus.label}
              </span>
            </div>
            <div className="my-2 flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold tracking-tight">
                {data.vitals.bp_systolic}/{data.vitals.bp_diastolic}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>mmHg</span>
            </div>
            <div className="space-y-1.5">
              <div className={`flex justify-between text-[9px] font-bold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                <span>Sys: {data.vitals.bp_systolic}</span>
                <span>Dia: {data.vitals.bp_diastolic}</span>
              </div>
              <input
                type="range"
                min="80"
                max="190"
                value={data.vitals.bp_systolic}
                onChange={(e) => handleVitalChange('bp_systolic', parseInt(e.target.value))}
                className="w-full h-1.5 bg-stone-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <input
                type="range"
                min="50"
                max="120"
                value={data.vitals.bp_diastolic}
                onChange={(e) => handleVitalChange('bp_diastolic', parseInt(e.target.value))}
                className="w-full h-1.5 bg-stone-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className={`flex flex-col justify-between p-4 rounded-xl border ${
            isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-stone-100/60 border-stone-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2 text-cyan-500">
                <Thermometer className="h-4 w-4" />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>SpO2 Oxygen</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${spo2Status.color}`}>
                {spo2Status.label}
              </span>
            </div>
            <div className="my-2 flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold tracking-tight">{data.vitals.spo2}</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>%</span>
            </div>
            <input
              type="range"
              min="85"
              max="100"
              value={data.vitals.spo2}
              onChange={(e) => handleVitalChange('spo2', parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`p-5 rounded-2xl border glass-card ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-stone-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className={`text-xs uppercase font-extrabold tracking-widest flex items-center ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
              <span className="h-2 w-2 rounded-full bg-teal-500 mr-2"></span>
              Chronic Conditions
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-stone-100 text-stone-600'}`}>
              {data.chronic_conditions.length} Active
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3 max-h-[88px] overflow-y-auto pr-1">
            {data.chronic_conditions.length === 0 ? (
              <p className={`text-xs italic py-1 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>No chronic conditions registered.</p>
            ) : (
              data.chronic_conditions.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    isDark ? 'bg-teal-950/50 text-teal-300 border-teal-500/20' : 'bg-teal-50 text-teal-700 border-teal-200'
                  }`}
                >
                  {item}
                  <button
                    onClick={() => removeItem('chronic_conditions', idx)}
                    className="ml-1.5 text-[10px] font-bold opacity-75 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add Condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('chronic_conditions', newCondition, setNewCondition)}
              className={`flex-1 border text-xs rounded-xl px-3 py-2 outline-none ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-teal-500' 
                  : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-teal-600'
              }`}
            />
            <button
              onClick={() => addItem('chronic_conditions', newCondition, setNewCondition)}
              className="bg-teal-600 hover:bg-teal-500 text-slate-100 text-xs px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border glass-card ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-stone-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className={`text-xs uppercase font-extrabold tracking-widest flex items-center ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
              <span className="h-2 w-2 rounded-full bg-rose-500 mr-2"></span>
              Known Allergies
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-stone-100 text-stone-600'}`}>
              {data.allergies.length} Registered
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3 max-h-[88px] overflow-y-auto pr-1">
            {data.allergies.length === 0 ? (
              <p className={`text-xs italic py-1 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>No allergies registered.</p>
            ) : (
              data.allergies.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    isDark ? 'bg-rose-950/50 text-rose-300 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {item}
                  <button
                    onClick={() => removeItem('allergies', idx)}
                    className="ml-1.5 text-[10px] font-bold opacity-75 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add Allergy"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('allergies', newAllergy, setNewAllergy)}
              className={`flex-1 border text-xs rounded-xl px-3 py-2 outline-none ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-teal-500' 
                  : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-teal-600'
              }`}
            />
            <button
              onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
              className="bg-teal-600 hover:bg-teal-500 text-slate-100 text-xs px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border glass-card ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-stone-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className={`text-xs uppercase font-extrabold tracking-widest flex items-center ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
              <span className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
              Current Medications
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-stone-100 text-stone-600'}`}>
              {data.current_medications.length} Active
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3 max-h-[88px] overflow-y-auto pr-1">
            {data.current_medications.length === 0 ? (
              <p className={`text-xs italic py-1 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>No medications listed.</p>
            ) : (
              data.current_medications.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    isDark ? 'bg-indigo-950/50 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {item}
                  <button
                    onClick={() => removeItem('current_medications', idx)}
                    className="ml-1.5 text-[10px] font-bold opacity-75 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add Medication"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('current_medications', newMedication, setNewMedication)}
              className={`flex-1 border text-xs rounded-xl px-3 py-2 outline-none ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-teal-500' 
                  : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-teal-600'
              }`}
            />
            <button
              onClick={() => addItem('current_medications', newMedication, setNewMedication)}
              className="bg-teal-600 hover:bg-teal-500 text-slate-100 text-xs px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
