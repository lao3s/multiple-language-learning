import { PhraseData, PhraseItem, StudyMode, DifficultyMode, DifficultyModeConfig } from '@/types/vocabulary';
import phrasesRawData from '@/data/phrases_c1_extracted.json';
import { storageService } from './storage';

export class PhraseService {
  private data: PhraseData;
  private allPhrases: PhraseItem[];

  // 难度模式配置（复用单词学习的配置）
  private difficultyModes: DifficultyModeConfig[] = [
    {
      id: 'auto',
      name: '自动模式',
      description: '根据历史正确率自动调整难度',
      icon: '🤖',
      color: 'bg-purple-500'
    },
    {
      id: 'beginner',
      name: '初学者模式',
      description: '简单常用词组',
      icon: '🌱',
      color: 'bg-green-500'
    },
    {
      id: 'expert',
      name: '进阶模式',
      description: '中等难度词组',
      icon: '💪',
      color: 'bg-blue-500'
    },
    {
      id: 'hell',
      name: '高级模式',
      description: '高难度复杂词组',
      icon: '🔥',
      color: 'bg-red-500'
    },
    {
      id: 'custom',
      name: '自定义模式',
      description: '手动选择范围',
      icon: '⚙️',
      color: 'bg-gray-500'
    }
  ];

  constructor() {
    this.data = phrasesRawData as PhraseData;
    this.allPhrases = this.processRawData();
  }

  /**
   * 处理原始JSON数据，将分页结构转换为统一的词组列表
   */
  private processRawData(): PhraseItem[] {
    const phrases: PhraseItem[] = [];
    
    // 遍历所有页面的词组
    Object.entries(this.data.phrases).forEach(([pageKey, pageData]) => {
      if (Array.isArray(pageData)) {
        pageData.forEach(phrase => {
          // 为每个词组添加基础属性
          phrases.push({
            english: phrase.english,
            chinese: phrase.chinese,
            level: 'C1', // 默认设为C1级别，因为数据来源是C1精通级
            difficulty_score: this.calculateDifficultyScore(phrase.english)
          });
        });
      }
    });

    return phrases;
  }

  /**
   * 计算词组难度分数（基于长度和复杂度）
   */
  private calculateDifficultyScore(phrase: string): number {
    let score = 0;
    
    // 基于词组长度
    const wordCount = phrase.split(' ').length;
    score += wordCount * 10;
    
    // 基于字符长度
    score += phrase.length;
    
    // 检查是否包含复杂语法结构
    if (phrase.includes('of') || phrase.includes('to') || phrase.includes('for')) {
      score += 5;
    }
    
    // 检查是否包含动词变位
    if (phrase.includes('ing') || phrase.includes('ed') || phrase.includes('s ')) {
      score += 3;
    }
    
    return Math.min(score, 100); // 限制在100以内
  }

  /**
   * 获取所有词组
   */
  getAllPhrases(): PhraseItem[] {
    return this.allPhrases;
  }

  /**
   * 根据难度分数范围获取词组
   */
  getPhrasesByDifficulty(minScore: number, maxScore: number): PhraseItem[] {
    return this.allPhrases.filter(phrase => 
      phrase.difficulty_score! >= minScore && phrase.difficulty_score! <= maxScore
    );
  }

  /**
   * 获取随机词组（带权重算法）
   */
  getRandomPhrases(count: number, difficultyRange?: { min: number; max: number }): PhraseItem[] {
    let phrases = difficultyRange 
      ? this.getPhrasesByDifficulty(difficultyRange.min, difficultyRange.max)
      : this.allPhrases;
    
    // 获取词组统计，实现智能分布
    const phraseStats = storageService.getPhraseStats();
    const statsMap = new Map(phraseStats.map(ps => [ps.phrase, ps]));
    
    // 为每个词组计算权重
    const weightedPhrases = phrases.map(phrase => {
      const stat = statsMap.get(phrase.english);
      let weight = 1; // 基础权重
      
      if (stat) {
        // 如果有统计数据，根据正确率和尝试次数调整权重
        if (stat.accuracy < 60) {
          weight *= 2; // 正确率低的词组权重加倍
        } else if (stat.accuracy > 90) {
          weight *= 0.3; // 正确率很高的词组权重降低
        }
        
        // 最近尝试过的词组权重稍微降低
        const daysSinceLastAttempt = (Date.now() - new Date(stat.lastAttempted).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastAttempt < 1) {
          weight *= 0.5;
        }
      } else {
        // 没有学过的词组权重增加
        weight *= 1.5;
      }
      
      return { phrase, weight };
    });
    
    // 基于权重进行随机选择
    const selectedPhrases: PhraseItem[] = [];
    const availablePhrases = [...weightedPhrases];
    
    for (let i = 0; i < Math.min(count, availablePhrases.length); i++) {
      // 计算总权重
      const totalWeight = availablePhrases.reduce((sum, item) => sum + item.weight, 0);
      
      // 随机选择
      let randomWeight = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let j = 0; j < availablePhrases.length; j++) {
        randomWeight -= availablePhrases[j].weight;
        if (randomWeight <= 0) {
          selectedIndex = j;
          break;
        }
      }
      
      selectedPhrases.push(availablePhrases[selectedIndex].phrase);
      availablePhrases.splice(selectedIndex, 1);
    }
    
    // 最终随机打乱
    return selectedPhrases.sort(() => Math.random() - 0.5);
  }

  /**
   * 生成选择题选项
   */
  generateOptions(correctPhrase: PhraseItem, mode: StudyMode, count: number = 4): string[] {
    const allPhrases = this.getAllPhrases();
    const options = new Set<string>();
    
    // 添加正确答案
    const correctAnswer = mode === 'chinese-to-english' ? correctPhrase.english : correctPhrase.chinese;
    options.add(correctAnswer);

    // 添加随机错误选项
    while (options.size < count) {
      const randomPhrase = allPhrases[Math.floor(Math.random() * allPhrases.length)];
      const option = mode === 'chinese-to-english' ? randomPhrase.english : randomPhrase.chinese;
      
      if (option !== correctAnswer) {
        options.add(option);
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  /**
   * 根据难度模式获取词组
   */
  getPhrasesByDifficultyMode(mode: DifficultyMode, count: number): PhraseItem[] {
    let phrases: PhraseItem[] = [];

    switch (mode) {
      case 'beginner':
        // 初学者模式：选择简单词组（难度分数较低）
        phrases = this.getPhrasesByDifficulty(0, 30);
        break;
      
      case 'expert':
        // 进阶模式：选择中等难度词组
        phrases = this.getPhrasesByDifficulty(30, 60);
        break;
      
      case 'hell':
        // 高级模式：选择高难度词组
        phrases = this.getPhrasesByDifficulty(60, 100);
        break;
      
      case 'auto':
        // 自动模式：根据历史正确率调整难度
        phrases = this.getAutoModePhrases(count);
        break;
      
      case 'custom':
        // 自定义模式：返回所有词组
        phrases = this.getAllPhrases();
        break;
      
      default:
        phrases = this.getAllPhrases();
    }

    // 随机打乱并返回指定数量
    const shuffled = [...phrases].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * 根据难度模式获取所有符合条件的词组（不限制数量）
   */
  getAllPhrasesByDifficultyMode(mode: DifficultyMode): PhraseItem[] {
    let phrases: PhraseItem[] = [];

    switch (mode) {
      case 'beginner':
        phrases = this.getPhrasesByDifficulty(0, 30);
        break;
      
      case 'expert':
        phrases = this.getPhrasesByDifficulty(30, 60);
        break;
      
      case 'hell':
        phrases = this.getPhrasesByDifficulty(60, 100);
        break;
      
      case 'auto':
        phrases = this.getAllPhrases();
        break;
      
      case 'custom':
        phrases = this.getAllPhrases();
        break;
      
      default:
        phrases = this.getAllPhrases();
    }

    // 随机打乱
    return [...phrases].sort(() => Math.random() - 0.5);
  }

  /**
   * 自动模式的词组选择算法
   */
  private getAutoModePhrases(count: number): PhraseItem[] {
    const phraseStats = storageService.getPhraseStats();
    const allPhrases = this.getAllPhrases();
    
    // 如果没有历史数据，默认返回混合难度
    if (phraseStats.length === 0) {
      const shuffled = [...allPhrases].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // 计算各难度等级的权重
    const difficultyWeights: { [key: string]: number } = {
      'easy': 0.3,    // 0-30分
      'medium': 0.4,  // 30-60分
      'hard': 0.3     // 60-100分
    };

    // 根据历史表现调整权重
    const avgAccuracy = phraseStats.reduce((sum, stat) => sum + stat.accuracy, 0) / phraseStats.length;
    
    if (avgAccuracy < 60) {
      // 正确率低，增加简单词组比例
      difficultyWeights['easy'] = 0.5;
      difficultyWeights['medium'] = 0.3;
      difficultyWeights['hard'] = 0.2;
    } else if (avgAccuracy > 85) {
      // 正确率高，增加困难词组比例
      difficultyWeights['easy'] = 0.2;
      difficultyWeights['medium'] = 0.3;
      difficultyWeights['hard'] = 0.5;
    }

    // 根据权重选择词组
    const weightedPhrases: PhraseItem[] = [];
    
    const easyPhrases = this.getPhrasesByDifficulty(0, 30);
    const mediumPhrases = this.getPhrasesByDifficulty(30, 60);
    const hardPhrases = this.getPhrasesByDifficulty(60, 100);
    
    const easyCount = Math.ceil(count * difficultyWeights['easy']);
    const mediumCount = Math.ceil(count * difficultyWeights['medium']);
    const hardCount = count - easyCount - mediumCount;
    
    // 随机选择各难度等级的词组
    const shuffledEasy = [...easyPhrases].sort(() => Math.random() - 0.5);
    const shuffledMedium = [...mediumPhrases].sort(() => Math.random() - 0.5);
    const shuffledHard = [...hardPhrases].sort(() => Math.random() - 0.5);
    
    weightedPhrases.push(...shuffledEasy.slice(0, easyCount));
    weightedPhrases.push(...shuffledMedium.slice(0, mediumCount));
    weightedPhrases.push(...shuffledHard.slice(0, hardCount));

    // 最终随机打乱
    return [...weightedPhrases].sort(() => Math.random() - 0.5).slice(0, count);
  }

  /**
   * 搜索词组
   */
  searchPhrases(query: string): PhraseItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.allPhrases.filter(phrase => 
      phrase.english.toLowerCase().includes(lowercaseQuery) ||
      phrase.chinese.includes(query)
    );
  }

  /**
   * 获取难度模式配置
   */
  getDifficultyModes(): DifficultyModeConfig[] {
    return this.difficultyModes;
  }

  getDifficultyModeConfig(mode: DifficultyMode): DifficultyModeConfig {
    return this.difficultyModes.find(m => m.id === mode) || this.difficultyModes[0];
  }

  /**
   * 获取元数据信息
   */
  getMetadata() {
    return {
      title: this.data.title,
      source: this.data.source,
      total_pages: this.data.total_pages,
      total_phrases: this.allPhrases.length,
      difficulty_distribution: {
        easy: this.getPhrasesByDifficulty(0, 30).length,
        medium: this.getPhrasesByDifficulty(30, 60).length,
        hard: this.getPhrasesByDifficulty(60, 100).length
      }
    };
  }
}

export const phraseService = new PhraseService();
