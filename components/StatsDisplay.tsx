import React from 'react';
import type { TypingStats } from '../types';

interface StatsDisplayProps {
  stats: TypingStats;
  grammarScore?: number;
}

const StatItem: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="flex flex-col items-center justify-center p-2.5 bg-slate-800 rounded-lg shadow-md">
    <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
    <p className="text-lg font-semibold text-white">
      {value} <span className="text-base font-normal text-slate-400">{unit}</span>
    </p>
  </div>
);

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, grammarScore }) => {
  return (
    <div className="w-full flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-3">
            <StatItem label="Hız" value={stats.wpm} unit="kpm" />
            <StatItem label="Süre" value={stats.time} unit="sn" />
            {grammarScore !== undefined && (
                <StatItem label="Puan" value={grammarScore} unit="/100" />
            )}
        </div>
    </div>
  );
};
