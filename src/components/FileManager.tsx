'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faUpload, 
  faDatabase,
  faUndo,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faFolder,
  faFile
} from '@fortawesome/free-solid-svg-icons';
import { storageService } from '@/lib/storage';

interface FileManagerProps {
  onClose?: () => void;
}

export default function FileManager({ onClose }: FileManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [wrongWordsCount, setWrongWordsCount] = useState(0);
  const [hasFileSystemAccess, setHasFileSystemAccess] = useState(false);

  useEffect(() => {
    // 获取存储信息
    const info = storageService.getFileStorageInfo();
    setStorageInfo(info);
    
    // 获取错题数量
    const wrongWords = storageService.getWrongWords();
    setWrongWordsCount(wrongWords.length);
    
    // 检查文件系统访问权限
    storageService.checkFileSystemPermissions().then(setHasFileSystemAccess);
  }, []);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExportWrongWords = async () => {
    setIsLoading(true);
    try {
      const success = await storageService.exportWrongWordsToFile();
      if (success) {
        showMessage('success', '错题记录已成功导出到本地文件！');
      } else {
        showMessage('error', '导出失败，请重试。');
      }
    } catch (error) {
      showMessage('error', '导出过程中发生错误。');
    }
    setIsLoading(false);
  };

  const handleImportWrongWords = async () => {
    setIsLoading(true);
    try {
      const success = await storageService.importWrongWordsFromFile();
      if (success) {
        // 更新错题数量
        const wrongWords = storageService.getWrongWords();
        setWrongWordsCount(wrongWords.length);
        showMessage('success', '错题记录已成功导入并合并！');
      } else {
        showMessage('error', '导入失败，请检查文件格式。');
      }
    } catch (error) {
      showMessage('error', '导入过程中发生错误。');
    }
    setIsLoading(false);
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const success = await storageService.createFullBackup();
      if (success) {
        showMessage('success', '完整备份已创建！');
      } else {
        showMessage('error', '备份创建失败。');
      }
    } catch (error) {
      showMessage('error', '备份过程中发生错误。');
    }
    setIsLoading(false);
  };

  const handleRestoreBackup = async () => {
    if (!confirm('恢复备份将覆盖当前的学习数据，是否继续？')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await storageService.restoreFromBackup();
      if (success) {
        // 更新错题数量
        const wrongWords = storageService.getWrongWords();
        setWrongWordsCount(wrongWords.length);
        showMessage('success', '备份已成功恢复！');
      } else {
        showMessage('error', '备份恢复失败。');
      }
    } catch (error) {
      showMessage('error', '恢复过程中发生错误。');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">文件管理</h2>
              <p className="text-gray-600 mt-1">管理你的学习数据和错题记录</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-gray-500 text-xl">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={
                  message.type === 'success' ? faCheckCircle :
                  message.type === 'error' ? faExclamationTriangle :
                  faInfoCircle
                } 
                className="mr-2"
              />
              {message.text}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* System Info */}
          {storageInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-600" />
                系统信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">系统名称:</span>
                  <span className="ml-2 font-medium">{storageInfo.systemName}</span>
                </div>
                <div>
                  <span className="text-gray-600">平台:</span>
                  <span className="ml-2 font-medium capitalize">{storageInfo.platform}</span>
                </div>
                <div>
                  <span className="text-gray-600">错题数量:</span>
                  <span className="ml-2 font-medium">{wrongWordsCount} 个</span>
                </div>
                <div>
                  <span className="text-gray-600">文件访问:</span>
                  <span className={`ml-2 font-medium ${hasFileSystemAccess ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasFileSystemAccess ? '支持' : '降级模式'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Storage Paths */}
          {storageInfo && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FontAwesomeIcon icon={faFolder} className="mr-2 text-blue-600" />
                推荐存储路径
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faFile} className="mr-2 mt-1 text-gray-500 text-xs" />
                  <div>
                    <p className="font-medium">错题记录:</p>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {storageInfo.wrongWordsPath}
                    </code>
                  </div>
                </div>
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faFile} className="mr-2 mt-1 text-gray-500 text-xs" />
                  <div>
                    <p className="font-medium">完整备份:</p>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {storageInfo.backupPath}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">操作选项</h3>
            
            {/* Wrong Words Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExportWrongWords}
                disabled={isLoading || wrongWordsCount === 0}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  wrongWordsCount === 0
                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700'
                }`}
              >
                <div className="text-center">
                  <FontAwesomeIcon 
                    icon={isLoading ? faSpinner : faDownload} 
                    className={`text-2xl mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <h4 className="font-medium mb-1">导出错题记录</h4>
                  <p className="text-xs text-gray-600">
                    {wrongWordsCount === 0 ? '暂无错题记录' : `导出 ${wrongWordsCount} 个错题到本地文件`}
                  </p>
                </div>
              </button>

              <button
                onClick={handleImportWrongWords}
                disabled={isLoading}
                className="p-4 rounded-lg border-2 border-green-300 hover:border-green-500 hover:bg-green-50 text-green-700 transition-all duration-200"
              >
                <div className="text-center">
                  <FontAwesomeIcon 
                    icon={isLoading ? faSpinner : faUpload} 
                    className={`text-2xl mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <h4 className="font-medium mb-1">导入错题记录</h4>
                  <p className="text-xs text-gray-600">从本地文件导入错题记录</p>
                </div>
              </button>
            </div>

            {/* Backup Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="p-4 rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 text-purple-700 transition-all duration-200"
              >
                <div className="text-center">
                  <FontAwesomeIcon 
                    icon={isLoading ? faSpinner : faDatabase} 
                    className={`text-2xl mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <h4 className="font-medium mb-1">创建完整备份</h4>
                  <p className="text-xs text-gray-600">备份所有学习数据和统计信息</p>
                </div>
              </button>

              <button
                onClick={handleRestoreBackup}
                disabled={isLoading}
                className="p-4 rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-orange-700 transition-all duration-200"
              >
                <div className="text-center">
                  <FontAwesomeIcon 
                    icon={isLoading ? faSpinner : faUndo} 
                    className={`text-2xl mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <h4 className="font-medium mb-1">恢复备份</h4>
                  <p className="text-xs text-gray-600">从备份文件恢复学习数据</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-yellow-600" />
              使用提示
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 定期备份学习数据以防数据丢失</li>
              <li>• 错题记录支持跨设备同步，可在不同设备间导入导出</li>
              <li>• {hasFileSystemAccess ? '你的浏览器支持直接文件系统访问' : '当前使用下载方式保存文件'}</li>
              <li>• 所有数据均以JSON格式存储，便于数据迁移和备份</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
