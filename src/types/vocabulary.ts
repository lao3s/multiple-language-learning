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

export interface LanguageSystem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  isAvailable: boolean;
}
