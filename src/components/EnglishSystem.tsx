'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faChartLine, 
  faRedo,
  faArrowLeft,
  faTrophy,
  faFire,
  faTarget,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storageService } from '@/lib/storage';
import { StudyStats } from '@/types/vocabulary';

export default function EnglishSystem() {
  const [stats, setStats] = useState<StudyStats | null>(null);

  useEffect(() => {
    setStats(storageService.getStudyStats());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600 text-xl" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <FontAwesomeIcon icon={faBook} className="text-blue-600 mr-3" />
                  英语学习系统
                </h1>
                <p className="text-gray-600">多邻国英语考试专项训练</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FontAwesomeIcon icon={faTrophy} className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">学习次数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <FontAwesomeIcon icon={faTarget} className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">答题总数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">正确率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageAccuracy.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <FontAwesomeIcon icon={faFire} className="text-red-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">薄弱单词</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weakWords.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Vocabulary Learning */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
                <FontAwesomeIcon icon={faBook} className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">单词背诵</h3>
              <p className="text-gray-600">通过多种模式背诵单词，提高词汇量</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">中译英模式</span>
                <span className="text-blue-600 font-medium">可用</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">英译中模式</span>
                <span className="text-blue-600 font-medium">可用</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">混合模式</span>
                <span className="text-blue-600 font-medium">可用</span>
              </div>
            </div>

            <Link 
              href="/english/vocabulary"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center block"
            >
              开始学习
            </Link>
          </div>

          {/* Wrong Words Review */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
                <FontAwesomeIcon icon={faRedo} className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">错题重做</h3>
              <p className="text-gray-600">复习之前答错的单词，巩固薄弱环节</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">错题总数</span>
                <span className="text-red-600 font-medium">
                  {stats ? stats.weakWords.length : 0} 个
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">建议复习时间</span>
                <span className="text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  {stats && stats.weakWords.length > 0 ? `${Math.ceil(stats.weakWords.length / 10)} 分钟` : '暂无'}
                </span>
              </div>
            </div>

            <Link 
              href="/english/vocabulary/review"
              className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center block ${
                stats && stats.weakWords.length > 0
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {stats && stats.weakWords.length > 0 ? '开始复习' : '暂无错题'}
            </Link>
          </div>
        </div>

        {/* Coming Soon Modules */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">即将推出的功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-300 opacity-60">
              <FontAwesomeIcon icon={faBook} className="text-gray-400 text-2xl mb-3" />
              <h4 className="font-medium text-gray-600 mb-2">语法练习</h4>
              <p className="text-sm text-gray-500">语法规则学习与练习</p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-300 opacity-60">
              <FontAwesomeIcon icon={faBook} className="text-gray-400 text-2xl mb-3" />
              <h4 className="font-medium text-gray-600 mb-2">听力训练</h4>
              <p className="text-sm text-gray-500">提升英语听力理解能力</p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-300 opacity-60">
              <FontAwesomeIcon icon={faBook} className="text-gray-400 text-2xl mb-3" />
              <h4 className="font-medium text-gray-600 mb-2">口语练习</h4>
              <p className="text-sm text-gray-500">AI辅助口语发音练习</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
