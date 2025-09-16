const fs = require('fs');
const path = require('path');

/**
 * 确保数据库在部署环境中可用的脚本
 * 这个脚本会在构建后运行，确保数据库文件存在
 */

console.log('🔍 检查数据库部署状态...');

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'english-learning.db');
const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');

// 检查数据目录
if (!fs.existsSync(dataDir)) {
  console.log('📁 创建data目录...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// 检查数据库文件
if (!fs.existsSync(dbPath)) {
  console.log('❌ 数据库文件不存在，需要运行迁移脚本');
  console.log('请运行: node scripts/migrate-to-sqlite.js');
  
  // 在CI/CD环境中自动运行迁移
  if (process.env.CI || process.env.NODE_ENV === 'production') {
    console.log('🚀 检测到CI/CD环境，自动运行数据迁移...');
    try {
      require('./migrate-to-sqlite.js');
      console.log('✅ 自动迁移完成');
    } catch (error) {
      console.error('❌ 自动迁移失败:', error);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
} else {
  console.log('✅ 数据库文件存在');
  
  // 检查数据库内容
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });
    
    const vocabularyCount = db.prepare('SELECT COUNT(*) as count FROM vocabulary').get();
    const phrasesCount = db.prepare('SELECT COUNT(*) as count FROM phrases').get();
    
    console.log(`📊 数据库统计:`);
    console.log(`   词汇数量: ${vocabularyCount.count}`);
    console.log(`   短语数量: ${phrasesCount.count}`);
    
    if (vocabularyCount.count === 0 || phrasesCount.count === 0) {
      console.log('⚠️  数据库为空，可能需要重新迁移');
    }
    
    db.close();
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
    process.exit(1);
  }
}

// 检查schema文件
if (!fs.existsSync(schemaPath)) {
  console.log('❌ 数据库schema文件不存在');
  process.exit(1);
} else {
  console.log('✅ 数据库schema文件存在');
}

// 输出部署信息
console.log('\n📋 部署信息:');
console.log(`   Node环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`   工作目录: ${process.cwd()}`);
console.log(`   数据库路径: ${dbPath}`);
console.log(`   数据库大小: ${fs.existsSync(dbPath) ? (fs.statSync(dbPath).size / 1024).toFixed(2) + 'KB' : '不存在'}`);

console.log('\n🎉 数据库部署检查完成！');
