import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    let result;

    if (minScore && maxScore) {
      // 根据难度分数范围获取短语
      const dbPhrases = databaseService.getPhrasesByDifficultyRange(
        parseInt(minScore), 
        parseInt(maxScore)
      );
      result = dbPhrases.map(convertDbPhraseToItem);
    } else {
      // 获取所有短语
      const dbPhrases = databaseService.getAllPhrases();
      result = dbPhrases.map(convertDbPhraseToItem);
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('获取短语数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取短语数据失败' },
      { status: 500 }
    );
  }
}

function convertDbPhraseToItem(dbPhrase: any) {
  return {
    english: dbPhrase.english,
    chinese: dbPhrase.chinese,
    level: dbPhrase.level,
    difficulty_score: dbPhrase.difficulty_score
  };
}
