import { TFile } from 'obsidian';

// === Settings ===
export interface TrainerSettings {
  apiKey: string;
  generationModel: string;
  evaluationModel: string;
  scanFolders: string[];
  scanTags: string[];
  questionRatio: { flashcard: number; quiz: number; open: number };
  questionsPerSession: number;
  language: 'ru' | 'en';
  useMockData: boolean;
}

export const DEFAULT_SETTINGS: TrainerSettings = {
  apiKey: '',
  generationModel: 'claude-haiku-4-5-20251001',
  evaluationModel: 'claude-sonnet-4-6-20250514',
  scanFolders: [],
  scanTags: [],
  questionRatio: { flashcard: 40, quiz: 30, open: 30 },
  questionsPerSession: 10,
  language: 'ru',
  useMockData: true,
};

// === Parsed Notes ===
export interface ParsedNote {
  path: string;
  title: string;
  headings: string[];
  content: string;
  hash: string;
}

export interface NoteChunk {
  noteTitle: string;
  notePath: string;
  heading: string;
  content: string;
}

// === Questions ===
export type QuestionType = 'flashcard' | 'quiz' | 'open';

export interface FlashcardQuestion {
  id: string;
  type: 'flashcard';
  sourceNote: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  type: 'quiz';
  sourceNote: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface OpenQuestion {
  id: string;
  type: 'open';
  sourceNote: string;
  question: string;
  rubric: string;
  referenceAnswer: string;
}

export type Question = FlashcardQuestion | QuizQuestion | OpenQuestion;

// === Progress ===
export interface CardProgress {
  sourceNote: string;
  type: QuestionType;
  easeFactor: number;
  intervalDays: number;
  nextReview: string;
  history: ReviewEntry[];
}

export interface ReviewEntry {
  date: string;
  score: number;
  responseTimeMs: number;
}

export interface ProgressData {
  cards: Record<string, CardProgress>;
  stats: {
    totalReviews: number;
    streakDays: number;
    lastReviewDate: string;
    masteryByTopic: Record<string, number>;
  };
}

// === Evaluation ===
export interface EvaluationResult {
  score: number;
  feedback: string;
  referenceAnswer: string;
}

// === Session ===
export interface SessionResult {
  date: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  partial: number;
  averageScore: number;
  timeSpentMs: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  userAnswer: string;
  correct: boolean;
  score: number;
  timeMs: number;
}

// === Generator Interface ===
export interface IQuestionGenerator {
  generateQuestions(chunks: NoteChunk[], types: QuestionType[], count: number): Promise<Question[]>;
  evaluateAnswer(question: OpenQuestion, userAnswer: string): Promise<EvaluationResult>;
}

// === Constants ===
export const VIEW_TYPE_TRAINER = 'knowledge-trainer-view';
