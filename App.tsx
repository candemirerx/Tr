
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TypingArea } from './components/TypingArea';
import { StatsDisplay } from './components/StatsDisplay';
import { FeedbackCard } from './components/FeedbackCard';
import { Header } from './components/Header';
import { checkTurkishGrammar } from './services/geminiService';
import { SAMPLE_TEXTS } from './constants';
import type { TestStatus, TypingStats, GrammarFeedback } from './types';

const App: React.FC = () => {
  const [currentText, setCurrentText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [status, setStatus] = useState<TestStatus>('waiting');
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 0, time: 0 });
  const [grammarFeedback, setGrammarFeedback] = useState<GrammarFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const selectNewText = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    setCurrentText(SAMPLE_TEXTS[randomIndex]);
  }, []);

  useEffect(() => {
    selectNewText();
  }, [selectNewText]);

  const resetTest = useCallback(() => {
    selectNewText();
    setUserInput('');
    setStatus('waiting');
    setStats({ wpm: 0, accuracy: 0, time: 0 });
    setGrammarFeedback(null);
    setIsLoading(false);
    setError(null);
    setStartTime(null);
  }, [selectNewText]);

  const handleInputChange = (value: string) => {
    if (status === 'finished') return;

    if (status === 'waiting' && value.length > 0) {
      setStatus('typing');
      setStartTime(Date.now());
    }

    setUserInput(value);
  };

  const finishTest = useCallback(async () => {
    if (status !== 'typing' || !startTime) return;

    setStatus('finished');
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000; // in seconds

    const typedChars = userInput.length;
    let correctChars = 0;
    for (let i = 0; i < typedChars; i++) {
      if (userInput[i] === currentText[i]) {
        correctChars++;
      }
    }
    
    const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 0;
    const wpm = (correctChars / 5) / (elapsedTime / 60);

    setStats({
      wpm: Math.round(wpm),
      accuracy: parseFloat(accuracy.toFixed(2)),
      time: parseFloat(elapsedTime.toFixed(2)),
    });

    setIsLoading(true);
    setError(null);
    try {
      const feedback = await checkTurkishGrammar(userInput);
      setGrammarFeedback(feedback);
    } catch (err) {
      setError('Dil bilgisi kontrolü sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [status, startTime, userInput, currentText]);

  useEffect(() => {
    if (userInput.length === currentText.length && status === 'typing') {
      finishTest();
    }
  }, [userInput, currentText, status, finishTest]);
  
  const characters = useMemo(() => {
    return currentText.split('').map((char, index) => {
      let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
      if (index < userInput.length) {
        state = char === userInput[index] ? 'correct' : 'incorrect';
      }
      return { char, state };
    });
  }, [currentText, userInput]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center p-4 sm:p-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 mt-10">
        <div className="w-full p-6 bg-slate-800 rounded-xl shadow-lg transition-all">
          <TypingArea
            characters={characters}
            userInput={userInput}
            onInputChange={handleInputChange}
            status={status}
            key={currentText} // Force re-mount on text change
          />
        </div>

        <div className="w-full flex justify-center space-x-4">
          {status === 'typing' && (
             <button
              onClick={finishTest}
              className="px-6 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Bitir ve Değerlendir
            </button>
          )}

          {(status === 'finished' || status === 'waiting') && (
            <button
              onClick={resetTest}
              className="px-6 py-2 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
            >
              Yeni Metin
            </button>
          )}
        </div>
        
        {status === 'finished' && (
          <div className="w-full flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 w-full">
              <StatsDisplay stats={stats} grammarScore={grammarFeedback?.score} />
            </div>
            <div className="lg:w-2/3 w-full">
              <FeedbackCard feedback={grammarFeedback} isLoading={isLoading} error={error} />
            </div>
          </div>
        )}
      </main>
       <footer className="w-full max-w-4xl mx-auto text-center py-8 mt-auto text-slate-500">
        <p>Türkçe Klavye Ustalığı - Gemini API ile Güçlendirilmiştir</p>
      </footer>
    </div>
  );
};

export default App;
