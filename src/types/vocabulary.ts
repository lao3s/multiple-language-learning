export interface VocabularyItem {
  english: string;
  chinese: string;
  pos: string;
  level: string;
  difficulty_score: number;
}

export interface VocabularyData {
  metadata: {
    total_words: number;
    levels: string[];
    description: string;
  };
  vocabulary: VocabularyItem[];
}

export type StudyMode = 'chinese-to-english' | 'english-to-chinese' | 'mixed';

export type DifficultyMode = 'auto' | 'beginner' | 'expert' | 'hell' | 'custom';

export interface DifficultyModeConfig {
  id: DifficultyMode;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface QuestionRecord {
  word: VocabularyItem;
  questionMode: StudyMode;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answerTime: Date;
}

export interface StudySession {
  mode: StudyMode;
  difficultyMode: DifficultyMode;
  totalQuestions: number;
  currentQuestion: number;
  correctAnswers: number;
  wrongAnswers: VocabularyItem[];
  startTime: Date;
  questionRecords?: QuestionRecord[];
}

export interface LevelStats {
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastUpdated: Date;
}

export interface WordStats {
  word: string;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  accuracy: number;
  lastAttempted: Date;
}

export interface StudyStats {
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  weakWords: VocabularyItem[];
  levelStats: LevelStats[];
  wordStats: WordStats[];
}

// 词组相关类型定义
export interface PhraseItem {
  english: string;
  chinese: string;
  level?: string; // 可选，用于未来扩展
  difficulty_score?: number; // 可选，用于未来扩展
}

export interface PhraseData {
  title: string;
  source: string;
  total_pages: number;
  phrases: {
    [key: string]: PhraseItem[];
  };
  statistics?: {
    [key: string]: number;
  };
}

// 词组学习会话
export interface PhraseStudySession {
  mode: StudyMode;
  difficultyMode: DifficultyMode;
  totalQuestions: number;
  currentQuestion: number;
  correctAnswers: number;
  wrongAnswers: PhraseItem[];
  startTime: Date;
  questionRecords?: PhraseQuestionRecord[];
}

export interface PhraseQuestionRecord {
  phrase: PhraseItem;
  questionMode: StudyMode;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answerTime: Date;
}

// 词组统计
export interface PhraseStats {
  phrase: string;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  accuracy: number;
  lastAttempted: Date;
}

export interface PhraseStudyStats {
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  weakPhrases: PhraseItem[];
  phraseStats: PhraseStats[];
}

export interface LanguageSystem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  isAvailable: boolean;
}
