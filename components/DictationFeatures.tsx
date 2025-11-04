
import React, { useState } from 'react';

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

interface DictationFeaturesProps {
  autoCorrect: boolean;
  onAutoCorrectChange: (checked: boolean) => void;
  onCopy: () => void;
  isDisabled: boolean;
}

export const DictationFeatures: React.FC<DictationFeaturesProps> = ({ 
    autoCorrect, 
    onAutoCorrectChange, 
    onCopy,
    isDisabled 
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-slate-800 rounded-xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-blue-300">Dikte Araçları</h3>
        <button
            onClick={handleCopyClick}
            disabled={isDisabled}
            className={`p-2 rounded-full transition-colors ${
            isCopied 
                ? 'bg-emerald-600/20 text-emerald-400' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isCopied ? 'Kopyalandı' : 'Metni kopyala'}
            title={isCopied ? 'Kopyalandı!' : 'Metni kopyala'}
        >
            {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="auto-correct-toggle" className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-300">
            Dikte bitince otomatik düzelt
          </span>
          <div className="relative">
            <input 
              type="checkbox" 
              id="auto-correct-toggle" 
              className="sr-only"
              checked={autoCorrect}
              onChange={(e) => onAutoCorrectChange(e.target.checked)}
              disabled={isDisabled}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${autoCorrect ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoCorrect ? 'translate-x-full' : ''}`}></div>
          </div>
        </label>
        <p className="text-xs text-slate-500">
            Bu özellik aktifken, mikrofonu kapattığınızda metniniz otomatik olarak Gemini tarafından düzeltilir.
        </p>
      </div>

       <div className="mt-auto pt-4 border-t border-slate-700">
         <p className="text-xs text-slate-400 text-center">
            Dikteyi <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Shift</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Z</kbd> ile aç/kapat.
        </p>
       </div>
    </div>
  );
};
