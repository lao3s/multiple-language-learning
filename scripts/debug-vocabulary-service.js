// 调试VocabularyService
console.log('🔍 调试VocabularyService');

try {
  // 测试数据适配器
  const { dataAdapter } = require('../src/lib/dataAdapter.ts');
  console.log('📦 数据适配器创建成功');
  
  const allWords = dataAdapter.getAllVocabulary();
  console.log('📊 词汇数量:', allWords.length);
  
  if (allWords.length > 0) {
    console.log('📝 第一个词汇:', allWords[0]);
    
    // 测试generateOptions方法
    console.log('\n🧪 测试generateOptions方法:');
    
    // 手动实现generateOptions逻辑
    const testWord = allWords[0];
    const mode = 'chinese-to-english';
    const count = 4;
    
    const options = new Set();
    const correctAnswer = mode === 'chinese-to-english' ? testWord.english : testWord.chinese;
    options.add(correctAnswer);
    
    console.log('✅ 正确答案:', correctAnswer);
    
    let attempts = 0;
    while (options.size < count && attempts < 100) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      const option = mode === 'chinese-to-english' ? randomWord.english : randomWord.chinese;
      
      if (option !== correctAnswer) {
        options.add(option);
        console.log('➕ 添加选项:', option);
      }
      attempts++;
    }
    
    const finalOptions = Array.from(options).sort(() => Math.random() - 0.5);
    console.log('🎯 最终选项:', finalOptions);
    console.log('✅ 选项生成测试成功');
  } else {
    console.log('❌ 词汇数据为空');
  }
  
} catch (error) {
  console.error('❌ 调试过程中出错:', error);
  console.error('错误详情:', error.stack);
}
