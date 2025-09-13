import { VocabularyItem, StudyStats, StudySession, LevelStats, WordStats } from '@/types/vocabulary';
import { fileStorageService } from './fileStorage';

const STORAGE_KEYS = {
  WRONG_WORDS: 'english-learning-wrong-words',
  STUDY_STATS: 'english-learning-study-stats',
  CURRENT_SESSION: 'english-learning-current-session',
} as const;

export class StorageService {
  // 错题管理
  getWrongWords(): VocabularyItem[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.WRONG_WORDS);
    return stored ? JSON.parse(stored) : [];
  }

  addWrongWord(word: VocabularyItem): void {
    if (typeof window === 'undefined') return;
    const wrongWords = this.getWrongWords();
    const exists = wrongWords.find(w => w.english === word.english);
    if (!exists) {
      wrongWords.push(word);
      localStorage.setItem(STORAGE_KEYS.WRONG_WORDS, JSON.stringify(wrongWords));
    }
  }

  removeWrongWord(word: VocabularyItem): void {
    if (typeof window === 'undefined') return;
    const wrongWords = this.getWrongWords();
    const filtered = wrongWords.filter(w => w.english !== word.english);
    localStorage.setItem(STORAGE_KEYS.WRONG_WORDS, JSON.stringify(filtered));
  }

  clearWrongWords(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.WRONG_WORDS);
  }

  // 学习统计
  getStudyStats(): StudyStats {
    if (typeof window === 'undefined') {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageAccuracy: 0,
        weakWords: [],
        levelStats: [],
      };
    }
    
    const stored = localStorage.getItem(STORAGE_KEYS.STUDY_STATS);
    const defaultStats = {
      totalSessions: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageAccuracy: 0,
      weakWords: [],
      levelStats: [],
      wordStats: [],
    };
    
    if (stored) {
      const parsedStats = JSON.parse(stored);
      // 确保向后兼容，如果没有levelStats和wordStats则初始化为空数组
      return {
        ...defaultStats,
        ...parsedStats,
        levelStats: parsedStats.levelStats || [],
        wordStats: parsedStats.wordStats || [],
      };
    }
    
    return defaultStats;
  }

  updateStudyStats(session: StudySession): void {
    if (typeof window === 'undefined') return;
    const stats = this.getStudyStats();
    
    stats.totalSessions += 1;
    stats.totalQuestions += session.totalQuestions;
    stats.correctAnswers += session.correctAnswers;
    stats.averageAccuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
    
    // 更新薄弱单词
    session.wrongAnswers.forEach(word => {
      const existingIndex = stats.weakWords.findIndex(w => w.english === word.english);
      if (existingIndex >= 0) {
        // 如果已存在，不重复添加
      } else {
        stats.weakWords.push(word);
      }
    });

    localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(stats));
  }

  // 更新单个单词的等级统计
  updateWordLevelStats(word: VocabularyItem, isCorrect: boolean): void {
    if (typeof window === 'undefined') return;
    const stats = this.getStudyStats();
    
    // 查找或创建该等级的统计记录
    let levelStat = stats.levelStats.find(ls => ls.level === word.level);
    if (!levelStat) {
      levelStat = {
        level: word.level,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        lastUpdated: new Date(),
      };
      stats.levelStats.push(levelStat);
    }
    
    // 更新统计数据
    levelStat.totalQuestions += 1;
    if (isCorrect) {
      levelStat.correctAnswers += 1;
    }
    levelStat.accuracy = (levelStat.correctAnswers / levelStat.totalQuestions) * 100;
    levelStat.lastUpdated = new Date();
    
    localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(stats));
  }

  // 获取各等级的正确率
  getLevelAccuracyStats(): LevelStats[] {
    const stats = this.getStudyStats();
    return stats.levelStats.sort((a, b) => {
      // 按等级排序: A1 < A2 < B1 < B2 < C1
      const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
      return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
    });
  }

  // 获取特定等级的正确率
  getLevelAccuracy(level: string): number {
    const levelStats = this.getLevelAccuracyStats();
    const levelStat = levelStats.find(ls => ls.level === level);
    return levelStat ? levelStat.accuracy : 0;
  }

  // 更新单个单词的统计
  updateWordStats(word: VocabularyItem, isCorrect: boolean): void {
    if (typeof window === 'undefined') return;
    const stats = this.getStudyStats();
    
    // 查找或创建该单词的统计记录
    let wordStat = stats.wordStats.find(ws => ws.word === word.english);
    if (!wordStat) {
      wordStat = {
        word: word.english,
        totalAttempts: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        accuracy: 0,
        lastAttempted: new Date(),
      };
      stats.wordStats.push(wordStat);
    }
    
    // 更新统计数据
    wordStat.totalAttempts += 1;
    if (isCorrect) {
      wordStat.correctAttempts += 1;
    } else {
      wordStat.wrongAttempts += 1;
    }
    wordStat.accuracy = (wordStat.correctAttempts / wordStat.totalAttempts) * 100;
    wordStat.lastAttempted = new Date();
    
    localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(stats));
  }

  // 获取单词统计
  getWordStats(): WordStats[] {
    const stats = this.getStudyStats();
    return stats.wordStats.sort((a, b) => {
      // 按最后尝试时间排序，最近的在前
      return new Date(b.lastAttempted).getTime() - new Date(a.lastAttempted).getTime();
    });
  }

  // 获取特定单词的统计
  getWordStat(word: string): WordStats | null {
    const wordStats = this.getWordStats();
    return wordStats.find(ws => ws.word === word) || null;
  }

  // 获取最需要复习的单词（正确率最低的）
  getWordsNeedingReview(limit: number = 10): WordStats[] {
    const wordStats = this.getWordStats();
    return wordStats
      .filter(ws => ws.totalAttempts >= 2) // 至少尝试过2次
      .sort((a, b) => a.accuracy - b.accuracy) // 按正确率升序排序
      .slice(0, limit);
  }

  // 当前学习会话
  saveCurrentSession(session: StudySession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }

  getCurrentSession(): StudySession | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return stored ? JSON.parse(stored) : null;
  }

  clearCurrentSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  // 文件存储相关功能
  
  /**
   * 导出错题记录到本地文件
   */
  async exportWrongWordsToFile(): Promise<boolean> {
    const wrongWords = this.getWrongWords();
    return await fileStorageService.exportWrongWordsToFile(wrongWords);
  }

  /**
   * 从本地文件导入错题记录
   */
  async importWrongWordsFromFile(): Promise<boolean> {
    try {
      const importedWords = await fileStorageService.importWrongWordsFromFile();
      if (importedWords && importedWords.length > 0) {
        // 合并导入的错题与现有错题
        const existingWords = this.getWrongWords();
        const mergedWords = [...existingWords];
        
        importedWords.forEach(word => {
          const exists = mergedWords.find(w => w.english === word.english);
          if (!exists) {
            mergedWords.push(word);
          }
        });
        
        localStorage.setItem(STORAGE_KEYS.WRONG_WORDS, JSON.stringify(mergedWords));
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入错题记录失败:', error);
      return false;
    }
  }

  /**
   * 创建完整的学习数据备份
   */
  async createFullBackup(): Promise<boolean> {
    const wrongWords = this.getWrongWords();
    const studyStats = this.getStudyStats();
    return await fileStorageService.createFullBackup(wrongWords, studyStats);
  }

  /**
   * 从备份恢复学习数据
   */
  async restoreFromBackup(): Promise<boolean> {
    try {
      const backupData = await fileStorageService.restoreFromBackup();
      if (backupData) {
        // 恢复错题记录
        if (backupData.wrongWords && Array.isArray(backupData.wrongWords)) {
          localStorage.setItem(STORAGE_KEYS.WRONG_WORDS, JSON.stringify(backupData.wrongWords));
        }
        
        // 恢复学习统计
        if (backupData.studyStats) {
          localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(backupData.studyStats));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return false;
    }
  }

  /**
   * 获取文件存储信息
   */
  getFileStorageInfo() {
    return fileStorageService.getStorageInfo();
  }

  /**
   * 检查文件系统访问权限
   */
  async checkFileSystemPermissions(): Promise<boolean> {
    return await fileStorageService.checkFileSystemPermissions();
  }
}

export const storageService = new StorageService();
