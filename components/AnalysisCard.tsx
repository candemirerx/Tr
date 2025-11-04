
import React, { useState } from 'react';
import type { GrammarFeedback, GrammarError } from '../types';
import { Modal } from './Modal';

interface AnalysisCardProps {
  feedback: GrammarFeedback;
  userInput: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ feedback, userInput }) => {
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null);

  const handleOpenModal = (error: GrammarError) => {
    setSelectedError(error);
  };

  const handleCloseModal = () => {
    setSelectedError(null);
  };

  const renderHighlightedText = () => {
    const sortedErrors = [...feedback.errors]
      .filter(e => typeof e.startIndex === 'number' && typeof e.endIndex === 'number')
      .sort((a, b) => a.startIndex - b.startIndex);

    if (sortedErrors.length === 0) {
        return (
             <div className="p-4 bg-slate-900 rounded-lg text-base leading-relaxed whitespace-pre-wrap font-mono border border-slate-700 min-h-[150px]">
                {userInput}
            </div>
        );
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedErrors.forEach((error, i) => {
      if (error.startIndex > lastIndex) {
        parts.push(userInput.substring(lastIndex, error.startIndex));
      }

      if (error.errorType === 'yazım') {
         parts.push(
          <span 
            key={`error-${error.startIndex}-${i}`}
            className="relative inline-block cursor-pointer underline decoration-red-500 decoration-wavy"
            onClick={() => handleOpenModal(error)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenModal(error)}
            aria-label={`Hata detayı: ${error.text}`}
          >
            {userInput.substring(error.startIndex, error.endIndex)}
          </span>
        );
      } else { // noktalama
         parts.push(
          <span 
            key={`error-${error.startIndex}-${i}`}
            className="relative inline-block"
          >
            {userInput.substring(error.startIndex, error.endIndex)}
             <span 
                className="absolute -top-1 -right-1.5 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-slate-800 cursor-pointer"
                onClick={() => handleOpenModal(error)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenModal(error)}
                aria-label={`Noktalama önerisi: ${error.text} sonrası`}
            ></span>
          </span>
        );
      }
     
      lastIndex = error.endIndex;
    });

    if (lastIndex < userInput.length) {
      parts.push(userInput.substring(lastIndex));
    }

    return (
      <div className="p-4 bg-slate-900 rounded-lg text-base leading-relaxed whitespace-pre-wrap font-mono border border-slate-700 min-h-[150px]">
        {parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}
      </div>
    );
  };
  
  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-5">
        <h3 className="text-lg font-bold mb-4 text-blue-300">Hata Analizi</h3>
        
        {renderHighlightedText()}

        {feedback.errors.length === 0 && (
            <div className="mt-4 p-4 text-center bg-green-900/50 border border-green-700 text-green-300 rounded-lg">
                <p className="font-semibold">Harika iş! Metninizde hiçbir hata bulunamadı.</p>
            </div>
        )}

        {selectedError && (
            <Modal 
                isOpen={!!selectedError} 
                onClose={handleCloseModal} 
                title={selectedError.errorType === 'yazım' ? 'Yazım Hatası Analizi' : 'Noktalama Önerisi'}
            >
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-slate-700/50 rounded-md">
                        <span className="font-mono text-red-400 line-through text-lg">{selectedError.text}</span>
                        <span className="text-2xl text-slate-400 hidden sm:block">→</span>
                        <span className="font-mono text-green-400 text-lg">{selectedError.correction}</span>
                    </div>
                    <p>{selectedError.explanation}</p>
                </div>
            </Modal>
        )}
    </div>
  );
};
