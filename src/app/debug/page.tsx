'use client';

import { useEffect, useState } from 'react';
import { vocabularyService } from '@/lib/vocabulary';
import { VocabularyItem } from '@/types/vocabulary';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testOptions, setTestOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      // 测试获取所有词汇
      const allWords = vocabularyService.getAllWords();
      console.log('🔍 Debug - 所有词汇:', allWords);
      
      // 测试元数据
      const metadata = vocabularyService.getMetadata();
      console.log('🔍 Debug - 元数据:', metadata);
      
      // 测试生成选项
      if (allWords.length > 0) {
        const testWord = allWords[0];
        const options = vocabularyService.generateOptions(testWord, 'chinese-to-english');
        console.log('🔍 Debug - 测试选项:', options);
        
        setDebugInfo({
          totalWords: allWords.length,
          firstWord: testWord,
          metadata,
          optionsGenerated: options.length > 0
        });
        setTestOptions(options);
      } else {
        setDebugInfo({
          totalWords: 0,
          error: '没有词汇数据'
        });
      }
    } catch (error) {
      console.error('🔍 Debug - 错误:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">调试页面</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">调试信息</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      
      {testOptions.length > 0 && (
        <div className="bg-blue-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">测试选项</h2>
          <ul className="list-disc list-inside">
            {testOptions.map((option, index) => (
              <li key={index} className="mb-1">{option}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">说明</h2>
        <p>这个页面用于调试数据加载和选项生成功能。请查看浏览器控制台获取详细日志。</p>
      </div>
    </div>
  );
}
