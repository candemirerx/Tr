
import React from 'react';
import type { GrammarFeedback } from '../types';

interface FeedbackCardProps {
  feedback: GrammarFeedback | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
    <span className="text-slate-300">Analiz ediliyor...</span>
  </div>
);


export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-800 rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-900/50 border border-red-700 text-red-300 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-2">Hata</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-blue-300">Dil Bilgisi Geri Bildirimi</h3>
      <p className="mb-6 p-4 bg-slate-700/50 rounded-lg italic text-slate-300">"{feedback.summary}"</p>
      
      {feedback.errors.length === 0 ? (
        <div className="p-4 text-center bg-green-900/50 border border-green-700 text-green-300 rounded-lg">
          <p className="font-semibold">Harika iş! Metninizde hiçbir hata bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-200">Bulunan Hatalar:</h4>
          <ul className="space-y-3">
            {feedback.errors.map((err, index) => (
              <li key={index} className="p-4 bg-slate-700/50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-2">
                  <span className="font-mono text-red-400 line-through text-lg">
                    {err.incorrectWord}
                  </span>
                  <span className="text-2xl text-slate-400 hidden sm:block">→</span>
                  <span className="font-mono text-green-400 text-lg">
                    {err.correction}
                  </span>
                </div>
                <p className="text-slate-400">{err.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
