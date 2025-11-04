import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
          <h2 className="text-xl font-bold text-blue-300">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};
