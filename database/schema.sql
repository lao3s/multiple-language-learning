-- 英语学习系统 SQLite 数据库架构
-- 创建时间: 2025-09-16

-- 词汇表
CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    english TEXT NOT NULL UNIQUE,
    chinese TEXT NOT NULL,
    pos TEXT, -- 词性 (名词、动词等)
    level TEXT, -- 等级 (A1, A2, B1, B2, C1)
    difficulty_score INTEGER DEFAULT 1, -- 难度分数 1-100
    category TEXT, -- 类别 (人物、动物、物品、风景等)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 短语表
CREATE TABLE IF NOT EXISTS phrases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    english TEXT NOT NULL,
    chinese TEXT NOT NULL,
    level TEXT DEFAULT 'C1', -- 等级，默认C1
    page_number INTEGER, -- 原始页码
    difficulty_score INTEGER DEFAULT 50, -- 难度分数，默认中等
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户学习统计表
CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default', -- 用户ID，单用户系统可用default
    total_words_learned INTEGER DEFAULT 0,
    total_phrases_learned INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- 总学习时间(秒)
    current_streak INTEGER DEFAULT 0, -- 当前连续学习天数
    max_streak INTEGER DEFAULT 0, -- 最大连续学习天数
    last_study_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 词汇学习记录表
CREATE TABLE IF NOT EXISTS vocabulary_study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER NOT NULL,
    user_id TEXT DEFAULT 'default',
    is_correct BOOLEAN NOT NULL, -- 是否答对
    study_mode TEXT, -- 学习模式 (english_to_chinese, chinese_to_english, mixed)
    difficulty_mode TEXT, -- 难度模式 (auto, beginner, expert, hell, custom)
    response_time INTEGER, -- 响应时间(毫秒)
    study_date DATE DEFAULT (DATE('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id)
);

-- 短语学习记录表
CREATE TABLE IF NOT EXISTS phrase_study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phrase_id INTEGER NOT NULL,
    user_id TEXT DEFAULT 'default',
    is_correct BOOLEAN NOT NULL,
    study_mode TEXT,
    difficulty_mode TEXT,
    response_time INTEGER,
    study_date DATE DEFAULT (DATE('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phrase_id) REFERENCES phrases(id)
);

-- 错题记录表 (词汇)
CREATE TABLE IF NOT EXISTS vocabulary_wrong_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER NOT NULL,
    user_id TEXT DEFAULT 'default',
    wrong_count INTEGER DEFAULT 1, -- 错误次数
    last_wrong_date DATE DEFAULT (DATE('now')),
    is_mastered BOOLEAN DEFAULT FALSE, -- 是否已掌握
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id),
    UNIQUE(vocabulary_id, user_id)
);

-- 错题记录表 (短语)
CREATE TABLE IF NOT EXISTS phrase_wrong_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phrase_id INTEGER NOT NULL,
    user_id TEXT DEFAULT 'default',
    wrong_count INTEGER DEFAULT 1,
    last_wrong_date DATE DEFAULT (DATE('now')),
    is_mastered BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phrase_id) REFERENCES phrases(id),
    UNIQUE(phrase_id, user_id)
);

-- 学习会话表
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    session_type TEXT NOT NULL, -- 'vocabulary' 或 'phrase'
    study_mode TEXT,
    difficulty_mode TEXT,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- 总用时(秒)
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    is_completed BOOLEAN DEFAULT FALSE
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON vocabulary(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_phrases_level ON phrases(level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_study_records_vocab_id ON vocabulary_study_records(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_study_records_date ON vocabulary_study_records(study_date);
CREATE INDEX IF NOT EXISTS idx_phrase_study_records_phrase_id ON phrase_study_records(phrase_id);
CREATE INDEX IF NOT EXISTS idx_phrase_study_records_date ON phrase_study_records(study_date);
CREATE INDEX IF NOT EXISTS idx_vocabulary_wrong_records_vocab_id ON vocabulary_wrong_records(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_phrase_wrong_records_phrase_id ON phrase_wrong_records(phrase_id);

-- 创建触发器，自动更新updated_at字段
CREATE TRIGGER IF NOT EXISTS update_vocabulary_updated_at 
    AFTER UPDATE ON vocabulary 
BEGIN 
    UPDATE vocabulary SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_phrases_updated_at 
    AFTER UPDATE ON phrases 
BEGIN 
    UPDATE phrases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_stats_updated_at 
    AFTER UPDATE ON user_stats 
BEGIN 
    UPDATE user_stats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_vocabulary_wrong_records_updated_at 
    AFTER UPDATE ON vocabulary_wrong_records 
BEGIN 
    UPDATE vocabulary_wrong_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_phrase_wrong_records_updated_at 
    AFTER UPDATE ON phrase_wrong_records 
BEGIN 
    UPDATE phrase_wrong_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
