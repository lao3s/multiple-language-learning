import { VocabularyItem, PhraseItem } from '@/types/vocabulary';

// 数据适配器接口
export interface DataAdapter {
  getAllVocabulary(): VocabularyItem[];
  getVocabularyByLevel(level: string): VocabularyItem[];
  getVocabularyByDifficultyRange(min: number, max: number): VocabularyItem[];
  getAllPhrases(): PhraseItem[];
  getPhrasesByDifficultyRange(min: number, max: number): PhraseItem[];
  getVocabularyStats(): { total: number; studied: number; correct: number; wrong: number };
  getPhraseStats(): { total: number; studied: number; correct: number; wrong: number };
}

// JSON文件适配器（用于开发环境）
export class JsonDataAdapter implements DataAdapter {
  private vocabularyData: any;
  private phraseData: any;
  private allVocabulary: VocabularyItem[] = [];
  private allPhrases: PhraseItem[] = [];

  constructor() {
    // 动态导入JSON数据
    this.loadData();
  }

  private loadData() {
    try {
      // 使用require动态加载，避免构建时的问题
      this.vocabularyData = require('@/data/vocabulary_clean.json');
      this.phraseData = require('@/data/phrases_c1_extracted.json');
      
      this.allVocabulary = this.vocabularyData.vocabulary || [];
      this.allPhrases = this.processPhrasesData();
    } catch (error) {
      console.error('加载JSON数据失败:', error);
      this.allVocabulary = [];
      this.allPhrases = [];
    }
  }

  private processPhrasesData(): PhraseItem[] {
    const phrases: PhraseItem[] = [];
    
    if (this.phraseData && this.phraseData.phrases) {
      Object.entries(this.phraseData.phrases).forEach(([pageKey, pageData]: [string, any]) => {
        if (Array.isArray(pageData)) {
          pageData.forEach(phrase => {
            phrases.push({
              english: phrase.english,
              chinese: phrase.chinese,
              level: 'C1',
              difficulty_score: this.calculateDifficultyScore(phrase.english)
            });
          });
        }
      });
    }

    return phrases;
  }

  private calculateDifficultyScore(phrase: string): number {
    // 基于长度和复杂度计算难度分数
    const length = phrase.length;
    const wordCount = phrase.split(' ').length;
    const hasComplexWords = /[A-Z]/.test(phrase) || phrase.includes("'");
    
    let score = Math.min(length * 2, 40); // 长度因子，最多40分
    score += Math.min(wordCount * 5, 30); // 单词数因子，最多30分
    score += hasComplexWords ? 20 : 0; // 复杂度因子
    
    return Math.min(score, 100);
  }

  getAllVocabulary(): VocabularyItem[] {
    return this.allVocabulary;
  }

  getVocabularyByLevel(level: string): VocabularyItem[] {
    return this.allVocabulary.filter(word => word.level === level);
  }

  getVocabularyByDifficultyRange(min: number, max: number): VocabularyItem[] {
    return this.allVocabulary.filter(word => 
      word.difficulty_score >= min && word.difficulty_score <= max
    );
  }

  getAllPhrases(): PhraseItem[] {
    return this.allPhrases;
  }

  getPhrasesByDifficultyRange(min: number, max: number): PhraseItem[] {
    return this.allPhrases.filter(phrase => 
      phrase.difficulty_score! >= min && phrase.difficulty_score! <= max
    );
  }

  getVocabularyStats() {
    return {
      total: this.allVocabulary.length,
      studied: 0, // 这些统计需要从localStorage获取
      correct: 0,
      wrong: 0
    };
  }

  getPhraseStats() {
    return {
      total: this.allPhrases.length,
      studied: 0, // 这些统计需要从localStorage获取
      correct: 0,
      wrong: 0
    };
  }
}

// 数据库适配器（用于生产环境，当数据库可用时）
export class DatabaseAdapter implements DataAdapter {
  // 这里可以实现数据库版本
  // 暂时先用JSON适配器的实现
  private jsonAdapter = new JsonDataAdapter();

  getAllVocabulary(): VocabularyItem[] {
    return this.jsonAdapter.getAllVocabulary();
  }

  getVocabularyByLevel(level: string): VocabularyItem[] {
    return this.jsonAdapter.getVocabularyByLevel(level);
  }

  getVocabularyByDifficultyRange(min: number, max: number): VocabularyItem[] {
    return this.jsonAdapter.getVocabularyByDifficultyRange(min, max);
  }

  getAllPhrases(): PhraseItem[] {
    return this.jsonAdapter.getAllPhrases();
  }

  getPhrasesByDifficultyRange(min: number, max: number): PhraseItem[] {
    return this.jsonAdapter.getPhrasesByDifficultyRange(min, max);
  }

  getVocabularyStats() {
    return this.jsonAdapter.getVocabularyStats();
  }

  getPhraseStats() {
    return this.jsonAdapter.getPhraseStats();
  }
}

// 创建数据适配器实例
const createDataAdapter = (): DataAdapter => {
  // 可以根据环境变量或配置选择适配器
  const useDatabase = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';
  
  if (useDatabase) {
    return new DatabaseAdapter();
  } else {
    return new JsonDataAdapter();
  }
};

export const dataAdapter = createDataAdapter();
