export type TestStatus = 'waiting' | 'typing' | 'paused' | 'finished';

export interface TypingStats {
  wpm: number;
  time: number;
}

export interface GrammarError {
  errorType: 'yazım' | 'noktalama';
  text: string;
  startIndex: number;
  endIndex: number;
  correction: string;
  explanation: string;
}

export interface GrammarFeedback {
  score: number;
  errors: GrammarError[];
  summary: string;
  correctedText: string;
}

export interface GroundingDocument {
  name: string;
  content: string;
}

// FIX: Add type definitions for Web Speech API to fix compilation errors in App.tsx.
export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}