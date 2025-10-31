
import React from 'react';
import type { TypingStats } from '../types';

interface StatsDisplayProps {
  stats: TypingStats;
  grammarScore?: number;
}

const StatItem: React.FC<{ label: string; value: string | number; unit?: string; className?: string }> = ({ label, value, unit, className }) => (
  <div className={`flex justify-between items-baseline p-4 rounded-lg bg-slate-700/50 ${className}`}>
    <span className="text-slate-300">{label}</span>
    <p className="text-2xl font-bold">
      {value} <span className="text-lg text-slate-400">{unit}</span>
    </p>
  </div>
);

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, grammarScore }) => {
  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center mb-2 text-blue-300">Sonuçlar</h2>
      <StatItem label="Hız (KPM)" value={stats.wpm} unit="kelime/dk" className="text-emerald-300"/>
      <StatItem label="Doğruluk" value={stats.accuracy} unit="%" className="text-yellow-300" />
      <StatItem label="Süre" value={stats.time} unit="sn" className="text-cyan-300" />
      {grammarScore !== undefined && (
         <StatItem label="İmla Puanı" value={grammarScore} unit="/100" className="text-violet-300" />
      )}
    </div>
  );
};
