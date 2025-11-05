import React, { forwardRef, useEffect } from 'react';
import type { TestStatus } from '../types';

interface TypingAreaProps {
  userInput: string;
  onInputChange: (value: string) => void;
  status: TestStatus;
  isDictating: boolean;
  isDictationSupported: boolean;
  onToggleDictation: () => void;
  autoCorrect: boolean;
  onAutoCorrectChange: (checked: boolean) => void;
  persistentDictation: boolean;
  onPersistentDictationChange: (checked: boolean) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  onEnhancePrompt: () => void;
  isEnhancingPrompt: boolean;
  onToggleCanvasEditor: () => void;
  onFinish: () => void;
  onReset: () => void;
  isFinishDisabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCopy: () => void;
  isCopied: boolean;
  onManualCorrect: () => void;
  isManualCorrecting: boolean;
  onPauseResume: () => void;
  isAiEnabled: boolean;
}

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
);

const TranslateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2v3" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
    </svg>
);

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 3v4"/><path d="M17 10h4"/><path d="M21 7h-4"/></svg>
);

const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.648 0-.926-.746-1.648-1.648-1.648s-1.648.746-1.648 1.648c0 .926.746 1.648 1.648 1.648 0 .926-.746 1.648-1.648 1.648s-1.648-.746-1.648-1.648S8.5 18 8.5 18s-1.648.746-1.648 1.648S6 21 6 21s-1.648.746-1.648 1.648-1.648-.746-1.648-1.648-1.648.746-1.648 1.648S2 22 2 22s-1.648.746-1.648 1.648-1.648-.746-1.648-1.648-1.648.746-1.648 1.648c0 .926.746 1.648 1.648 1.648.926 0 1.648-.746 1.648-1.648 0-.926-.746-1.648-1.648-1.648s-1.648.746-1.648 1.648S12 22 12 22s1.648.746 1.648 1.648 1.648-.746 1.648-1.648 1.648.746 1.648 1.648 1.648-.746 1.648-1.648S22 12 22 12s-.746-1.648-1.648-1.648-1.648.746-1.648 1.648-1.648.746-1.648 1.648-1.648-.746-1.648-1.648S12 2 12 2Z"/></svg>
);

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
    </svg>
);

const PersistentDictationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
);

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);


export const TypingArea = forwardRef<HTMLTextAreaElement, TypingAreaProps>(({ 
    userInput, 
    onInputChange, 
    status,
    isDictating,
    isDictationSupported,
    onToggleDictation,
    autoCorrect,
    onAutoCorrectChange,
    persistentDictation,
    onPersistentDictationChange,
    onTranslate,
    isTranslating,
    onEnhancePrompt,
    isEnhancingPrompt,
    onToggleCanvasEditor,
    onFinish,
    onReset,
    isFinishDisabled,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onCopy,
    isCopied,
    onManualCorrect,
    isManualCorrecting,
    onPauseResume,
    isAiEnabled
}, ref) => {

  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      if (status !== 'finished' && status !== 'paused') {
        ref.current.focus();
      } else {
        ref.current.blur();
      }
    }
  }, [status, ref]);

  const isPaused = status === 'paused';

  return (
    <div>
      <textarea
        ref={ref}
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        className="w-full min-h-[240px] p-5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-lg font-mono leading-loose focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
        placeholder={
            isPaused
                ? "Analiz duraklatıldı. Devam etmek için butona tıklayın..."
                : isDictating 
                    ? 'Dinliyorum, konuşmaya başlayabilirsiniz...' 
                    : 'Dil bilgisi ve yazımını kontrol etmek istediğiniz metni buraya yazın...'
        }
        spellCheck="false"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        disabled={status === 'finished' || isPaused}
      />
      <div className="mt-4 flex flex-col gap-4">
            {/* Row 1: Primary Actions & Dictation Controls */}
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onReset}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2.5 rounded-lg text-slate-400 bg-slate-700 hover:bg-slate-600 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                        title="Temizle"
                        aria-label="Metin alanını temizle"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onCopy}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={userInput.trim().length === 0}
                        className={`p-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed ${
                            isCopied 
                            ? 'bg-emerald-600 text-white focus:ring-emerald-500' 
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                        aria-label={isCopied ? 'Kopyalandı' : 'Metni kopyala'}
                        title={isCopied ? 'Kopyalandı!' : 'Metni Kopyala'}
                    >
                        {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
                
                {isDictationSupported && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={onToggleDictation}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={status === 'finished' || isPaused}
                            className={`p-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            isDictating 
                                ? 'bg-red-600 text-white animate-pulse focus:ring-red-500' 
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 focus:ring-blue-500'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={isDictating ? 'Dikteyi durdur' : 'Dikte ile yaz'}
                            title="Dikteyi aç/kapat (Shift + Z)"
                        >
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => {
                                onAutoCorrectChange(!autoCorrect);
                                if (userInput.trim().length > 0) {
                                    onManualCorrect();
                                }
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={!isAiEnabled || status === 'finished' || isManualCorrecting || isPaused}
                            className={`relative p-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                autoCorrect
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                            title={`Metni Düzelt (Otomatik Düzeltme: ${autoCorrect ? 'Açık' : 'Kapalı'})`}
                            aria-pressed={autoCorrect}
                        >
                            <PencilIcon className="w-5 h-5" />
                            {isManualCorrecting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-lg">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </button>
                         <button
                            onClick={() => onPersistentDictationChange(!persistentDictation)}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={status === 'finished' || isPaused}
                            className={`p-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                persistentDictation
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                            title={persistentDictation ? 'Sürekli Dikte Açık' : 'Sürekli Dikte Kapalı'}
                            aria-pressed={persistentDictation}
                        >
                            <PersistentDictationIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    {(status === 'typing' || isPaused) && (
                         <button
                            onClick={onPauseResume}
                            onMouseDown={(e) => e.preventDefault()}
                            className="p-2.5 rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors"
                            title={isPaused ? 'Devam Et' : 'Duraklat'}
                            aria-label={isPaused ? 'Analiz zamanlayıcısını devam ettir' : 'Analiz zamanlayıcısını duraklat'}
                        >
                            {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                        </button>
                    )}
                    <button
                        onClick={onFinish}
                        disabled={isFinishDisabled || isPaused}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Değerlendir
                    </button>
                </div>
            </div>

            {/* Row 2: Toolbar */}
            <div className="flex justify-center items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                <button
                    onClick={onEnhancePrompt}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!isAiEnabled || status === 'finished' || isEnhancingPrompt || userInput.trim().length === 0 || isPaused}
                    className="relative p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Prompt'u Geliştir"
                    aria-label="Yazdığınız prompt'u yapay zeka için geliştirir"
                >
                    <WandIcon className="w-5 h-5" />
                    {isEnhancingPrompt && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-lg">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </button>
                 <button
                    onClick={onTranslate}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!isAiEnabled || status === 'finished' || isTranslating || userInput.trim().length === 0 || isPaused}
                    className="relative p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Metni Çevir"
                    aria-label="Metni otomatik olarak İngilizce veya Türkçe'ye çevirir"
                >
                    <TranslateIcon className="w-5 h-5" />
                    {isTranslating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-lg">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </button>
                <button
                    onClick={onToggleCanvasEditor}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={status === 'finished' || userInput.trim().length === 0 || isPaused}
                    className="relative p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Kanvas Modu"
                    aria-label="Metni görsel olarak düzenlemek için kanvası aç"
                >
                    <PaletteIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center rounded-lg bg-slate-700">
                    <button
                        onClick={onUndo}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={!canUndo || isPaused}
                        className="p-2.5 rounded-l-lg hover:bg-slate-600 disabled:text-slate-500 disabled:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        title="Önceki Metin"
                        aria-label="Önceki Metne Git"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="w-px h-5 bg-slate-600"></div>
                    <button
                        onClick={onRedo}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={!canRedo || isPaused}
                        className="p-2.5 rounded-r-lg hover:bg-slate-600 disabled:text-slate-500 disabled:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        title="Sonraki Metin"
                        aria-label="Sonraki Metne Git"
                    >
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
       </div>
    </div>
  );
});