// 测试选项生成功能
const { dataAdapter } = require('../src/lib/dataAdapter.ts');

console.log('🧪 测试选择题选项生成功能');
console.log('=' .repeat(40));

// 模拟VocabularyService的generateOptions方法
function generateOptions(correctWord, mode, count = 4) {
  const allWords = dataAdapter.getAllVocabulary();
  console.log('📊 可用词汇数量:', allWords.length);
  
  if (allWords.length === 0) {
    console.log('❌ 没有可用的词汇数据');
    return [];
  }
  
  const options = new Set();
  
  // 添加正确答案
  const correctAnswer = mode === 'chinese-to-english' ? correctWord.english : correctWord.chinese;
  options.add(correctAnswer);
  console.log('✅ 正确答案:', correctAnswer);
  
  // 添加错误选项
  let attempts = 0;
  while (options.size < count && attempts < 100) {
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    const option = mode === 'chinese-to-english' ? randomWord.english : randomWord.chinese;
    
    if (option !== correctAnswer) {
      options.add(option);
    }
    attempts++;
  }
  
  const result = Array.from(options).sort(() => Math.random() - 0.5);
  console.log('🎯 生成的选项:', result);
  return result;
}

// 测试
try {
  // 获取一个测试词汇
  const allWords = dataAdapter.getAllVocabulary();
  
  if (allWords.length > 0) {
    const testWord = allWords[0];
    console.log('🔍 测试词汇:', testWord);
    
    // 测试中译英模式
    console.log('\n📝 测试中译英模式:');
    const options1 = generateOptions(testWord, 'chinese-to-english');
    
    // 测试英译中模式
    console.log('\n📝 测试英译中模式:');
    const options2 = generateOptions(testWord, 'english-to-chinese');
    
    console.log('\n✅ 测试完成');
  } else {
    console.log('❌ 没有找到测试词汇');
  }
} catch (error) {
  console.error('❌ 测试过程中出错:', error);
}
