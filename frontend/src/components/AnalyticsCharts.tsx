import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import type { Vitals } from './HealthCard';
import { Activity, Percent } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HistoricalRecord {
  name: string;
  heart_rate: number;
  bp_systolic: number;
  bp_diastolic: number;
  spo2: number;
}

interface AnalyticsChartsProps {
  currentVitals: Vitals;
}

const HISTORICAL_BASE: HistoricalRecord[] = [
  { name: '10d Ago', heart_rate: 72, bp_systolic: 120, bp_diastolic: 80, spo2: 98 },
  { name: '7d Ago', heart_rate: 78, bp_systolic: 124, bp_diastolic: 82, spo2: 97 },
  { name: '5d Ago', heart_rate: 85, bp_systolic: 130, bp_diastolic: 84, spo2: 96 },
  { name: '2d Ago', heart_rate: 80, bp_systolic: 128, bp_diastolic: 82, spo2: 98 },
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ currentVitals }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data: HistoricalRecord[] = React.useMemo(() => {
    return [
      ...HISTORICAL_BASE,
      {
        name: 'Current',
        heart_rate: currentVitals.heart_rate,
        bp_systolic: currentVitals.bp_systolic,
        bp_diastolic: currentVitals.bp_diastolic,
        spo2: currentVitals.spo2
      }
    ];
  }, [currentVitals]);

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e7e5e4',
      borderRadius: '12px',
      color: isDark ? '#f8fafc' : '#1c1917',
      fontSize: '11px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      padding: '8px 12px',
    },
    itemStyle: {
      color: isDark ? '#14b8a6' : '#0d9488',
      fontWeight: 600,
    }
  };

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#64748b' : '#78716c';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`p-5 rounded-2xl border shadow-lg glass-card flex flex-col space-y-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/90 border-stone-200 shadow-stone-200/50'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
          <div className="flex items-center space-x-2 text-teal-500">
            <Activity className="h-5 w-5" />
            <h4 className={`font-extrabold tracking-wide text-sm ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
              Pulse & Blood Pressure Trends
            </h4>
          </div>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
            Dynamic Vitals Node
          </span>
        </div>

        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} tickLine={false} />
              <YAxis domain={[40, 190]} stroke={axisColor} tickLine={false} />
              <Tooltip 
                contentStyle={customTooltipStyle.contentStyle} 
                itemStyle={customTooltipStyle.itemStyle}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High HR', fill: '#f59e0b', position: 'insideRight', fontSize: 9 }} />
              <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Low HR', fill: '#3b82f6', position: 'insideRight', fontSize: 9 }} />
              
              <Line
                name="Systolic BP"
                type="monotone"
                dataKey="bp_systolic"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Diastolic BP"
                type="monotone"
                dataKey="bp_diastolic"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="Heart Rate"
                type="monotone"
                dataKey="heart_rate"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border shadow-lg glass-card flex flex-col space-y-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/90 border-stone-200 shadow-stone-200/50'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-stone-200'}`}>
          <div className="flex items-center space-x-2 text-cyan-500">
            <Percent className="h-5 w-5" />
            <h4 className={`font-extrabold tracking-wide text-sm ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
              Oxygen Saturation (SpO2) Timeline
            </h4>
          </div>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
            Hypoxia Limit Alert
          </span>
        </div>

        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} tickLine={false} />
              <YAxis domain={[80, 100]} stroke={axisColor} tickLine={false} />
              <Tooltip 
                contentStyle={customTooltipStyle.contentStyle} 
                itemStyle={customTooltipStyle.itemStyle}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              
              <ReferenceLine 
                y={94} 
                stroke="#ef4444" 
                strokeWidth={1.5}
                strokeDasharray="4 4" 
                label={{ value: 'Hypoxia Boundary (<95%)', fill: '#ef4444', position: 'top', fontSize: 10, fontWeight: 'bold' }} 
              />

              <Area
                name="Oxygen Saturation"
                type="monotone"
                dataKey="spo2"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSpO2)"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
