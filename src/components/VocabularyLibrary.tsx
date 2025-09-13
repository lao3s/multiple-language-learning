'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faTimes, 
  faChartLine,
  faEye,
  faEyeSlash,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';
import { VocabularyItem, WordStats } from '@/types/vocabulary';
import { vocabularyService } from '@/lib/vocabulary';
import { storageService } from '@/lib/storage';

interface VocabularyLibraryProps {
  onClose: () => void;
}

type SortField = 'english' | 'chinese' | 'level' | 'accuracy' | 'attempts';
type SortDirection = 'asc' | 'desc';

export default function VocabularyLibrary({ onClose }: VocabularyLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showOnlyLearned, setShowOnlyLearned] = useState(false);
  const [sortField, setSortField] = useState<SortField>('english');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [wordStats, setWordStats] = useState<WordStats[]>([]);

  useEffect(() => {
    setAllWords(vocabularyService.getAllWords());
    setWordStats(storageService.getWordStats());
  }, []);

  // 获取单词的统计信息
  const getWordStat = (word: string): WordStats | null => {
    return wordStats.find(ws => ws.word === word) || null;
  };

  // 过滤和排序单词
  const filteredAndSortedWords = useMemo(() => {
    let filtered = allWords;

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(word => 
        word.english.toLowerCase().includes(term) || 
        word.chinese.toLowerCase().includes(term)
      );
    }

    // 等级过滤
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(word => word.level === selectedLevel);
    }

    // 是否只显示学过的单词
    if (showOnlyLearned) {
      filtered = filtered.filter(word => {
        const stat = getWordStat(word.english);
        return stat && stat.totalAttempts > 0;
      });
    }

    // 排序
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'english':
          compareValue = a.english.localeCompare(b.english);
          break;
        case 'chinese':
          compareValue = a.chinese.localeCompare(b.chinese);
          break;
        case 'level':
          const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
          compareValue = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
          break;
        case 'accuracy':
          const statA = getWordStat(a.english);
          const statB = getWordStat(b.english);
          const accuracyA = statA ? statA.accuracy : -1;
          const accuracyB = statB ? statB.accuracy : -1;
          compareValue = accuracyA - accuracyB;
          break;
        case 'attempts':
          const attemptA = getWordStat(a.english)?.totalAttempts || 0;
          const attemptB = getWordStat(b.english)?.totalAttempts || 0;
          compareValue = attemptA - attemptB;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [allWords, searchTerm, selectedLevel, showOnlyLearned, sortField, sortDirection, wordStats]);

  // 处理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  // 获取正确率的颜色类
  const getAccuracyColorClass = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-100';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">单词库</h2>
            <p className="text-gray-600">
              共 {allWords.length} 个单词，已学习 {wordStats.length} 个
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索单词（英文或中文）..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div className="lg:w-48">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部等级</option>
                <option value="A1">A1 (初级)</option>
                <option value="A2">A2 (初中级)</option>
                <option value="B1">B1 (中级)</option>
                <option value="B2">B2 (中高级)</option>
                <option value="C1">C1 (高级)</option>
              </select>
            </div>

            {/* Show Only Learned */}
            <div className="flex items-center">
              <button
                onClick={() => setShowOnlyLearned(!showOnlyLearned)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  showOnlyLearned 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon 
                  icon={showOnlyLearned ? faEye : faEyeSlash} 
                  className="mr-2" 
                />
                只看已学习
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            找到 {filteredAndSortedWords.length} 个单词
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('english')}
                >
                  <div className="flex items-center">
                    英文
                    <FontAwesomeIcon 
                      icon={getSortIcon('english')} 
                      className="ml-2 text-gray-400"
                    />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('chinese')}
                >
                  <div className="flex items-center">
                    中文
                    <FontAwesomeIcon 
                      icon={getSortIcon('chinese')} 
                      className="ml-2 text-gray-400"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  词性
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center">
                    等级
                    <FontAwesomeIcon 
                      icon={getSortIcon('level')} 
                      className="ml-2 text-gray-400"
                    />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('attempts')}
                >
                  <div className="flex items-center">
                    练习次数
                    <FontAwesomeIcon 
                      icon={getSortIcon('attempts')} 
                      className="ml-2 text-gray-400"
                    />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('accuracy')}
                >
                  <div className="flex items-center">
                    正确率
                    <FontAwesomeIcon 
                      icon={getSortIcon('accuracy')} 
                      className="ml-2 text-gray-400"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedWords.map((word, index) => {
                const stat = getWordStat(word.english);
                return (
                  <tr key={word.english} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{word.english}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{word.chinese}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {word.pos}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {word.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat ? stat.totalAttempts : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stat ? (
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getAccuracyColorClass(stat.accuracy)}`}>
                            {stat.accuracy.toFixed(1)}%
                          </span>
                          <div className="ml-2 text-xs text-gray-500">
                            ({stat.correctAttempts}/{stat.totalAttempts})
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">未学习</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAndSortedWords.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500 text-lg">没有找到匹配的单词</p>
              <p className="text-gray-400 text-sm">尝试调整搜索条件或筛选器</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              显示 {filteredAndSortedWords.length} / {allWords.length} 个单词
            </div>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faChartLine} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                总学习进度: {((wordStats.length / allWords.length) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
