import { VocabularyData, VocabularyItem, StudyMode, DifficultyMode, DifficultyModeConfig } from '@/types/vocabulary';
import { storageService } from './storage';
import { dataAdapter } from './dataAdapter';

export class VocabularyService {
  // 难度模式配置
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
      name: '小学生模式',
      description: '只考A级题（A1-A2）',
      icon: '🌱',
      color: 'bg-green-500'
    },
    {
      id: 'expert',
      name: '高手模式',
      description: '只考B级题（B1-B2）',
      icon: '💪',
      color: 'bg-blue-500'
    },
    {
      id: 'hell',
      name: '地狱模式',
      description: '只考C级题（C1）',
      icon: '🔥',
      color: 'bg-red-500'
    },
    {
      id: 'custom',
      name: '自定义模式',
      description: '手动选择难度等级',
      icon: '⚙️',
      color: 'bg-gray-500'
    }
  ];

  constructor() {
    // 不再需要加载JSON数据，改用数据库
  }

  getAllWords(): VocabularyItem[] {
    return dataAdapter.getAllVocabulary();
  }

  getWordsByLevel(level: string): VocabularyItem[] {
    return dataAdapter.getVocabularyByLevel(level);
  }

  getWordsByDifficultyRange(min: number, max: number): VocabularyItem[] {
    return dataAdapter.getVocabularyByDifficultyRange(min, max);
  }

  getRandomWords(count: number, level?: string): VocabularyItem[] {
    const words = level ? this.getWordsByLevel(level) : this.getAllWords();
    
    // 获取单词统计，实现智能分布
    const wordStats = storageService.getWordStats();
    const statsMap = new Map(wordStats.map(ws => [ws.word, ws]));
    
    // 为每个单词计算权重
    const weightedWords = words.map(word => {
      const stat = statsMap.get(word.english);
      let weight = 1; // 基础权重
      
      if (stat) {
        // 如果有统计数据，根据正确率和尝试次数调整权重
        if (stat.accuracy < 60) {
          weight *= 2; // 正确率低的单词权重加倍
        } else if (stat.accuracy > 90) {
          weight *= 0.3; // 正确率很高的单词权重降低
        }
        
        // 最近尝试过的单词权重稍微降低
        const daysSinceLastAttempt = (Date.now() - new Date(stat.lastAttempted).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastAttempt < 1) {
          weight *= 0.5;
        }
      } else {
        // 没有学过的单词权重增加
        weight *= 1.5;
      }
      
      return { word, weight };
    });
    
    // 基于权重进行随机选择
    const selectedWords: VocabularyItem[] = [];
    const availableWords = [...weightedWords];
    
    for (let i = 0; i < Math.min(count, availableWords.length); i++) {
      // 计算总权重
      const totalWeight = availableWords.reduce((sum, item) => sum + item.weight, 0);
      
      // 随机选择
      let randomWeight = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let j = 0; j < availableWords.length; j++) {
        randomWeight -= availableWords[j].weight;
        if (randomWeight <= 0) {
          selectedIndex = j;
          break;
        }
      }
      
      selectedWords.push(availableWords[selectedIndex].word);
      availableWords.splice(selectedIndex, 1);
    }
    
    // 最终随机打乱
    return selectedWords.sort(() => Math.random() - 0.5);
  }

  generateOptions(correctWord: VocabularyItem, mode: StudyMode, count: number = 4): string[] {
    console.log('🎯 generateOptions调用 - 正确词汇:', correctWord);
    console.log('🎯 generateOptions调用 - 模式:', mode);
    
    const allWords = this.getAllWords();
    console.log('🎯 generateOptions调用 - 可用词汇数量:', allWords.length);
    
    if (allWords.length === 0) {
      console.error('❌ generateOptions - 没有可用词汇');
      return [];
    }
    
    const options = new Set<string>();
    
    // Add correct answer
    const correctAnswer = mode === 'chinese-to-english' ? correctWord.english : correctWord.chinese;
    options.add(correctAnswer);
    console.log('✅ generateOptions - 正确答案:', correctAnswer);

    // Add random wrong answers
    let attempts = 0;
    while (options.size < count && attempts < 100) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      const option = mode === 'chinese-to-english' ? randomWord.english : randomWord.chinese;
      
      if (option !== correctAnswer) {
        options.add(option);
        console.log('➕ generateOptions - 添加选项:', option);
      }
      attempts++;
    }

    const result = Array.from(options).sort(() => Math.random() - 0.5);
    console.log('🏁 generateOptions - 最终结果:', result);
    return result;
  }

  getMetadata() {
    const stats = dataAdapter.getVocabularyStats();
    return {
      total_words: stats.total,
      levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
      categories: ['人物', '动物', '物品', '风景', '人物, 物品', '动物, 风景'],
      description: '英语学习词汇数据库'
    };
  }

  searchWords(query: string): VocabularyItem[] {
    const lowercaseQuery = query.toLowerCase();
    const allWords = this.getAllWords();
    return allWords.filter(word => 
      word.english.toLowerCase().includes(lowercaseQuery) ||
      word.chinese.includes(query)
    );
  }

  // 获取难度模式配置
  getDifficultyModes(): DifficultyModeConfig[] {
    return this.difficultyModes;
  }

  getDifficultyModeConfig(mode: DifficultyMode): DifficultyModeConfig {
    return this.difficultyModes.find(m => m.id === mode) || this.difficultyModes[0];
  }

  // 根据难度模式获取单词
  getWordsByDifficultyMode(mode: DifficultyMode, count: number): VocabularyItem[] {
    let words: VocabularyItem[] = [];

    switch (mode) {
      case 'beginner':
        // 小学生模式：只考A级题（A1-A2）
        const beginnerA1 = this.getWordsByLevel('A1');
        const beginnerA2 = this.getWordsByLevel('A2');
        words = [...beginnerA1, ...beginnerA2];
        break;
      
      case 'expert':
        // 高手模式：只考B级题（B1-B2）
        const expertB1 = this.getWordsByLevel('B1');
        const expertB2 = this.getWordsByLevel('B2');
        words = [...expertB1, ...expertB2];
        break;
      
      case 'hell':
        // 地狱模式：只考C级题（C1）
        words = this.getWordsByLevel('C1');
        break;
      
      case 'auto':
        // 自动模式：根据历史正确率调整难度
        words = this.getAutoModeWords(count);
        break;
      
      case 'custom':
        // 自定义模式：由调用者指定等级
        words = this.getAllWords();
        break;
      
      default:
        words = this.getAllWords();
    }

    // 随机打乱并返回指定数量
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // 根据难度模式获取所有符合条件的单词（不限制数量）
  getAllWordsByDifficultyMode(mode: DifficultyMode): VocabularyItem[] {
    let words: VocabularyItem[] = [];

    switch (mode) {
      case 'beginner':
        // 小学生模式：只考A级题（A1-A2）
        const allBeginnerA1 = this.getWordsByLevel('A1');
        const allBeginnerA2 = this.getWordsByLevel('A2');
        words = [...allBeginnerA1, ...allBeginnerA2];
        break;
      
      case 'expert':
        // 高手模式：只考B级题（B1-B2）
        const allExpertB1 = this.getWordsByLevel('B1');
        const allExpertB2 = this.getWordsByLevel('B2');
        words = [...allExpertB1, ...allExpertB2];
        break;
      
      case 'hell':
        // 地狱模式：只考C级题（C1）
        words = this.getWordsByLevel('C1');
        break;
      
      case 'auto':
        // 自动模式：返回所有单词，让权重算法决定分布
        words = this.getAllWords();
        break;
      
      case 'custom':
        // 自定义模式：由调用者指定等级
        words = this.getAllWords();
        break;
      
      default:
        words = this.getAllWords();
    }

    // 随机打乱
    return [...words].sort(() => Math.random() - 0.5);
  }

  // 自动模式的单词选择算法
  private getAutoModeWords(count: number): VocabularyItem[] {
    const levelStats = storageService.getLevelAccuracyStats();
    const allWords = this.getAllWords();
    
    // 如果没有历史数据，默认返回混合难度
    if (levelStats.length === 0) {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // 计算各等级的权重
    const levelWeights: { [key: string]: number } = {};
    const baseLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    
    baseLevels.forEach(level => {
      const accuracy = storageService.getLevelAccuracy(level);
      
      // 根据正确率计算权重：正确率越高，权重越低（减少该等级的题目）
      // 正确率越低，权重越高（增加该等级的题目）
      if (accuracy === 0) {
        // 没有数据的等级给予中等权重
        levelWeights[level] = 0.3;
      } else if (accuracy >= 90) {
        // 正确率很高，大幅减少权重
        levelWeights[level] = 0.1;
      } else if (accuracy >= 80) {
        // 正确率较高，减少权重
        levelWeights[level] = 0.2;
      } else if (accuracy >= 70) {
        // 正确率中等，保持正常权重
        levelWeights[level] = 0.3;
      } else if (accuracy >= 60) {
        // 正确率较低，增加权重
        levelWeights[level] = 0.5;
      } else {
        // 正确率很低，大幅增加权重
        levelWeights[level] = 0.7;
      }
    });

    // 归一化权重
    const totalWeight = Object.values(levelWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(levelWeights).forEach(level => {
      levelWeights[level] = levelWeights[level] / totalWeight;
    });

    // 根据权重选择单词
    const weightedWords: VocabularyItem[] = [];
    
    baseLevels.forEach(level => {
      const levelWords = this.getWordsByLevel(level);
      const weight = levelWeights[level];
      const targetCount = Math.ceil(count * weight);
      
      // 随机选择该等级的单词
      const shuffledLevelWords = [...levelWords].sort(() => Math.random() - 0.5);
      weightedWords.push(...shuffledLevelWords.slice(0, targetCount));
    });

    // 如果选择的单词数量不足，补充随机单词
    if (weightedWords.length < count) {
      const remainingWords = allWords.filter(word => 
        !weightedWords.some(w => w.english === word.english)
      );
      const shuffledRemaining = [...remainingWords].sort(() => Math.random() - 0.5);
      weightedWords.push(...shuffledRemaining.slice(0, count - weightedWords.length));
    }

    // 最终随机打乱
    return [...weightedWords].sort(() => Math.random() - 0.5).slice(0, count);
  }
}

export const vocabularyService = new VocabularyService();
