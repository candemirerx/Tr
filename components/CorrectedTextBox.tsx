import React, { useState } from 'react';

interface CorrectedTextBoxProps {
  text: string;
}

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);


export const CorrectedTextBox: React.FC<CorrectedTextBoxProps> = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-5 relative">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-300">Düzeltilmiş Metin</h3>
            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                isCopied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                aria-label="Düzeltilmiş metni kopyala"
            >
                {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {isCopied ? 'Kopyalandı!' : 'Kopyala'}
            </button>
      </div>
      <div className="p-4 bg-slate-900 rounded-lg text-base leading-relaxed whitespace-pre-wrap font-mono text-slate-300 border border-slate-700 min-h-[150px]">
        {text}
      </div>
    </div>
  );
};
