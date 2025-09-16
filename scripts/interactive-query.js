const Database = require('better-sqlite3');
const path = require('path');
const readline = require('readline');

// 连接到数据库
const dbPath = path.join(process.cwd(), 'data', 'english-learning.db');
const db = new Database(dbPath, { readonly: true });

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 英语学习系统 - 交互式数据库查询工具');
console.log('=' .repeat(50));
console.log('可用的预设查询命令:');
console.log('1. stats - 显示统计信息');
console.log('2. vocab [level] - 显示词汇 (可选择等级: A1, A2, B1, B2, C1)');
console.log('3. phrases [difficulty] - 显示短语 (可选择难度: easy, medium, hard)');
console.log('4. search [word] - 搜索包含特定单词的内容');
console.log('5. sql [query] - 执行自定义SQL查询');
console.log('6. help - 显示帮助信息');
console.log('7. quit - 退出程序');
console.log('=' .repeat(50));

function executeQuery() {
  rl.question('\n请输入查询命令: ', (input) => {
    const parts = input.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'stats':
          showStats();
          break;
        
        case 'vocab':
          showVocabulary(args[0]);
          break;
        
        case 'phrases':
          showPhrases(args[0]);
          break;
        
        case 'search':
          if (args.length === 0) {
            console.log('❌ 请提供搜索关键词');
          } else {
            searchContent(args.join(' '));
          }
          break;
        
        case 'sql':
          if (args.length === 0) {
            console.log('❌ 请提供SQL查询语句');
          } else {
            executeSQLQuery(args.join(' '));
          }
          break;
        
        case 'help':
          showHelp();
          break;
        
        case 'quit':
        case 'exit':
          console.log('👋 再见！');
          db.close();
          rl.close();
          return;
        
        default:
          console.log('❌ 未知命令，输入 "help" 查看帮助');
      }
    } catch (error) {
      console.log('❌ 执行查询时出错:', error.message);
    }

    // 继续等待下一个命令
    executeQuery();
  });
}

function showStats() {
  console.log('\n📊 数据库统计信息:');
  
  const vocabularyCount = db.prepare('SELECT COUNT(*) as count FROM vocabulary').get();
  const phrasesCount = db.prepare('SELECT COUNT(*) as count FROM phrases').get();
  
  console.log(`词汇总数: ${vocabularyCount.count}`);
  console.log(`短语总数: ${phrasesCount.count}`);
  
  const levelStats = db.prepare(`
    SELECT level, COUNT(*) as count 
    FROM vocabulary 
    WHERE level IS NOT NULL 
    GROUP BY level 
    ORDER BY level
  `).all();
  
  console.log('\n等级分布:');
  levelStats.forEach(stat => {
    console.log(`  ${stat.level}: ${stat.count} 个`);
  });
}

function showVocabulary(level) {
  console.log(`\n📚 词汇列表${level ? ` (等级: ${level})` : ''}:`);
  
  let query = 'SELECT english, chinese, level, category FROM vocabulary';
  let params = [];
  
  if (level) {
    query += ' WHERE level = ?';
    params.push(level.toUpperCase());
  }
  
  query += ' LIMIT 20';
  
  const words = db.prepare(query).all(...params);
  
  if (words.length === 0) {
    console.log('❌ 未找到匹配的词汇');
    return;
  }
  
  words.forEach((word, index) => {
    console.log(`  ${index + 1}. ${word.english} - ${word.chinese} (${word.level}, ${word.category})`);
  });
  
  if (words.length === 20) {
    console.log('  ... (显示前20个结果)');
  }
}

function showPhrases(difficulty) {
  console.log(`\n💬 短语列表${difficulty ? ` (难度: ${difficulty})` : ''}:`);
  
  let query = 'SELECT english, chinese, difficulty_score FROM phrases';
  let params = [];
  
  if (difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        query += ' WHERE difficulty_score <= 30';
        break;
      case 'medium':
        query += ' WHERE difficulty_score > 30 AND difficulty_score <= 60';
        break;
      case 'hard':
        query += ' WHERE difficulty_score > 60';
        break;
      default:
        console.log('❌ 难度参数应为: easy, medium, hard');
        return;
    }
  }
  
  query += ' LIMIT 20';
  
  const phrases = db.prepare(query).all(...params);
  
  if (phrases.length === 0) {
    console.log('❌ 未找到匹配的短语');
    return;
  }
  
  phrases.forEach((phrase, index) => {
    console.log(`  ${index + 1}. "${phrase.english}" - "${phrase.chinese}" (难度: ${phrase.difficulty_score})`);
  });
  
  if (phrases.length === 20) {
    console.log('  ... (显示前20个结果)');
  }
}

function searchContent(keyword) {
  console.log(`\n🔍 搜索结果 (关键词: "${keyword}"):`);
  
  // 搜索词汇
  const vocabularyResults = db.prepare(`
    SELECT english, chinese, level, category
    FROM vocabulary
    WHERE english LIKE ? OR chinese LIKE ?
    LIMIT 10
  `).all(`%${keyword}%`, `%${keyword}%`);
  
  if (vocabularyResults.length > 0) {
    console.log('\n📚 匹配的词汇:');
    vocabularyResults.forEach((word, index) => {
      console.log(`  ${index + 1}. ${word.english} - ${word.chinese} (${word.level}, ${word.category})`);
    });
  }
  
  // 搜索短语
  const phraseResults = db.prepare(`
    SELECT english, chinese, difficulty_score
    FROM phrases
    WHERE english LIKE ? OR chinese LIKE ?
    LIMIT 10
  `).all(`%${keyword}%`, `%${keyword}%`);
  
  if (phraseResults.length > 0) {
    console.log('\n💬 匹配的短语:');
    phraseResults.forEach((phrase, index) => {
      console.log(`  ${index + 1}. "${phrase.english}" - "${phrase.chinese}" (难度: ${phrase.difficulty_score})`);
    });
  }
  
  if (vocabularyResults.length === 0 && phraseResults.length === 0) {
    console.log('❌ 未找到匹配的结果');
  }
}

function executeSQLQuery(query) {
  console.log(`\n🔧 执行SQL查询: ${query}`);
  
  try {
    // 只允许SELECT查询以确保安全性
    if (!query.toLowerCase().trim().startsWith('select')) {
      console.log('❌ 为了安全，只允许SELECT查询');
      return;
    }
    
    const results = db.prepare(query).all();
    
    if (results.length === 0) {
      console.log('❌ 查询无结果');
      return;
    }
    
    console.log(`✅ 找到 ${results.length} 条结果:`);
    
    // 显示前10条结果
    const displayResults = results.slice(0, 10);
    displayResults.forEach((row, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(row)}`);
    });
    
    if (results.length > 10) {
      console.log(`  ... (显示前10个结果，共${results.length}条)`);
    }
    
  } catch (error) {
    console.log('❌ SQL查询出错:', error.message);
  }
}

function showHelp() {
  console.log('\n📖 帮助信息:');
  console.log('可用命令:');
  console.log('  stats                    - 显示数据库统计信息');
  console.log('  vocab [level]           - 显示词汇，可选等级 (A1, A2, B1, B2, C1)');
  console.log('  phrases [difficulty]    - 显示短语，可选难度 (easy, medium, hard)');
  console.log('  search <keyword>        - 搜索包含关键词的内容');
  console.log('  sql <query>            - 执行自定义SQL查询 (仅支持SELECT)');
  console.log('  help                   - 显示此帮助信息');
  console.log('  quit                   - 退出程序');
  console.log('\n示例:');
  console.log('  vocab A1               - 显示A1等级的词汇');
  console.log('  phrases easy           - 显示简单难度的短语');
  console.log('  search animal          - 搜索包含"animal"的内容');
  console.log('  sql SELECT * FROM vocabulary WHERE level = "C1" LIMIT 5');
}

// 开始交互式查询
executeQuery();
