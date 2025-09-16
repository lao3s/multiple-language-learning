const Database = require('better-sqlite3');
const path = require('path');

// 连接到数据库
const dbPath = path.join(process.cwd(), 'data', 'english-learning.db');
const db = new Database(dbPath, { readonly: true });

console.log('🔍 英语学习系统数据库查询工具');
console.log('=' .repeat(50));

// 1. 基本统计信息
console.log('\n📊 数据库统计信息:');
const vocabularyCount = db.prepare('SELECT COUNT(*) as count FROM vocabulary').get();
const phrasesCount = db.prepare('SELECT COUNT(*) as count FROM phrases').get();
console.log(`词汇总数: ${vocabularyCount.count}`);
console.log(`短语总数: ${phrasesCount.count}`);

// 2. 词汇按等级分布
console.log('\n📚 词汇等级分布:');
const levelStats = db.prepare(`
  SELECT level, COUNT(*) as count 
  FROM vocabulary 
  WHERE level IS NOT NULL 
  GROUP BY level 
  ORDER BY level
`).all();

levelStats.forEach(stat => {
  console.log(`  ${stat.level}: ${stat.count} 个`);
});

// 3. 词汇按类别分布
console.log('\n🏷️  词汇类别分布:');
const categoryStats = db.prepare(`
  SELECT category, COUNT(*) as count 
  FROM vocabulary 
  WHERE category IS NOT NULL 
  GROUP BY category 
  ORDER BY count DESC
`).all();

categoryStats.forEach(stat => {
  console.log(`  ${stat.category}: ${stat.count} 个`);
});

// 4. 显示一些示例词汇
console.log('\n📝 词汇示例 (前10个):');
const sampleVocabulary = db.prepare(`
  SELECT english, chinese, level, category 
  FROM vocabulary 
  LIMIT 10
`).all();

sampleVocabulary.forEach((word, index) => {
  console.log(`  ${index + 1}. ${word.english} - ${word.chinese} (${word.level}, ${word.category})`);
});

// 5. 显示一些示例短语
console.log('\n💬 短语示例 (前10个):');
const samplePhrases = db.prepare(`
  SELECT english, chinese, difficulty_score 
  FROM phrases 
  LIMIT 10
`).all();

samplePhrases.forEach((phrase, index) => {
  console.log(`  ${index + 1}. "${phrase.english}" - "${phrase.chinese}" (难度: ${phrase.difficulty_score})`);
});

// 6. 按难度分数统计短语
console.log('\n📈 短语难度分布:');
const difficultyStats = db.prepare(`
  SELECT 
    CASE 
      WHEN difficulty_score <= 30 THEN '简单 (0-30)'
      WHEN difficulty_score <= 60 THEN '中等 (31-60)'
      ELSE '困难 (61-100)'
    END as difficulty_level,
    COUNT(*) as count
  FROM phrases
  GROUP BY 
    CASE 
      WHEN difficulty_score <= 30 THEN '简单 (0-30)'
      WHEN difficulty_score <= 60 THEN '中等 (31-60)'
      ELSE '困难 (61-100)'
    END
  ORDER BY count DESC
`).all();

difficultyStats.forEach(stat => {
  console.log(`  ${stat.difficulty_level}: ${stat.count} 个`);
});

// 7. 搜索功能演示
console.log('\n🔍 搜索功能演示:');

// 搜索包含"animal"的词汇
const animalWords = db.prepare(`
  SELECT english, chinese, level 
  FROM vocabulary 
  WHERE english LIKE '%animal%' OR chinese LIKE '%动物%'
  LIMIT 5
`).all();

console.log('包含"animal"或"动物"的词汇:');
animalWords.forEach(word => {
  console.log(`  - ${word.english} - ${word.chinese} (${word.level})`);
});

// 搜索包含"a bit"的短语
const bitPhrases = db.prepare(`
  SELECT english, chinese 
  FROM phrases 
  WHERE english LIKE '%a bit%'
  LIMIT 5
`).all();

console.log('\n包含"a bit"的短语:');
bitPhrases.forEach(phrase => {
  console.log(`  - "${phrase.english}" - "${phrase.chinese}"`);
});

// 8. 高级查询示例
console.log('\n🎯 高级查询示例:');

// 找出最长的短语
const longestPhrases = db.prepare(`
  SELECT english, chinese, LENGTH(english) as length
  FROM phrases
  ORDER BY LENGTH(english) DESC
  LIMIT 5
`).all();

console.log('最长的5个短语:');
longestPhrases.forEach((phrase, index) => {
  console.log(`  ${index + 1}. "${phrase.english}" (${phrase.length}字符) - "${phrase.chinese}"`);
});

// 找出最高难度的词汇
const hardestWords = db.prepare(`
  SELECT english, chinese, difficulty_score, level
  FROM vocabulary
  ORDER BY difficulty_score DESC
  LIMIT 5
`).all();

console.log('\n难度最高的5个词汇:');
hardestWords.forEach((word, index) => {
  console.log(`  ${index + 1}. ${word.english} - ${word.chinese} (难度: ${word.difficulty_score}, 等级: ${word.level})`);
});

db.close();
console.log('\n✅ 查询完成，数据库连接已关闭');
