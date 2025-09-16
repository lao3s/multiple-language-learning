import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const mode = searchParams.get('mode');
    const count = searchParams.get('count');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    let result;

    if (level) {
      // 根据等级获取词汇
      const dbWords = databaseService.getVocabularyByLevel(level);
      result = dbWords.map(convertDbWordToItem);
    } else if (minScore && maxScore) {
      // 根据难度分数范围获取词汇
      const dbWords = databaseService.getVocabularyByDifficultyRange(
        parseInt(minScore), 
        parseInt(maxScore)
      );
      result = dbWords.map(convertDbWordToItem);
    } else {
      // 获取所有词汇
      const dbWords = databaseService.getAllVocabulary();
      result = dbWords.map(convertDbWordToItem);
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('获取词汇数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取词汇数据失败' },
      { status: 500 }
    );
  }
}

function convertDbWordToItem(dbWord: any) {
  return {
    english: dbWord.english,
    chinese: dbWord.chinese,
    pos: dbWord.pos,
    level: dbWord.level,
    difficulty_score: dbWord.difficulty_score,
    category: dbWord.category
  };
}
