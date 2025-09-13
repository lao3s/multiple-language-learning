import { VocabularyItem } from '@/types/vocabulary';

// 系统名称
const SYSTEM_NAME = 'WordWise';

// 获取操作系统类型
function getOS(): 'windows' | 'mac' | 'linux' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  return 'unknown';
}

// 获取系统特定的存储路径
function getStoragePath(filename: string): string {
  const os = getOS();
  
  switch (os) {
    case 'windows':
      return `D:\\Program Files\\${SYSTEM_NAME}\\${filename}`;
    case 'mac':
      return `/Applications/${SYSTEM_NAME}/${filename}`;
    case 'linux':
      return `/opt/${SYSTEM_NAME}/${filename}`;
    default:
      return `./${SYSTEM_NAME}/${filename}`;
  }
}

// 文件存储服务类
export class FileStorageService {
  private readonly WRONG_WORDS_FILE = 'wrong-words.json';
  private readonly STUDY_STATS_FILE = 'study-stats.json';
  private readonly BACKUP_FILE = 'backup.json';

  /**
   * 将错题记录导出到本地文件
   */
  async exportWrongWordsToFile(wrongWords: VocabularyItem[]): Promise<boolean> {
    try {
      const filePath = getStoragePath(this.WRONG_WORDS_FILE);
      const data = {
        exportTime: new Date().toISOString(),
        systemName: SYSTEM_NAME,
        version: '1.0.0',
        platform: getOS(),
        totalWords: wrongWords.length,
        wrongWords: wrongWords.map(word => ({
          english: word.english,
          chinese: word.chinese,
          pos: word.pos,
          level: word.level,
          addedTime: new Date().toISOString()
        }))
      };

      const jsonContent = JSON.stringify(data, null, 2);
      
      // 使用 File System Access API (现代浏览器)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${SYSTEM_NAME}-wrong-words-${new Date().toISOString().split('T')[0]}.json`,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(jsonContent);
        await writable.close();
        
        return true;
      } 
      // 降级方案：使用下载链接
      else {
        this.downloadAsFile(jsonContent, `${SYSTEM_NAME}-wrong-words-${new Date().toISOString().split('T')[0]}.json`);
        return true;
      }
    } catch (error) {
      console.error('导出错题记录失败:', error);
      return false;
    }
  }

  /**
   * 从本地文件导入错题记录
   */
  async importWrongWordsFromFile(): Promise<VocabularyItem[] | null> {
    try {
      // 使用 File System Access API
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const file = await fileHandle.getFile();
        const content = await file.text();
        const data = JSON.parse(content);
        
        // 验证文件格式
        if (data.systemName === SYSTEM_NAME && data.wrongWords && Array.isArray(data.wrongWords)) {
          return data.wrongWords.map((word: any) => ({
            english: word.english,
            chinese: word.chinese,
            pos: word.pos,
            level: word.level
          }));
        }
      }
      // 降级方案：使用文件输入
      else {
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const content = await file.text();
              const data = JSON.parse(content);
              
              if (data.systemName === SYSTEM_NAME && data.wrongWords && Array.isArray(data.wrongWords)) {
                resolve(data.wrongWords.map((word: any) => ({
                  english: word.english,
                  chinese: word.chinese,
                  pos: word.pos,
                  level: word.level
                })));
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      }
      
      return null;
    } catch (error) {
      console.error('导入错题记录失败:', error);
      return null;
    }
  }

  /**
   * 创建完整的学习数据备份
   */
  async createFullBackup(wrongWords: VocabularyItem[], studyStats: any): Promise<boolean> {
    try {
      const backupData = {
        exportTime: new Date().toISOString(),
        systemName: SYSTEM_NAME,
        version: '1.0.0',
        platform: getOS(),
        data: {
          wrongWords,
          studyStats,
          metadata: {
            totalWrongWords: wrongWords.length,
            exportPath: getStoragePath(this.BACKUP_FILE)
          }
        }
      };

      const jsonContent = JSON.stringify(backupData, null, 2);
      
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${SYSTEM_NAME}-backup-${new Date().toISOString().split('T')[0]}.json`,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(jsonContent);
        await writable.close();
        
        return true;
      } else {
        this.downloadAsFile(jsonContent, `${SYSTEM_NAME}-backup-${new Date().toISOString().split('T')[0]}.json`);
        return true;
      }
    } catch (error) {
      console.error('创建备份失败:', error);
      return false;
    }
  }

  /**
   * 恢复完整的学习数据
   */
  async restoreFromBackup(): Promise<{ wrongWords: VocabularyItem[], studyStats: any } | null> {
    try {
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const file = await fileHandle.getFile();
        const content = await file.text();
        const backupData = JSON.parse(content);
        
        if (backupData.systemName === SYSTEM_NAME && backupData.data) {
          return {
            wrongWords: backupData.data.wrongWords || [],
            studyStats: backupData.data.studyStats || {}
          };
        }
      } else {
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const content = await file.text();
              const backupData = JSON.parse(content);
              
              if (backupData.systemName === SYSTEM_NAME && backupData.data) {
                resolve({
                  wrongWords: backupData.data.wrongWords || [],
                  studyStats: backupData.data.studyStats || {}
                });
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      }
      
      return null;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return null;
    }
  }

  /**
   * 获取推荐的存储路径信息
   */
  getStorageInfo() {
    const os = getOS();
    return {
      systemName: SYSTEM_NAME,
      platform: os,
      wrongWordsPath: getStoragePath(this.WRONG_WORDS_FILE),
      studyStatsPath: getStoragePath(this.STUDY_STATS_FILE),
      backupPath: getStoragePath(this.BACKUP_FILE),
      supportedFormats: ['JSON'],
      features: {
        fileSystemAccess: 'showSaveFilePicker' in window,
        downloadFallback: true
      }
    };
  }

  /**
   * 下载文件的降级方案
   */
  private downloadAsFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 检查文件系统访问权限
   */
  async checkFileSystemPermissions(): Promise<boolean> {
    try {
      if ('showSaveFilePicker' in window) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const fileStorageService = new FileStorageService();
