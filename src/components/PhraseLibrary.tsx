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
import { PhraseItem, PhraseStats } from '@/types/vocabulary';
import { phraseService } from '@/lib/phrases';
import { storageService } from '@/lib/storage';

interface PhraseLibraryProps {
  onClose: () => void;
}

type SortField = 'english' | 'chinese' | 'accuracy' | 'attempts';
type SortDirection = 'asc' | 'desc';

export default function PhraseLibrary({ onClose }: PhraseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLearned, setShowOnlyLearned] = useState(false);
  const [sortField, setSortField] = useState<SortField>('english');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [allPhrases, setAllPhrases] = useState<PhraseItem[]>([]);
  const [phraseStats, setPhraseStats] = useState<PhraseStats[]>([]);

  useEffect(() => {
    setAllPhrases(phraseService.getAllPhrases());
    setPhraseStats(storageService.getPhraseStats());
  }, []);

  // 获取词组的统计信息
  const getPhraseStat = (phrase: string): PhraseStats | null => {
    return phraseStats.find(stat => stat.phrase === phrase) || null;
  };

  // 过滤和排序词组
  const filteredAndSortedPhrases = useMemo(() => {
    let filtered = allPhrases;

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(phrase => 
        phrase.english.toLowerCase().includes(term) || 
        phrase.chinese.toLowerCase().includes(term)
      );
    }

    // 是否只显示学过的词组
    if (showOnlyLearned) {
      filtered = filtered.filter(phrase => {
        const stat = getPhraseStat(phrase.english);
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
        case 'accuracy':
          const statA = getPhraseStat(a.english);
          const statB = getPhraseStat(b.english);
          const accuracyA = statA ? statA.accuracy : -1;
          const accuracyB = statB ? statB.accuracy : -1;
          compareValue = accuracyA - accuracyB;
          break;
        case 'attempts':
          const attemptA = getPhraseStat(a.english)?.totalAttempts || 0;
          const attemptB = getPhraseStat(b.english)?.totalAttempts || 0;
          compareValue = attemptA - attemptB;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [allPhrases, searchTerm, showOnlyLearned, sortField, sortDirection, phraseStats]);

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

  // 获取正确率显示
  const getAccuracyDisplay = (phrase: string) => {
    const stat = getPhraseStat(phrase);
    if (!stat || stat.totalAttempts === 0) {
      return <span className="text-gray-400">未学习</span>;
    }
    
    const accuracy = stat.accuracy;
    let colorClass = 'text-gray-600';
    if (accuracy >= 80) colorClass = 'text-green-600';
    else if (accuracy >= 60) colorClass = 'text-yellow-600';
    else colorClass = 'text-red-600';
    
    return <span className={colorClass}>{accuracy.toFixed(1)}%</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faSearch} className="mr-3" />
            词组库
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white text-xl" />
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="搜索词组（支持中英文）..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowOnlyLearned(!showOnlyLearned)}
                className={`px-4 py-3 rounded-lg border transition-colors duration-200 flex items-center gap-2 ${
                  showOnlyLearned
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon icon={showOnlyLearned ? faEye : faEyeSlash} />
                {showOnlyLearned ? '仅已学习' : '全部词组'}
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            找到 <span className="font-semibold text-green-600">{filteredAndSortedPhrases.length}</span> 个词组
            {searchTerm && <span>（搜索："{searchTerm}"）</span>}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('english')}
                    className="flex items-center gap-2 hover:text-green-600 transition-colors"
                  >
                    英文词组
                    <FontAwesomeIcon icon={getSortIcon('english')} className="text-sm" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('chinese')}
                    className="flex items-center gap-2 hover:text-green-600 transition-colors"
                  >
                    中文释义
                    <FontAwesomeIcon icon={getSortIcon('chinese')} className="text-sm" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('attempts')}
                    className="flex items-center gap-2 hover:text-green-600 transition-colors"
                  >
                    学习次数
                    <FontAwesomeIcon icon={getSortIcon('attempts')} className="text-sm" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('accuracy')}
                    className="flex items-center gap-2 hover:text-green-600 transition-colors"
                  >
                    正确率
                    <FontAwesomeIcon icon={getSortIcon('accuracy')} className="text-sm" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPhrases.map((phrase, index) => {
                const stat = getPhraseStat(phrase.english);
                return (
                  <tr
                    key={phrase.english}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{phrase.english}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-700">{phrase.chinese}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600">
                        {stat ? stat.totalAttempts : 0} 次
                      </div>
                    </td>
                    <td className="p-4">
                      {getAccuracyDisplay(phrase.english)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAndSortedPhrases.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faSearch} className="text-gray-300 text-4xl mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? '没有找到匹配的词组' : '没有词组数据'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-green-600 hover:text-green-700 underline"
                >
                  清除搜索条件
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              共 {allPhrases.length} 个词组，已学习 {phraseStats.length} 个
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
