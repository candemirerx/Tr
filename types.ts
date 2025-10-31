
export type TestStatus = 'waiting' | 'typing' | 'finished';

export interface TypingStats {
  wpm: number;
  accuracy: number;
  time: number;
}

export interface GrammarError {
  incorrectWord: string;
  correction: string;
  explanation: string;
}

export interface GrammarFeedback {
  score: number;
  errors: GrammarError[];
  summary: string;
}
