
import React, { useRef, useEffect } from 'react';
import type { TestStatus } from '../types';

interface Character {
  char: string;
  state: 'correct' | 'incorrect' | 'untyped';
}

interface TypingAreaProps {
  characters: Character[];
  userInput: string;
  onInputChange: (value: string) => void;
  status: TestStatus;
}

export const TypingArea: React.FC<TypingAreaProps> = ({ characters, userInput, onInputChange, status }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status !== 'finished') {
      inputRef.current?.focus();
    } else {
       inputRef.current?.blur();
    }
  }, [status]);
  
  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        className="absolute inset-0 z-10 w-full h-full p-0 m-0 bg-transparent border-none outline-none resize-none text-transparent caret-transparent"
        spellCheck="false"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        disabled={status === 'finished'}
      />
      <div className="text-2xl leading-relaxed font-mono tracking-wide text-slate-400 select-none">
        {characters.map((item, index) => (
          <span
            key={index}
            className={`
              ${item.state === 'correct' ? 'text-green-400' : ''}
              ${item.state === 'incorrect' ? 'bg-red-500 text-white rounded-sm' : ''}
            `}
          >
            {userInput.length === index && status !== 'finished' && <Cursor />}
            {item.char}
          </span>
        ))}
         {userInput.length === characters.length && characters.length > 0 && status !== 'finished' && <Cursor />}
      </div>
    </div>
  );
};

const Cursor: React.FC = () => (
    <span className="animate-pulse text-blue-400">|</span>
);
