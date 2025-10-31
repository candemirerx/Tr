
import React from 'react';

const KeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 8h.01" />
    <path d="M12 12h.01" />
    <path d="M14 8h.01" />
    <path d="M16 12h.01" />
    <path d="M18 8h.01" />
    <path d="M6 8h.01" />
    <path d="M7 16h10" />
    <path d="M8 12h.01" />
    <rect width="20" height="16" x="2" y="4" rx="2" />
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto text-center">
      <div className="flex justify-center items-center gap-4 mb-2">
        <KeyboardIcon className="w-10 h-10 text-blue-400" />
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Türkçe Klavye Ustalığı
        </h1>
      </div>
      <p className="text-lg text-slate-400">
        Yazma hızınızı test edin ve Gemini ile dil bilgisi becerilerinizi geliştirin.
      </p>
    </header>
  );
};
