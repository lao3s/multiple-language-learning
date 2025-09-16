const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 数据迁移脚本：将JSON数据导入SQLite数据库
class DataMigration {
  constructor() {
    // 确保data目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 创建数据库连接
    const dbPath = path.join(dataDir, 'english-learning.db');
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
    
    // 初始化数据库
    this.initializeDatabase();
  }

  initializeDatabase() {
    try {
      // 读取并执行数据库架构
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema);
      console.log('✅ 数据库架构初始化完成');
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
      throw error;
    }
  }

  // 迁移词汇数据
  migrateVocabulary() {
    try {
      console.log('📚 开始迁移词汇数据...');
      
      // 读取JSON数据
      const vocabularyPath = path.join(process.cwd(), 'src', 'data', 'vocabulary_clean.json');
      const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));
      
      // 准备插入语句
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO vocabulary (english, chinese, pos, level, difficulty_score, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // 开始事务
      const insertMany = this.db.transaction((words) => {
        for (const word of words) {
          insertStmt.run(
            word.english,
            word.chinese,
            word.pos || null,
            word.level || null,
            word.difficulty_score || 1,
            word.category || null
          );
        }
      });

      // 执行批量插入
      insertMany(vocabularyData.vocabulary);
      
      console.log(`✅ 成功迁移 ${vocabularyData.vocabulary.length} 个词汇`);
      
      // 验证迁移结果
      const count = this.db.prepare('SELECT COUNT(*) as count FROM vocabulary').get();
      console.log(`📊 数据库中现有词汇总数: ${count.count}`);
      
    } catch (error) {
      console.error('❌ 词汇数据迁移失败:', error);
      throw error;
    }
  }

  // 迁移短语数据
  migratePhrases() {
    try {
      console.log('💬 开始迁移短语数据...');
      
      // 读取JSON数据
      const phrasesPath = path.join(process.cwd(), 'src', 'data', 'phrases_c1_extracted.json');
      const phrasesData = JSON.parse(fs.readFileSync(phrasesPath, 'utf8'));
      
      // 准备插入语句
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO phrases (english, chinese, level, page_number, difficulty_score)
        VALUES (?, ?, ?, ?, ?)
      `);

      let totalPhrases = 0;

      // 开始事务
      const insertMany = this.db.transaction((phrasesData) => {
        // 遍历所有页面
        Object.entries(phrasesData.phrases).forEach(([pageKey, phrases]) => {
          const pageNumber = parseInt(pageKey.replace('page_', ''));
          
          phrases.forEach(phrase => {
            insertStmt.run(
              phrase.english,
              phrase.chinese,
              'C1', // 默认等级
              pageNumber,
              50 // 默认难度分数
            );
            totalPhrases++;
          });
        });
      });

      // 执行批量插入
      insertMany(phrasesData);
      
      console.log(`✅ 成功迁移 ${totalPhrases} 个短语`);
      
      // 验证迁移结果
      const count = this.db.prepare('SELECT COUNT(*) as count FROM phrases').get();
      console.log(`📊 数据库中现有短语总数: ${count.count}`);
      
    } catch (error) {
      console.error('❌ 短语数据迁移失败:', error);
      throw error;
    }
  }

  // 初始化用户统计数据
  initializeUserStats() {
    try {
      console.log('👤 初始化用户统计数据...');
      
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO user_stats (user_id, total_words_learned, total_phrases_learned)
        VALUES (?, ?, ?)
      `);
      
      insertStmt.run('default', 0, 0);
      
      console.log('✅ 用户统计数据初始化完成');
    } catch (error) {
      console.error('❌ 用户统计数据初始化失败:', error);
      throw error;
    }
  }

  // 显示迁移统计信息
  showMigrationStats() {
    console.log('\n📈 迁移完成统计:');
    console.log('='.repeat(40));
    
    const vocabularyCount = this.db.prepare('SELECT COUNT(*) as count FROM vocabulary').get();
    const phrasesCount = this.db.prepare('SELECT COUNT(*) as count FROM phrases').get();
    
    console.log(`词汇总数: ${vocabularyCount.count}`);
    console.log(`短语总数: ${phrasesCount.count}`);
    
    // 按等级统计词汇
    const levelStats = this.db.prepare(`
      SELECT level, COUNT(*) as count 
      FROM vocabulary 
      WHERE level IS NOT NULL 
      GROUP BY level 
      ORDER BY level
    `).all();
    
    console.log('\n词汇等级分布:');
    levelStats.forEach(stat => {
      console.log(`  ${stat.level}: ${stat.count} 个`);
    });
    
    // 按类别统计词汇
    const categoryStats = this.db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM vocabulary 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
    
    console.log('\n词汇类别分布:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat.count} 个`);
    });
    
    console.log('\n🎉 数据迁移全部完成！');
  }

  // 执行完整迁移
  async migrate() {
    try {
      console.log('🚀 开始数据迁移...\n');
      
      this.migrateVocabulary();
      this.migratePhrases();
      this.initializeUserStats();
      this.showMigrationStats();
      
    } catch (error) {
      console.error('❌ 迁移过程中出现错误:', error);
      throw error;
    } finally {
      this.db.close();
    }
  }
}

// 执行迁移
if (require.main === module) {
  const migration = new DataMigration();
  migration.migrate().catch(console.error);
}

module.exports = DataMigration;
