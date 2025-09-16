import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import path from 'path';

export class DatabaseService {
  private db: Database.Database;
  private static instance: DatabaseService;

  private constructor() {
    // 数据库文件路径
    const dbPath = path.join(process.cwd(), 'data', 'english-learning.db');
    
    // 创建数据库连接
    this.db = new Database(dbPath);
    
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 初始化数据库表
    this.initializeDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeDatabase(): void {
    try {
      // 读取并执行数据库架构
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf8');
      
      // 执行数据库架构
      this.db.exec(schema);
      
      console.log('数据库初始化完成');
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  // 获取数据库实例
  public getDb(): Database.Database {
    return this.db;
  }

  // 词汇相关操作
  public insertVocabulary(word: {
    english: string;
    chinese: string;
    pos?: string;
    level?: string;
    difficulty_score?: number;
    category?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO vocabulary (english, chinese, pos, level, difficulty_score, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      word.english,
      word.chinese,
      word.pos || null,
      word.level || null,
      word.difficulty_score || 1,
      word.category || null
    );
  }

  public getVocabularyByLevel(level: string) {
    const stmt = this.db.prepare('SELECT * FROM vocabulary WHERE level = ?');
    return stmt.all(level);
  }

  public getVocabularyByDifficultyRange(min: number, max: number) {
    const stmt = this.db.prepare(`
      SELECT * FROM vocabulary 
      WHERE difficulty_score >= ? AND difficulty_score <= ?
    `);
    return stmt.all(min, max);
  }

  public getAllVocabulary() {
    const stmt = this.db.prepare('SELECT * FROM vocabulary ORDER BY id');
    return stmt.all();
  }

  // 短语相关操作
  public insertPhrase(phrase: {
    english: string;
    chinese: string;
    level?: string;
    page_number?: number;
    difficulty_score?: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO phrases (english, chinese, level, page_number, difficulty_score)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      phrase.english,
      phrase.chinese,
      phrase.level || 'C1',
      phrase.page_number || null,
      phrase.difficulty_score || 50
    );
  }

  public getAllPhrases() {
    const stmt = this.db.prepare('SELECT * FROM phrases ORDER BY id');
    return stmt.all();
  }

  public getPhrasesByDifficultyRange(min: number, max: number) {
    const stmt = this.db.prepare(`
      SELECT * FROM phrases 
      WHERE difficulty_score >= ? AND difficulty_score <= ?
    `);
    return stmt.all(min, max);
  }

  // 学习记录相关操作
  public insertVocabularyStudyRecord(record: {
    vocabulary_id: number;
    user_id?: string;
    is_correct: boolean;
    study_mode?: string;
    difficulty_mode?: string;
    response_time?: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO vocabulary_study_records 
      (vocabulary_id, user_id, is_correct, study_mode, difficulty_mode, response_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      record.vocabulary_id,
      record.user_id || 'default',
      record.is_correct,
      record.study_mode || null,
      record.difficulty_mode || null,
      record.response_time || null
    );
  }

  public insertPhraseStudyRecord(record: {
    phrase_id: number;
    user_id?: string;
    is_correct: boolean;
    study_mode?: string;
    difficulty_mode?: string;
    response_time?: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO phrase_study_records 
      (phrase_id, user_id, is_correct, study_mode, difficulty_mode, response_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      record.phrase_id,
      record.user_id || 'default',
      record.is_correct,
      record.study_mode || null,
      record.difficulty_mode || null,
      record.response_time || null
    );
  }

  // 错题记录操作
  public addOrUpdateVocabularyWrongRecord(vocabulary_id: number, user_id: string = 'default') {
    const stmt = this.db.prepare(`
      INSERT INTO vocabulary_wrong_records (vocabulary_id, user_id, wrong_count, last_wrong_date)
      VALUES (?, ?, 1, DATE('now'))
      ON CONFLICT(vocabulary_id, user_id) 
      DO UPDATE SET 
        wrong_count = wrong_count + 1,
        last_wrong_date = DATE('now'),
        is_mastered = FALSE,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    return stmt.run(vocabulary_id, user_id);
  }

  public addOrUpdatePhraseWrongRecord(phrase_id: number, user_id: string = 'default') {
    const stmt = this.db.prepare(`
      INSERT INTO phrase_wrong_records (phrase_id, user_id, wrong_count, last_wrong_date)
      VALUES (?, ?, 1, DATE('now'))
      ON CONFLICT(phrase_id, user_id) 
      DO UPDATE SET 
        wrong_count = wrong_count + 1,
        last_wrong_date = DATE('now'),
        is_mastered = FALSE,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    return stmt.run(phrase_id, user_id);
  }

  public getVocabularyWrongRecords(user_id: string = 'default') {
    const stmt = this.db.prepare(`
      SELECT vwr.*, v.english, v.chinese, v.level, v.category
      FROM vocabulary_wrong_records vwr
      JOIN vocabulary v ON vwr.vocabulary_id = v.id
      WHERE vwr.user_id = ? AND vwr.is_mastered = FALSE
      ORDER BY vwr.last_wrong_date DESC
    `);
    
    return stmt.all(user_id);
  }

  public getPhraseWrongRecords(user_id: string = 'default') {
    const stmt = this.db.prepare(`
      SELECT pwr.*, p.english, p.chinese, p.level
      FROM phrase_wrong_records pwr
      JOIN phrases p ON pwr.phrase_id = p.id
      WHERE pwr.user_id = ? AND pwr.is_mastered = FALSE
      ORDER BY pwr.last_wrong_date DESC
    `);
    
    return stmt.all(user_id);
  }

  // 统计相关操作
  public getVocabularyStats(user_id: string = 'default') {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM vocabulary');
    const studiedStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT vocabulary_id) as studied 
      FROM vocabulary_study_records 
      WHERE user_id = ?
    `);
    const correctStmt = this.db.prepare(`
      SELECT COUNT(*) as correct 
      FROM vocabulary_study_records 
      WHERE user_id = ? AND is_correct = TRUE
    `);
    const wrongStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT vocabulary_id) as wrong 
      FROM vocabulary_wrong_records 
      WHERE user_id = ? AND is_mastered = FALSE
    `);

    const totalResult = totalStmt.get() as any;
    const studiedResult = studiedStmt.get(user_id) as any;
    const correctResult = correctStmt.get(user_id) as any;
    const wrongResult = wrongStmt.get(user_id) as any;
    
    return {
      total: totalResult?.total || 0,
      studied: studiedResult?.studied || 0,
      correct: correctResult?.correct || 0,
      wrong: wrongResult?.wrong || 0
    };
  }

  public getPhraseStats(user_id: string = 'default') {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM phrases');
    const studiedStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT phrase_id) as studied 
      FROM phrase_study_records 
      WHERE user_id = ?
    `);
    const correctStmt = this.db.prepare(`
      SELECT COUNT(*) as correct 
      FROM phrase_study_records 
      WHERE user_id = ? AND is_correct = TRUE
    `);
    const wrongStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT phrase_id) as wrong 
      FROM phrase_wrong_records 
      WHERE user_id = ? AND is_mastered = FALSE
    `);

    const totalResult = totalStmt.get() as any;
    const studiedResult = studiedStmt.get(user_id) as any;
    const correctResult = correctStmt.get(user_id) as any;
    const wrongResult = wrongStmt.get(user_id) as any;
    
    return {
      total: totalResult?.total || 0,
      studied: studiedResult?.studied || 0,
      correct: correctResult?.correct || 0,
      wrong: wrongResult?.wrong || 0
    };
  }

  // 关闭数据库连接
  public close(): void {
    this.db.close();
  }
}

// 导出单例实例
export const databaseService = DatabaseService.getInstance();
