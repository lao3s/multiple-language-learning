'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faChartLine, 
  faRedo,
  faArrowLeft,
  faTrophy,
  faFire,
  faThLarge,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storageService } from '@/lib/storage';
import { StudyStats, PhraseStudyStats } from '@/types/vocabulary';

export default function EnglishSystem() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [phraseStats, setPhraseStats] = useState<PhraseStudyStats | null>(null);

  useEffect(() => {
    setStats(storageService.getStudyStats());
    setPhraseStats(storageService.getPhraseStudyStats());
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

      {/* Mobile Navigation - Top Bar for screens that don't show floating nav */}
      <nav className="min-[1800px]:hidden bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-[88px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4 py-3">
              <button
                onClick={() => {
                  const element = document.getElementById('vocabulary-title');
                  if (element) {
                    const yOffset = -120; // 偏移量，避免被导航栏遮盖
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-600" />
                <span className="text-sm">单词学习</span>
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('phrases-title');
                  if (element) {
                    const yOffset = -120; // 偏移量，避免被导航栏遮盖
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
              >
              <FontAwesomeIcon icon={faBook} className="mr-2 text-green-600" />
              <span className="text-sm">词组学习</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Keep original width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Floating Left Navigation - Fixed at browser left edge, only on very wide screens */}
        <nav className="hidden min-[1800px]:block fixed left-4 top-32 z-30">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 w-56">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">快速导航</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const element = document.getElementById('vocabulary-title');
                  if (element) {
                    const yOffset = -120; // 偏移量，避免被导航栏遮盖
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-left text-sm"
              >
                <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-600 text-sm" />
                单词学习
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('phrases-title');
                  if (element) {
                    const yOffset = -120; // 偏移量，避免被导航栏遮盖
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors duration-200 text-left text-sm"
              >
                <FontAwesomeIcon icon={faBook} className="mr-2 text-green-600 text-sm" />
                词组学习
              </button>
            </div>
          </div>
        </nav>
        {/* 单词学习模块 */}
        <div id="vocabulary-module" className="mb-16">
          {/* 单词模块标题 */}
          <div id="vocabulary-title" className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">单词学习模块</h2>
            <p className="text-gray-600">通过多种模式背诵单词，提高词汇量</p>
          </div>

          {/* 单词模块统计 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FontAwesomeIcon icon={faBook} className="mr-3" />
                学习统计
              </h3>
            </div>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                <div className="text-center">
                  <div className="p-3 rounded-full bg-blue-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">学习次数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 rounded-full bg-green-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faThLarge} className="text-green-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">答题总数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 rounded-full bg-purple-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">正确率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageAccuracy.toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 rounded-full bg-red-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faFire} className="text-red-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">薄弱单词</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weakWords.length}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>暂无学习数据</p>
              </div>
            )}
          </div>

          {/* 单词学习功能 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 单词背诵 */}
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

            {/* 单词错题重做 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
                  <FontAwesomeIcon icon={faRedo} className="text-red-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">单词错题重做</h3>
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
        </div>

        {/* 词组学习模块 */}
        <div id="phrases-module" className="mb-16">
          {/* 词组模块标题 */}
          <div id="phrases-title" className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">词组学习模块</h2>
            <p className="text-gray-600">学习常用词组搭配，提升语言表达能力</p>
          </div>

          {/* 词组模块统计 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FontAwesomeIcon icon={faBook} className="mr-3" />
                学习统计
              </h3>
            </div>
            {phraseStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                <div className="text-center">
                  <div className="p-3 rounded-full bg-blue-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">学习次数</p>
                  <p className="text-2xl font-bold text-gray-900">{phraseStats.totalSessions}</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 rounded-full bg-green-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faThLarge} className="text-green-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">答题总数</p>
                  <p className="text-2xl font-bold text-gray-900">{phraseStats.totalQuestions}</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 rounded-full bg-purple-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">正确率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {phraseStats.averageAccuracy.toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 rounded-full bg-orange-100 inline-flex mb-2">
                    <FontAwesomeIcon icon={faFire} className="text-orange-600 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">薄弱词组</p>
                  <p className="text-2xl font-bold text-gray-900">{phraseStats.weakPhrases.length}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>暂无学习数据</p>
              </div>
            )}
          </div>

          {/* 词组学习功能 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 词组背诵 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
                  <FontAwesomeIcon icon={faBook} className="text-green-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">词组背诵</h3>
                <p className="text-gray-600">学习常用词组搭配，提升语言表达能力</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">C1精通级词组</span>
                  <span className="text-green-600 font-medium">999个</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">智能难度调节</span>
                  <span className="text-green-600 font-medium">可用</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">多种学习模式</span>
                  <span className="text-green-600 font-medium">可用</span>
                </div>
              </div>

              <Link 
                href="/english/phrases"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center block"
              >
                开始学习
              </Link>
            </div>

            {/* 词组错题重做 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-orange-100 mb-4">
                  <FontAwesomeIcon icon={faRedo} className="text-orange-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">词组错题重做</h3>
                <p className="text-gray-600">复习之前答错的词组，强化记忆</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">错题总数</span>
                  <span className="text-orange-600 font-medium">
                    {phraseStats ? phraseStats.weakPhrases.length : 0} 个
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">建议复习时间</span>
                  <span className="text-gray-600">
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    {phraseStats && phraseStats.weakPhrases.length > 0 ? `${Math.ceil(phraseStats.weakPhrases.length / 8)} 分钟` : '暂无'}
                  </span>
                </div>
              </div>

              <Link 
                href="/english/phrases/review"
                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center block ${
                  phraseStats && phraseStats.weakPhrases.length > 0
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {phraseStats && phraseStats.weakPhrases.length > 0 ? '开始复习' : '暂无错题'}
              </Link>
            </div>
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
