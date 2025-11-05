import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { TypingArea } from './components/TypingArea';
import { StatsDisplay } from './components/StatsDisplay';
import { AnalysisCard } from './components/AnalysisCard';
import { Header } from './components/Header';
import { SettingsModal, SettingsData } from './components/SettingsModal';
// FIX: Alias the imported `translateToEnglish` function to `translateTextToEnglish`
// to resolve a name conflict with the component's state variable of the same name.
// ADD: Import the new translateToTurkish function for back-translation.
// ADD: Import the new enhancePrompt function.
import { checkTurkishGrammar, translateToEnglish as translateTextToEnglish, translateToTurkish, enhancePrompt, detectLanguage } from './services/geminiService';
// FIX: Import SpeechRecognitionEvent and SpeechRecognitionErrorEvent to resolve missing type errors.
import type { TestStatus, TypingStats, GrammarFeedback, GroundingDocument, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from './types';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 w-full bg-slate-800 rounded-xl shadow-lg p-6 min-h-[200px]">
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
    <span className="text-slate-300">Doktor analiz ediyor, lütfen bekleyin...</span>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-full bg-red-900/50 border border-red-700 text-red-300 rounded-xl shadow-lg p-6">
    <h3 className="text-xl font-bold mb-2">Bir Sorun Oluştu</h3>
    <p>{message}</p>
  </div>
);

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [status, setStatus] = useState<TestStatus>('waiting');
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, time: 0 });
  const [grammarFeedback, setGrammarFeedback] = useState<GrammarFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userContext, setUserContext] = useState<string>('');
  const [groundingDocuments, setGroundingDocuments] = useState<GroundingDocument[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [isDictationSupported, setIsDictationSupported] = useState<boolean>(true);
  const [autoCorrectOnDictate, setAutoCorrectOnDictate] = useState<boolean>(false);
  const [isPersistentDictation, setIsPersistentDictation] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isManualCorrecting, setIsManualCorrecting] = useState<boolean>(false);

  // Default dictation settings
  const [defaultAutoCorrect, setDefaultAutoCorrect] = useState<boolean>(false);
  const [defaultPersistentDictation, setDefaultPersistentDictation] = useState<boolean>(false);
  const [dictationTimeout, setDictationTimeout] = useState<number>(0);

  // Prompt Enhancement Settings
  const [enhancementLevel, setEnhancementLevel] = useState<number>(0);
  const [forceRoleContext, setForceRoleContext] = useState<boolean>(false);
  const [aiModelPreference, setAiModelPreference] = useState<'flash' | 'pro'>('flash');


  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const inactivityTimeoutRef = useRef<number | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState({ stack: [''], index: 0 });
  
  // Refs to hold current state for access in callbacks, avoiding stale closures
  const autoCorrectOnDictateRef = useRef(autoCorrectOnDictate);
  useEffect(() => { autoCorrectOnDictateRef.current = autoCorrectOnDictate; }, [autoCorrectOnDictate]);
  
  const userInputRef = useRef(userInput);
  useEffect(() => { userInputRef.current = userInput; }, [userInput]);

  const isDictatingRef = useRef(isDictating);
  useEffect(() => { isDictatingRef.current = isDictating; }, [isDictating]);

  const isPersistentDictationRef = useRef(isPersistentDictation);
  useEffect(() => { isPersistentDictationRef.current = isPersistentDictation; }, [isPersistentDictation]);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const userContextRef = useRef(userContext);
  useEffect(() => { userContextRef.current = userContext; }, [userContext]);

  const groundingDocumentsRef = useRef(groundingDocuments);
  useEffect(() => { groundingDocumentsRef.current = groundingDocuments; }, [groundingDocuments]);
  
  const dictationTimeoutRef = useRef(dictationTimeout);
  useEffect(() => { dictationTimeoutRef.current = dictationTimeout; }, [dictationTimeout]);


  useEffect(() => {
    if (textAreaRef.current) {
      // Scroll to the bottom to keep the current input line in view
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [userInput]);

  useLayoutEffect(() => {
    if (textAreaRef.current && cursorPositionRef.current !== null) {
      textAreaRef.current.selectionStart = cursorPositionRef.current;
      textAreaRef.current.selectionEnd = cursorPositionRef.current;
      cursorPositionRef.current = null;
    }
  }, [userInput]);

  const pushToHistory = useCallback((text: string) => {
    setHistory(prev => {
        const newStack = prev.stack.slice(0, prev.index + 1);
        if (newStack[newStack.length - 1] === text) return prev;
        newStack.push(text);
        return { stack: newStack, index: newStack.length - 1 };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
        if (prev.index > 0) {
            const newIndex = prev.index - 1;
            setUserInput(prev.stack[newIndex]);
            return { ...prev, index: newIndex };
        }
        return prev;
    });
  }, []);

  const handleRedo = useCallback(() => {
      setHistory(prev => {
          if (prev.index < prev.stack.length - 1) {
              const newIndex = prev.index + 1;
              setUserInput(prev.stack[newIndex]);
              return { ...prev, index: newIndex };
          }
          return prev;
      });
  }, []);

  const canUndo = history.index > 0;
  const canRedo = history.index < history.stack.length - 1;

  useEffect(() => {
    try {
      const savedContext = localStorage.getItem('userContext');
      if (savedContext) setUserContext(savedContext);

      const savedTrainingData = localStorage.getItem('groundingDocuments');
      if (savedTrainingData) setGroundingDocuments(JSON.parse(savedTrainingData));

      const savedDefaults = localStorage.getItem('dictationDefaults');
      if (savedDefaults) {
        const { autoCorrect, persistent, timeout } = JSON.parse(savedDefaults);
        setDefaultAutoCorrect(autoCorrect ?? false);
        setDefaultPersistentDictation(persistent ?? false);
        setDictationTimeout(timeout ?? 0);
        // Set the initial state of the toggles to the saved defaults
        setAutoCorrectOnDictate(autoCorrect ?? false);
        setIsPersistentDictation(persistent ?? false);
      }
      
      const savedPromptSettings = localStorage.getItem('promptEnhancementSettings');
      if (savedPromptSettings) {
        const { level, force } = JSON.parse(savedPromptSettings);
        setEnhancementLevel(level ?? 0);
        setForceRoleContext(force ?? false);
      }
      
      const savedAiPref = localStorage.getItem('aiModelPreference');
      if (savedAiPref === 'pro' || savedAiPref === 'flash') {
        setAiModelPreference(savedAiPref);
      }

    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
  }, []);

  const handleAutoCorrection = useCallback(async () => {
    if (userInputRef.current.trim().length === 0 || isManualCorrecting) return;
    setIsManualCorrecting(true);
    setError(null);
    try {
      pushToHistory(userInputRef.current);
      const feedback = await checkTurkishGrammar(userInputRef.current, userContextRef.current, groundingDocumentsRef.current, aiModelPreference);
      if (feedback?.correctedText) {
          setUserInput(feedback.correctedText);
          pushToHistory(feedback.correctedText);
      }
    } catch (err) {
      setError("Metin düzeltilirken bir hata oluştu.");
      console.error("Auto-correction failed:", err);
    } finally {
        setIsManualCorrecting(false);
    }
  }, [pushToHistory, isManualCorrecting, aiModelPreference]);

  const stopDictationWithInactivityTimer = useCallback(() => {
    if (isDictatingRef.current) {
        recognitionRef.current?.stop();
    }
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsDictationSupported(false);
      console.warn("Speech Recognition not supported by this browser.");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!textAreaRef.current) return;
        if (statusRef.current === 'paused') return;

        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            newTranscript += event.results[i][0].transcript;
        }

        if (newTranscript) {
            const textToInsert = newTranscript;
            const { selectionStart, selectionEnd } = textAreaRef.current;
            const currentText = textAreaRef.current.value;
            
            const textBefore = currentText.substring(0, selectionStart);
            const textAfter = currentText.substring(selectionEnd);
            
            const space = (textBefore.length > 0 && !/\s$/.test(textBefore)) ? ' ' : '';
            const finalTextToInsert = space + textToInsert;
            
            const newText = textBefore + finalTextToInsert + textAfter;

            cursorPositionRef.current = selectionStart + finalTextToInsert.length;
            
            // When dictating, create a new history branch
            const newStack = history.stack.slice(0, history.index + 1);
            setHistory({ stack: newStack, index: history.index });
            setUserInput(newText);


            if (statusRef.current === 'waiting' && newText.length > 0) {
              setStatus('typing');
              setStartTime(Date.now());
              setAccumulatedTime(0);
            }

            if (!isPersistentDictationRef.current && dictationTimeoutRef.current > 0) {
                if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
                inactivityTimeoutRef.current = window.setTimeout(stopDictationWithInactivityTimer, dictationTimeoutRef.current * 1000);
            }
        }
    };
    
    recognition.onend = () => {
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
        }
        if (userInputRef.current.trim().length > 0) {
            pushToHistory(userInputRef.current);
        }

        if (isPersistentDictationRef.current && isDictatingRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error restarting recognition:", e);
                isDictatingRef.current = false;
                setIsDictating(false);
            }
        } else {
            setIsDictating(false);
            if (autoCorrectOnDictateRef.current && userInputRef.current.trim().length > 0) {
                handleAutoCorrection();
            }
        }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error !== 'aborted' && e.error !== 'no-speech') {
            console.error("Speech recognition error", e.error);
        }
    };
    recognitionRef.current = recognition;

    return () => recognitionRef.current?.abort();
  }, [handleAutoCorrection, stopDictationWithInactivityTimer, pushToHistory, history.stack, history.index]);

  const handleToggleDictation = useCallback(() => {
    if (!recognitionRef.current || !isDictationSupported) return;
    
    const nextIsDictating = !isDictating;
    isDictatingRef.current = nextIsDictating;
    setIsDictating(nextIsDictating);

    if (nextIsDictating) {
        // Save current typed text before starting dictation
        pushToHistory(userInput);
        try {
            recognitionRef.current.start();
            if (!isPersistentDictationRef.current && dictationTimeoutRef.current > 0) {
                 if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
                 inactivityTimeoutRef.current = window.setTimeout(stopDictationWithInactivityTimer, dictationTimeoutRef.current * 1000);
            }
        } catch (e) {
            console.error("Error starting recognition:", e);
            isDictatingRef.current = false;
            setIsDictating(false);
        }
    } else {
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
        }
        recognitionRef.current.stop();
    }
  }, [isDictating, isDictationSupported, stopDictationWithInactivityTimer, pushToHistory, userInput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && (event.key === 'Z' || event.key === 'z')) {
        event.preventDefault();
        handleToggleDictation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleToggleDictation]);


  const handleSaveSettings = (settings: SettingsData) => {
    setUserContext(settings.context);
    localStorage.setItem('userContext', settings.context);
    setGroundingDocuments(settings.documents);
    localStorage.setItem('groundingDocuments', JSON.stringify(settings.documents));
    
    const newDefaults = {
        autoCorrect: settings.defaultAutoCorrect,
        persistent: settings.defaultPersistentDictation,
        timeout: settings.dictationTimeout
    };
    localStorage.setItem('dictationDefaults', JSON.stringify(newDefaults));
    setDefaultAutoCorrect(newDefaults.autoCorrect);
    setDefaultPersistentDictation(newDefaults.persistent);
    setDictationTimeout(newDefaults.timeout);
    
    setEnhancementLevel(settings.enhancementLevel);
    setForceRoleContext(settings.forceRoleContext);
    const newPromptSettings = {
        level: settings.enhancementLevel,
        force: settings.forceRoleContext
    };
    localStorage.setItem('promptEnhancementSettings', JSON.stringify(newPromptSettings));
    
    setAiModelPreference(settings.aiModelPreference);
    localStorage.setItem('aiModelPreference', settings.aiModelPreference);


    setIsSettingsOpen(false);
  };

  const resetTest = useCallback(() => {
    if (recognitionRef.current && isDictating) {
        isDictatingRef.current = false;
        setIsDictating(false);
        recognitionRef.current.stop();
    }
    setUserInput('');
    setStatus('waiting');
    setStats({ wpm: 0, time: 0 });
    setGrammarFeedback(null);
    setIsLoading(false);
    setError(null);
    setStartTime(null);
    setAccumulatedTime(0);
    setHistory({ stack: [''], index: 0 });
    // Reset toggles to their saved defaults
    setAutoCorrectOnDictate(defaultAutoCorrect);
    setIsPersistentDictation(defaultPersistentDictation);
  }, [isDictating, defaultAutoCorrect, defaultPersistentDictation]);

  const goBackToTyping = useCallback(() => {
    setStatus('typing');
    setStartTime(Date.now()); // Restart timer when going back
    setGrammarFeedback(null);
    setError(null);
  }, []);

  const handleInputChange = (value: string) => {
    if (status === 'finished' || status === 'paused') return;

    if (status === 'waiting' && value.length > 0) {
      setStatus('typing');
      setStartTime(Date.now());
      setAccumulatedTime(0);
    }

    if (status === 'typing' && value.length === 0) {
        setStatus('waiting');
        setStartTime(null);
        setAccumulatedTime(0);
    }
    
    // When user types after an undo, create a new branch in history
    const newStack = history.stack.slice(0, history.index + 1);
    setHistory({ stack: newStack, index: history.index });
    setUserInput(value);
  };
  
  const handleCopy = useCallback(() => {
    if (userInput) {
        navigator.clipboard.writeText(userInput).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        });
    }
  }, [userInput]);

  const handleTranslation = useCallback(async () => {
    if (userInput.trim().length === 0) return;

    pushToHistory(userInput);
    setIsTranslating(true);
    setError(null);

    try {
        const detectedLang = await detectLanguage(userInput, aiModelPreference);
        let translatedText = '';

        if (detectedLang === 'tr') {
            translatedText = await translateTextToEnglish(userInput, aiModelPreference);
        } else if (detectedLang === 'en') {
            translatedText = await translateToTurkish(userInput, aiModelPreference);
        } else {
            throw new Error('Dil algılanamadı veya desteklenmiyor.');
        }
        
        setUserInput(translatedText);
        pushToHistory(translatedText);

    } catch (err: any) {
        setError(err.message || 'Metin çevrilirken bir hata oluştu.');
        console.error(err);
        // On error, revert to the text before translation
        handleUndo();
    } finally {
        setIsTranslating(false);
    }
}, [userInput, pushToHistory, handleUndo, aiModelPreference]);

  const handleEnhancePrompt = useCallback(async () => {
    if (userInput.trim().length === 0) return;

    pushToHistory(userInput);
    setIsEnhancingPrompt(true);
    setError(null);
    try {
        const enhancedText = await enhancePrompt(userInput, enhancementLevel, forceRoleContext, aiModelPreference);
        setUserInput(enhancedText);
        pushToHistory(enhancedText);
    } catch (err) {
        setError('Prompt geliştirilirken bir hata oluştu.');
        console.error(err);
    } finally {
        setIsEnhancingPrompt(false);
    }
  }, [userInput, pushToHistory, enhancementLevel, forceRoleContext, aiModelPreference]);

  const handlePauseResume = useCallback(() => {
    if (status === 'typing' && startTime) {
      // Pausing
      const intervalTime = Date.now() - startTime;
      setAccumulatedTime(prev => prev + intervalTime);
      setStartTime(null);
      setStatus('paused');
    } else if (status === 'paused') {
      // Resuming
      setStartTime(Date.now());
      setStatus('typing');
    }
  }, [status, startTime]);


  const finishTest = useCallback(async () => {
    if (recognitionRef.current && isDictating) {
      isDictatingRef.current = false; 
      setIsDictating(false); 
      recognitionRef.current.stop();
    }
    
    if (status !== 'typing' || !startTime || userInput.trim().length === 0) return;
    
    pushToHistory(userInput);
    // Always analyze the current text in the box.
    const textToAnalyze = userInput;

    setStatus('finished');
    const endTime = Date.now();
    const elapsedTime = (accumulatedTime + (endTime - startTime)) / 1000;

    const typedWords = textToAnalyze.trim().split(/\s+/).length;
    const wpm = (typedWords) / (elapsedTime / 60);

    setStats({
      wpm: Math.round(wpm),
      time: parseFloat(elapsedTime.toFixed(2)),
    });

    setIsLoading(true);
    setError(null);
    setGrammarFeedback(null);
    try {
      const feedback = await checkTurkishGrammar(textToAnalyze, userContext, groundingDocuments, aiModelPreference);
      setGrammarFeedback(feedback);
    } catch (err) {
      setError('Dil bilgisi kontrolü sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [status, startTime, userInput, userContext, groundingDocuments, isDictating, pushToHistory, aiModelPreference, accumulatedTime]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center p-4 sm:p-8">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 mt-8">
        {status !== 'finished' ? (
          <div className="w-full bg-slate-800 rounded-xl shadow-lg transition-all p-4">
                 <TypingArea
                    ref={textAreaRef}
                    userInput={userInput}
                    onInputChange={handleInputChange}
                    status={status}
                    isDictating={isDictating}
                    isDictationSupported={isDictationSupported}
                    onToggleDictation={handleToggleDictation}
                    autoCorrect={autoCorrectOnDictate}
                    onAutoCorrectChange={setAutoCorrectOnDictate}
                    persistentDictation={isPersistentDictation}
                    onPersistentDictationChange={setIsPersistentDictation}
                    onTranslate={handleTranslation}
                    isTranslating={isTranslating}
                    onEnhancePrompt={handleEnhancePrompt}
                    isEnhancingPrompt={isEnhancingPrompt}
                    onFinish={finishTest}
                    onReset={resetTest}
                    isFinishDisabled={status !== 'typing' || userInput.trim().length === 0}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onCopy={handleCopy}
                    isCopied={isCopied}
                    onManualCorrect={handleAutoCorrection}
                    isManualCorrecting={isManualCorrecting}
                    onPauseResume={handlePauseResume}
                  />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 mt-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorDisplay message={error} />
            ) : grammarFeedback ? (
              <>
                <div className="w-full flex justify-between items-center">
                    <button
                        onClick={goBackToTyping}
                        className="flex items-center gap-2 px-5 py-2 text-base font-semibold text-white bg-slate-600 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Geri
                    </button>
                    <button
                        onClick={resetTest}
                        className="px-5 py-2 text-base font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                    >
                        Yeni Analiz
                    </button>
                </div>
                <StatsDisplay stats={stats} grammarScore={grammarFeedback.score} />
                <AnalysisCard userInput={history.stack[history.index -1] || userInput} feedback={grammarFeedback} />
              </>
            ) : null}
          </div>
        )}
      </main>
       <footer className="w-full max-w-4xl mx-auto text-center py-8 mt-auto text-slate-500">
        {grammarFeedback?.summary ? (
          <p className="italic max-w-2xl mx-auto">"{grammarFeedback.summary}"</p>
        ) : (
          null
        )}
      </footer>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialContext={userContext}
        initialGroundingDocuments={groundingDocuments}
        initialDefaultAutoCorrect={defaultAutoCorrect}
        initialDefaultPersistentDictation={defaultPersistentDictation}
        initialDictationTimeout={dictationTimeout}
        initialEnhancementLevel={enhancementLevel}
        initialForceRoleContext={forceRoleContext}
        initialAiModelPreference={aiModelPreference}
      />
    </div>
  );
};

export default App;