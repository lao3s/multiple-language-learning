# 线上部署数据库解决方案

## 问题分析

当前架构在线上部署时会遇到以下问题：
1. SQLite数据库文件存储在本地 `data/` 目录
2. 大多数云平台的文件系统是只读或临时的
3. 数据库文件未包含在版本控制中

## 解决方案

### 方案1: 将数据库文件提交到版本控制 ⭐⭐⭐⭐⭐ (推荐)

**优势**: 
- 简单直接，无额外成本
- 适合静态数据（词汇、短语）
- 部署后立即可用

**实施步骤**:
```bash
# 1. 将数据库相关文件添加到git
git add data/english-learning.db
git add database/
git add scripts/

# 2. 提交到版本控制
git commit -m "Add SQLite database and migration scripts"

# 3. 推送到远程仓库
git push origin master
```

**注意事项**:
- 用户学习记录仍使用localStorage存储
- 基础词汇和短语数据通过数据库提供
- 适合只读数据场景

### 方案2: 混合存储架构 ⭐⭐⭐⭐⭐ (最佳实践)

**架构设计**:
- **静态数据** (词汇、短语): SQLite数据库 (版本控制)
- **用户数据** (学习记录、统计): localStorage + 云端备份

**实施方案**:
```typescript
// 配置文件
const config = {
  production: {
    useDatabase: true,
    dataSource: 'embedded-sqlite'
  },
  development: {
    useDatabase: false,
    dataSource: 'json-files'
  }
}
```

### 方案3: 使用云数据库服务 ⭐⭐⭐⭐

**推荐服务**:

1. **Vercel KV (Redis)**
   - 成本: 免费额度30,000次请求/月
   - 优势: 与Vercel完美集成
   - 适用: 高频读写场景

2. **Supabase PostgreSQL**
   - 成本: 免费额度500MB存储
   - 优势: 功能强大，支持实时订阅
   - 适用: 需要复杂查询场景

3. **PlanetScale MySQL**
   - 成本: 免费额度5GB存储
   - 优势: 无服务器架构
   - 适用: 传统关系型数据库需求

### 方案4: 静态数据 + API服务 ⭐⭐⭐

**架构**:
- 将SQLite数据转换为JSON API
- 通过CDN分发静态数据
- 客户端缓存 + 增量更新

## 推荐实施方案

### 阶段1: 立即可用方案 (方案1)
```bash
# 立即解决部署问题
git add data/ database/ scripts/
git commit -m "Add database files for deployment"
git push
```

### 阶段2: 优化架构 (方案2)
1. 保持SQLite用于静态数据
2. 增强用户数据管理
3. 添加云端同步功能

### 阶段3: 扩展升级 (方案3)
当用户量增长时，迁移到云数据库

## 部署配置更新

### 更新数据库路径配置
```typescript
// src/lib/database.ts
const getDatabasePath = () => {
  if (process.env.NODE_ENV === 'production') {
    // 生产环境：使用项目根目录下的数据库
    return path.join(process.cwd(), 'data', 'english-learning.db');
  } else {
    // 开发环境：使用相同路径
    return path.join(process.cwd(), 'data', 'english-learning.db');
  }
};
```

### 更新.gitignore
```gitignore
# 注释掉或删除以下行，允许数据库文件被提交
# data/
# *.db
```

### 添加构建脚本
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/ensure-database.js"
  }
}
```

## 各平台部署说明

### Vercel
```bash
# vercel.json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 10
    }
  }
}
```

### Netlify
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
```

### Railway/Render
- 支持文件系统持久化
- 可以直接使用SQLite文件

## 监控和维护

### 数据库健康检查
```typescript
// 添加健康检查API
export async function GET() {
  try {
    const stats = databaseService.getVocabularyStats();
    return NextResponse.json({ 
      status: 'healthy', 
      data: stats 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
}
```

### 自动备份脚本
```bash
# scripts/backup-database.sh
#!/bin/bash
cp data/english-learning.db "backups/english-learning-$(date +%Y%m%d).db"
```

## 总结

**立即行动**: 使用方案1，将数据库文件提交到版本控制，确保线上部署可用。

**长期规划**: 采用混合架构，静态数据用SQLite，用户数据用localStorage + 云端同步。

这样既解决了immediate deployment问题，又为未来扩展留下了空间。
