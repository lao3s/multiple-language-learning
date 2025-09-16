import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'vocabulary' 或 'phrases'
    const userId = searchParams.get('userId') || 'default';

    let result;

    if (type === 'vocabulary') {
      result = databaseService.getVocabularyStats(userId);
    } else if (type === 'phrases') {
      result = databaseService.getPhraseStats(userId);
    } else {
      // 返回所有统计信息
      result = {
        vocabulary: databaseService.getVocabularyStats(userId),
        phrases: databaseService.getPhraseStats(userId)
      };
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
