'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faLanguage, 
  faGraduationCap,
  faChartLine,
  faClock,
  faArrowRight,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { LanguageSystem } from '@/types/vocabulary';
import Link from 'next/link';

const languageSystems: LanguageSystem[] = [
  {
    id: 'english',
    name: '英语学习',
    description: '多邻国英语考试专项训练',
    icon: 'faBook',
    color: 'from-blue-500 to-blue-700',
    href: '/english',
    isAvailable: true,
  },
  {
    id: 'german',
    name: '德语学习',
    description: '德语基础到进阶训练（即将推出）',
    icon: 'faLanguage',
    color: 'from-red-500 to-red-700',
    href: '/german',
    isAvailable: false,
  },
  {
    id: 'japanese',
    name: '日语学习',
    description: '日语五十音到N1全覆盖（即将推出）',
    icon: 'faGraduationCap',
    color: 'from-pink-500 to-pink-700',
    href: '/japanese',
    isAvailable: false,
  },
  {
    id: 'french',
    name: '法语学习',
    description: '浪漫法语从零开始（即将推出）',
    icon: 'faBook',
    color: 'from-purple-500 to-purple-700',
    href: '/french',
    isAvailable: false,
  },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'faBook': return faBook;
    case 'faLanguage': return faLanguage;
    case 'faGraduationCap': return faGraduationCap;
    default: return faBook;
  }
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faLanguage} className="text-indigo-600 mr-3" />
              多语言学习中台
            </h1>
            <p className="text-lg text-gray-600">
              专业的语言学习系统，助力你的语言学习之旅
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FontAwesomeIcon icon={faChartLine} className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">学习进度</p>
                <p className="text-2xl font-bold text-gray-900">1 / 4</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FontAwesomeIcon icon={faClock} className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日学习时长</p>
                <p className="text-2xl font-bold text-gray-900">0 分钟</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FontAwesomeIcon icon={faGraduationCap} className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">掌握词汇</p>
                <p className="text-2xl font-bold text-gray-900">0 个</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language Systems Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">选择学习语言</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {languageSystems.map((system) => (
              <div
                key={system.id}
                className={`relative group ${
                  system.isAvailable 
                    ? 'hover:scale-105 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                } transition-all duration-300`}
              >
                {system.isAvailable ? (
                  <Link href={system.href}>
                    <div className={`bg-gradient-to-r ${system.color} rounded-xl shadow-lg p-8 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <FontAwesomeIcon 
                            icon={getIcon(system.icon)} 
                            className="text-4xl"
                          />
                          <FontAwesomeIcon 
                            icon={faArrowRight} 
                            className="text-xl group-hover:translate-x-2 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{system.name}</h3>
                        <p className="text-white/90">{system.description}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className={`bg-gradient-to-r ${system.color} rounded-xl shadow-lg p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <FontAwesomeIcon 
                          icon={getIcon(system.icon)} 
                          className="text-4xl"
                        />
                        <FontAwesomeIcon 
                          icon={faLock} 
                          className="text-xl"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{system.name}</h3>
                      <p className="text-white/90">{system.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">快速开始</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/english/vocabulary"
              className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faBook} className="text-blue-500 text-xl mr-3" />
              <div>
                <p className="font-medium text-gray-900">单词背诵</p>
                <p className="text-sm text-gray-600">开始背诵英语单词</p>
              </div>
            </Link>

            <div className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 opacity-50 cursor-not-allowed">
              <FontAwesomeIcon icon={faLanguage} className="text-gray-400 text-xl mr-3" />
              <div>
                <p className="font-medium text-gray-600">语法练习</p>
                <p className="text-sm text-gray-500">即将推出</p>
              </div>
            </div>

            <div className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 opacity-50 cursor-not-allowed">
              <FontAwesomeIcon icon={faGraduationCap} className="text-gray-400 text-xl mr-3" />
              <div>
                <p className="font-medium text-gray-600">听力训练</p>
                <p className="text-sm text-gray-500">即将推出</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
