'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faCheck, 
  faTimes, 
  faRedo,
  faPlay,
  faCog,
  faChartLine,
  faTrophy,
  faFire,
  faFileExport,
  faBook,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { PhraseItem, StudyMode, PhraseStudySession, DifficultyMode, PhraseQuestionRecord } from '@/types/vocabulary';
import { phraseService } from '@/lib/phrases';
import { storageService } from '@/lib/storage';
import { useKeyboard } from '@/hooks/useKeyboard';
import PhraseLibrary from './PhraseLibrary';

interface PhraseLearningProps {
  mode?: StudyMode;
  isReviewMode?: boolean;
}

export default function PhraseLearning({ 
  mode = 'mixed', 
  isReviewMode = false 
}: PhraseLearningProps) {
  const [currentMode, setCurrentMode] = useState<StudyMode>('chinese-to-english');
  const [isStarted, setIsStarted] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<PhraseItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [isInputMode, setIsInputMode] = useState(false); // 词组学习默认使用选择模式
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [session, setSession] = useState<PhraseStudySession | null>(null);
  const [phrasePool, setPhrasePool] = useState<PhraseItem[]>([]);
  const [showSettings, setShowSettings] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>('auto');
  const [currentQuestionMode, setCurrentQuestionMode] = useState<StudyMode>('chinese-to-english');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentWrongAnswers, setCurrentWrongAnswers] = useState<PhraseItem[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  
  // 输入框引用，用于自动聚焦
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦到输入框
  useEffect(() => {
    if (isStarted && currentPhrase && isInputMode && !showResult && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isStarted, currentPhrase, isInputMode, showResult]);

  // 初始化词组池
  useEffect(() => {
    if (isReviewMode) {
      const wrongPhrases = storageService.getWrongPhrases();
      setPhrasePool(wrongPhrases);
    } else {
      // 根据难度模式获取词组
      let phrases: PhraseItem[];
      if (questionCount === -1) {
        // 选择全部词组
        phrases = phraseService.getAllPhrasesByDifficultyMode(difficultyMode);
      } else {
        // 选择指定数量的词组
        phrases = phraseService.getPhrasesByDifficultyMode(difficultyMode, questionCount);
      }
      setPhrasePool(phrases);
    }
  }, [isReviewMode, questionCount, difficultyMode, refreshKey]);

  // 开始学习会话
  const startSession = useCallback(() => {
    if (phrasePool.length === 0) return;
    
    // 计算实际题目数量：如果选择了"全部词组"，则使用词组池的长度
    const actualQuestionCount = questionCount === -1 ? phrasePool.length : Math.min(questionCount, phrasePool.length);
    
    const newSession: PhraseStudySession = {
      mode: currentMode,
      difficultyMode: difficultyMode,
      totalQuestions: actualQuestionCount,
      currentQuestion: 0,
      correctAnswers: 0,
      wrongAnswers: [],
      startTime: new Date(),
      questionRecords: [],
    };
    
    // 清空当前错题列表（开始新的学习会话）
    setCurrentWrongAnswers([]);
    setSession(newSession);
    setIsStarted(true);
    loadNextQuestion(newSession);
  }, [currentMode, difficultyMode, questionCount, phrasePool]);

  // 加载下一题
  const loadNextQuestion = useCallback((currentSession: PhraseStudySession, customPhrasePool?: PhraseItem[]) => {
    if (currentSession.currentQuestion >= currentSession.totalQuestions) {
      // 学习会话结束
      finishSession(currentSession);
      return;
    }

    let phrase: PhraseItem;
    
    // 优先使用传入的自定义词组池（用于错题重做）
    const activePhrasePool = customPhrasePool || phrasePool;
    
    // 检查是否有预设的词组池（错题重做时使用）
    if (activePhrasePool.length > 0 && currentSession.currentQuestion < activePhrasePool.length) {
      // 使用预设词组池中的词组（按顺序）
      phrase = activePhrasePool[currentSession.currentQuestion];
      console.log('错题重做模式 - 使用词组池中的词组:', phrase, '题目索引:', currentSession.currentQuestion);
    } else {
      // 正常模式：重新生成词组池，确保题目随机性
      let freshPhrases: PhraseItem[];
      if (isReviewMode) {
        freshPhrases = storageService.getWrongPhrases();
      } else {
        if (questionCount === -1) {
          // 全部词组模式（根据难度模式筛选）
          freshPhrases = phraseService.getAllPhrasesByDifficultyMode(difficultyMode);
        } else {
          // 指定数量模式
          freshPhrases = phraseService.getPhrasesByDifficultyMode(difficultyMode, questionCount);
        }
      }
      
      // 从新生成的词组池中随机选择一个词组
      const randomIndex = Math.floor(Math.random() * freshPhrases.length);
      phrase = freshPhrases[randomIndex];
    }
    
    setCurrentPhrase(phrase);
    
    // 确定当前题目的模式
    let questionMode: StudyMode = currentSession.mode;
    if (currentSession.mode === 'mixed') {
      questionMode = Math.random() > 0.5 ? 'chinese-to-english' : 'english-to-chinese';
    }
    setCurrentQuestionMode(questionMode);
    
    // 只在选择模式下生成选项
    if (!isInputMode) {
      const questionOptions = phraseService.generateOptions(phrase, questionMode);
      setOptions(questionOptions);
    } else {
      setOptions([]);
    }
    
    setSelectedAnswer('');
    setInputAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  }, [isInputMode, isReviewMode, difficultyMode, questionCount, phrasePool]);

  // 完成学习会话
  const finishSession = useCallback((completedSession: PhraseStudySession) => {
    console.log('完成会话 - 错题列表:', completedSession.wrongAnswers);
    storageService.updatePhraseStudyStats(completedSession);
    storageService.clearCurrentPhraseSession();
    // 更新当前错题列表
    setCurrentWrongAnswers(completedSession.wrongAnswers);
    console.log('设置新的当前错题列表:', completedSession.wrongAnswers);
    // 不要设置 setIsStarted(false)，让结果页面正常显示
    setSession(completedSession);
  }, []);

  // 选择答案
  const selectAnswer = useCallback((answer: string) => {
    if (showResult || !currentPhrase || !session) return;
    
    setSelectedAnswer(answer);
    
    const correctAnswer = currentQuestionMode === 'chinese-to-english' 
      ? currentPhrase.english 
      : currentPhrase.chinese;
    
    const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    
    // 更新会话状态
    const updatedSession = { ...session };
    if (correct) {
      updatedSession.correctAnswers++;
      // 如果是复习模式且答对了，从错题库中移除
      if (isReviewMode) {
        storageService.removeWrongPhrase(currentPhrase);
      }
    } else {
      updatedSession.wrongAnswers.push(currentPhrase);
      storageService.addWrongPhrase(currentPhrase);
    }
    
    // 更新词组个体统计
    storageService.updatePhraseStats(currentPhrase, correct);
    
    // 记录答题记录
    const questionRecord: PhraseQuestionRecord = {
      phrase: currentPhrase,
      questionMode: currentQuestionMode,
      userAnswer: answer,
      correctAnswer: correctAnswer,
      isCorrect: correct,
      answerTime: new Date()
    };
    
    if (!updatedSession.questionRecords) {
      updatedSession.questionRecords = [];
    }
    updatedSession.questionRecords.push(questionRecord);
    
    setSession(updatedSession);
    storageService.saveCurrentPhraseSession(updatedSession);
  }, [currentPhrase, session, showResult, isReviewMode, currentQuestionMode]);

  // 提交输入答案
  const submitInputAnswer = useCallback(() => {
    if (!inputAnswer.trim()) return;
    selectAnswer(inputAnswer.trim());
  }, [inputAnswer, selectAnswer]);

  // 下一题
  const nextQuestion = useCallback(() => {
    if (!session) return;
    
    const updatedSession = { ...session };
    updatedSession.currentQuestion++;
    setSession(updatedSession);
    
    loadNextQuestion(updatedSession);
  }, [session, loadNextQuestion]);

  // 键盘支持
  useKeyboard({
    onEnter: () => {
      if (showResult) {
        nextQuestion();
      } else if (isInputMode) {
        submitInputAnswer();
      } else if (selectedAnswer) {
        selectAnswer(selectedAnswer);
      }
    },
    onArrowUp: () => {
      if (!showResult && !isInputMode && options.length > 0) {
        const currentIndex = options.indexOf(selectedAnswer);
        const newIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
        setSelectedAnswer(options[newIndex]);
      }
    },
    onArrowDown: () => {
      if (!showResult && !isInputMode && options.length > 0) {
        const currentIndex = options.indexOf(selectedAnswer);
        const newIndex = currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
        setSelectedAnswer(options[newIndex]);
      }
    },
    disabled: !isStarted || !currentPhrase,
  });

  // 学习会话结束后的结果页面
  if (session && session.currentQuestion >= session.totalQuestions) {
    console.log('显示结果页面 - session:', session);
    console.log('当前题目:', session.currentQuestion, '总题目:', session.totalQuestions);
    
    // 确保 currentWrongAnswers 与 session.wrongAnswers 同步
    console.log('结果页面 - session.wrongAnswers:', session.wrongAnswers);
    console.log('结果页面 - currentWrongAnswers:', currentWrongAnswers);
    if (currentWrongAnswers.length !== session.wrongAnswers.length) {
      console.log('同步错题列表 - 从', currentWrongAnswers, '到', session.wrongAnswers);
      setCurrentWrongAnswers(session.wrongAnswers);
    }
    const accuracy = (session.correctAnswers / session.totalQuestions) * 100;
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - new Date(session.startTime).getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex p-6 rounded-full bg-green-100 mb-6">
              <FontAwesomeIcon icon={faTrophy} className="text-green-600 text-4xl" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">词组学习完成！</h1>
            <p className="text-lg text-gray-600 mb-2">恭喜你完成了这次词组学习</p>
            <p className="text-sm text-gray-500">
              用时: {minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`} | 
              模式: {session.mode === 'mixed' ? '混合模式' : session.mode === 'chinese-to-english' ? '中译英' : '英译中'} | 
              难度: {phraseService.getDifficultyModeConfig(session.difficultyMode).name}
            </p>
          </div>

          {/* 主要统计 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <FontAwesomeIcon icon={faChartLine} className="text-blue-600 text-2xl mb-3" />
                <p className="text-sm text-gray-600 mb-1">正确率</p>
                <p className="text-3xl font-bold text-gray-900">{accuracy.toFixed(1)}%</p>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  accuracy >= 90 ? 'bg-green-100 text-green-800' :
                  accuracy >= 80 ? 'bg-blue-100 text-blue-800' :
                  accuracy >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {accuracy >= 90 ? '优秀' : accuracy >= 80 ? '良好' : accuracy >= 70 ? '及格' : '需加强'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <FontAwesomeIcon icon={faCheck} className="text-green-600 text-2xl mb-3" />
                <p className="text-sm text-gray-600 mb-1">答对题数</p>
                <p className="text-3xl font-bold text-gray-900">
                  {session.correctAnswers}/{session.totalQuestions}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-600 text-2xl mb-3" />
                <p className="text-sm text-gray-600 mb-1">错误题数</p>
                <p className="text-3xl font-bold text-gray-900">{session.wrongAnswers.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <FontAwesomeIcon icon={faClock} className="text-purple-600 text-2xl mb-3" />
                <p className="text-sm text-gray-600 mb-1">用时</p>
                <p className="text-3xl font-bold text-gray-900">
                  {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`}
                </p>
              </div>
            </div>
          </div>

          {/* 错题详情 */}
          {(currentWrongAnswers.length > 0 || session.wrongAnswers.length > 0) && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faTimes} className="mr-2 text-red-600" />
                错题详情 ({(currentWrongAnswers.length > 0 ? currentWrongAnswers : session.wrongAnswers).length} 题)
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(currentWrongAnswers.length > 0 ? currentWrongAnswers : session.wrongAnswers).map((phrase, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{phrase.english}</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-gray-700">{phrase.chinese}</span>
                        {phrase.level && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {phrase.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setIsStarted(false);
                setSession(null);
                setCurrentWrongAnswers([]);
                setRefreshKey(prev => prev + 1);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faRedo} className="mr-2" />
              再来一次
            </button>

            {(currentWrongAnswers.length > 0 || session.wrongAnswers.length > 0) && (
              <>
                <button
                  onClick={() => {
                    // 使用最新的错题列表
                    const wrongAnswersToUse = currentWrongAnswers.length > 0 ? currentWrongAnswers : session.wrongAnswers;
                    console.log('开始错题重做 - 使用的错题列表:', wrongAnswersToUse);
                    
                    // 直接开始错题重做模式
                    const wrongPhrasesSession: PhraseStudySession = {
                      mode: currentMode,
                      difficultyMode: 'custom',
                      totalQuestions: wrongAnswersToUse.length,
                      currentQuestion: 0,
                      correctAnswers: 0,
                      wrongAnswers: [],
                      startTime: new Date(),
                      questionRecords: [],
                    };
                    
                    // 设置错题为词组池
                    setPhrasePool(wrongAnswersToUse);
                    console.log('设置错题词组池:', wrongAnswersToUse);
                    setSession(wrongPhrasesSession);
                    setIsStarted(true);
                    // 传入错题列表，避免依赖异步状态更新
                    loadNextQuestion(wrongPhrasesSession, wrongAnswersToUse);
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  立即重做错题
                </button>
                
                <Link
                  href="/english/phrases/review"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faBook} className="mr-2" />
                  进入错题复习
                </Link>
              </>
            )}

            <Link
              href="/english"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              返回主页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 未开始学习时显示设置页面
  if (!isStarted || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/english" 
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600 text-xl" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isReviewMode ? '词组错题复习' : '词组背诵'}
                  </h1>
                  <p className="text-gray-600">
                    {isReviewMode 
                      ? `复习 ${phrasePool.length} 个错题词组` 
                      : '选择学习模式开始背诵词组'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isReviewMode && (
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    title="学习设置"
                  >
                    <FontAwesomeIcon icon={faCog} className="text-gray-600 text-xl" />
                  </button>
                )}
                <button
                  onClick={() => setShowLibrary(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="词组库"
                >
                  <FontAwesomeIcon icon={faBook} className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Settings Panel */}
          {showSettings && !isReviewMode && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">学习设置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    题目数量
                  </label>
                  <select 
                    value={questionCount === -1 ? -1 : questionCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setQuestionCount(value);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10 题</option>
                    <option value={20}>20 题</option>
                    <option value={50}>50 题</option>
                    <option value={100}>100 题</option>
                    <option value={-1}>全部词组</option>
                  </select>
                </div>
              </div>

              {/* 难度模式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  难度模式
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {phraseService.getDifficultyModes().map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setDifficultyMode(mode.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        difficultyMode === mode.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{mode.icon}</div>
                        <h4 className="font-bold text-sm mb-1">{mode.name}</h4>
                        <p className="text-xs text-gray-600">{mode.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 显示词组数量信息 */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">📚 词组库信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-bold text-blue-700">总计</div>
                    <div className="text-gray-600">{phraseService.getAllPhrases().length}</div>
                  </div>
                  {[
                    { mode: 'beginner', name: '初学者', range: '简单' },
                    { mode: 'expert', name: '进阶', range: '中等' },
                    { mode: 'hell', name: '高级', range: '困难' }
                  ].map(({ mode, name, range }) => {
                    const count = phraseService.getPhrasesByDifficultyMode(mode as DifficultyMode, 10000).length;
                    return (
                      <div key={mode} className={`text-center p-2 rounded border ${
                        difficultyMode === mode ? 'bg-blue-100 border-blue-300' : 'bg-white'
                      }`}>
                        <div className="font-bold text-blue-700">{name}模式</div>
                        <div className="text-gray-600">{count} 词组</div>
                        <div className="text-xs text-gray-500">{range}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {questionCount === -1 
                    ? `🎯 已选择：全部词组 (${phrasePool.length} 个)`
                    : `🎯 已选择：${Math.min(questionCount, phrasePool.length)} 个词组`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Mode Selection */}
          {!isReviewMode && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">选择学习模式</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setCurrentMode('chinese-to-english')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    currentMode === 'chinese-to-english'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2">中译英</h4>
                    <p className="text-sm text-gray-600">看中文选英文词组</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentMode('english-to-chinese')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    currentMode === 'english-to-chinese'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2">英译中</h4>
                    <p className="text-sm text-gray-600">看英文选中文词组</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentMode('mixed')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    currentMode === 'mixed'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2">混合模式</h4>
                    <p className="text-sm text-gray-600">随机切换模式</p>
                  </div>
                </button>
              </div>

              {/* 答题模式选择 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">答题模式</h4>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsInputMode(false)}
                    className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                      !isInputMode
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-center">
                      <h5 className="font-medium mb-1">选择模式</h5>
                      <p className="text-xs text-gray-600">从选项中选择答案</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setIsInputMode(true)}
                    className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                      isInputMode
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-center">
                      <h5 className="font-medium mb-1">输入模式</h5>
                      <p className="text-xs text-gray-600">手动输入答案</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startSession}
              disabled={phrasePool.length === 0}
              className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 ${
                phrasePool.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FontAwesomeIcon icon={faPlay} className="mr-3" />
              {phrasePool.length > 0 ? '开始学习' : '暂无可学习的词组'}
            </button>
            
            {phrasePool.length > 0 && (
              <p className="text-gray-600 mt-4">
                准备学习 {questionCount === -1 ? phrasePool.length : Math.min(questionCount, phrasePool.length)} 个词组
                {questionCount === -1 && (
                  <span className="text-blue-600 font-medium"> (全部词组)</span>
                )}
              </p>
            )}
          </div>
        </main>

        {/* Phrase Library Modal */}
        {showLibrary && (
          <PhraseLibrary onClose={() => setShowLibrary(false)} />
        )}
      </div>
    );
  }

  // 正在学习的界面
  if (!currentPhrase || !session) return null;

  const progress = ((session.currentQuestion + 1) / session.totalQuestions) * 100;
  const question = currentQuestionMode === 'chinese-to-english' ? currentPhrase.chinese : currentPhrase.english;
  const correctAnswer = currentQuestionMode === 'chinese-to-english' ? currentPhrase.english : currentPhrase.chinese;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Progress */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link 
                href="/english" 
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600 text-xl" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  题目 {session.currentQuestion + 1} / {session.totalQuestions}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentQuestionMode === 'chinese-to-english' ? '中译英' : '英译中'} • 
                  正确率: {session.currentQuestion > 0 ? ((session.correctAnswers / (session.correctAnswers + session.wrongAnswers.length)) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm text-gray-600">难度模式</p>
                <span className={`inline-block px-2 py-1 text-white text-xs font-medium rounded ${
                  phraseService.getDifficultyModeConfig(session.difficultyMode).color
                }`}>
                  {phraseService.getDifficultyModeConfig(session.difficultyMode).icon} {phraseService.getDifficultyModeConfig(session.difficultyMode).name}
                </span>
              </div>
              {currentPhrase.level && (
                <div>
                  <p className="text-sm text-gray-600">当前等级</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {currentPhrase.level}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100 text-center">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              {isInputMode 
                ? (currentQuestionMode === 'chinese-to-english' ? '请输入对应的英文词组' : '请输入对应的中文词组')
                : (currentQuestionMode === 'chinese-to-english' ? '请选择对应的英文词组' : '请选择对应的中文词组')
              }
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">{question}</h2>
            {currentPhrase.level && (
              <p className="text-gray-600">
                {currentPhrase.level}级词组
              </p>
            )}
          </div>

          {/* Input Mode */}
          {isInputMode ? (
            <div className="mb-6">
              <div className="max-w-md mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showResult) {
                      submitInputAnswer();
                    }
                  }}
                  disabled={showResult}
                  placeholder={currentQuestionMode === 'chinese-to-english' ? '输入英文词组' : '输入中文词组'}
                  className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-center"
                />
                {!showResult && (
                  <button
                    onClick={submitInputAnswer}
                    disabled={!inputAnswer.trim()}
                    className={`w-full mt-3 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      inputAnswer.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    提交答案
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Answer Options */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(option)}
                  disabled={showResult}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedAnswer === option
                      ? showResult
                        ? option === correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : showResult && option === correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  } ${showResult ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && (
                      <FontAwesomeIcon 
                        icon={option === correctAnswer ? faCheck : selectedAnswer === option ? faTimes : faCheck}
                        className={option === correctAnswer ? 'text-green-600' : selectedAnswer === option ? 'text-red-600' : 'text-green-600 opacity-0'}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-center mb-2">
                <FontAwesomeIcon 
                  icon={isCorrect ? faCheck : faTimes} 
                  className={`text-2xl mr-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                />
                <span className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '回答正确！' : '回答错误'}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-gray-700">
                  正确答案是: <strong>{correctAnswer}</strong>
                  {isInputMode && inputAnswer.trim() && (
                    <><br />你的答案: <span className="text-red-600">{inputAnswer.trim()}</span></>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={nextQuestion}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {session.currentQuestion + 1 >= session.totalQuestions ? '查看结果' : '下一题'}
              <span className="ml-2">→</span>
            </button>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="text-center text-sm text-gray-500">
          <p>💡 使用键盘操作: {isInputMode ? 'Enter 提交答案/下一题' : '↑↓ 选择答案, Enter 确认/下一题'}</p>
        </div>
      </main>

      {/* Phrase Library Modal */}
      {showLibrary && (
        <PhraseLibrary onClose={() => setShowLibrary(false)} />
      )}
    </div>
  );
}
