import { VocabularyItem, PhraseItem } from '@/types/vocabulary';

class ApiClient {
  private baseUrl = '/api';

  // 词汇相关API
  async getAllVocabulary(): Promise<VocabularyItem[]> {
    const response = await fetch(`${this.baseUrl}/vocabulary`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取词汇数据失败');
  }

  async getVocabularyByLevel(level: string): Promise<VocabularyItem[]> {
    const response = await fetch(`${this.baseUrl}/vocabulary?level=${level}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取词汇数据失败');
  }

  async getVocabularyByDifficultyRange(min: number, max: number): Promise<VocabularyItem[]> {
    const response = await fetch(`${this.baseUrl}/vocabulary?minScore=${min}&maxScore=${max}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取词汇数据失败');
  }

  // 短语相关API
  async getAllPhrases(): Promise<PhraseItem[]> {
    const response = await fetch(`${this.baseUrl}/phrases`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取短语数据失败');
  }

  async getPhrasesByDifficultyRange(min: number, max: number): Promise<PhraseItem[]> {
    const response = await fetch(`${this.baseUrl}/phrases?minScore=${min}&maxScore=${max}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取短语数据失败');
  }

  // 统计相关API
  async getVocabularyStats(userId: string = 'default') {
    const response = await fetch(`${this.baseUrl}/stats?type=vocabulary&userId=${userId}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取统计数据失败');
  }

  async getPhraseStats(userId: string = 'default') {
    const response = await fetch(`${this.baseUrl}/stats?type=phrases&userId=${userId}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取统计数据失败');
  }

  async getAllStats(userId: string = 'default') {
    const response = await fetch(`${this.baseUrl}/stats?userId=${userId}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '获取统计数据失败');
  }
}

export const apiClient = new ApiClient();
