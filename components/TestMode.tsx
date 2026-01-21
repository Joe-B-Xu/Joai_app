
import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, BookOpen, BarChart3, Target, Zap, Play } from 'lucide-react';
import { TestConfig, TestQuestion, TestResult, JLPTLevel } from '../types';
import { generateTestQuestions } from '../services/geminiService';

interface TestModeProps {
  initialLevel: JLPTLevel;
  onComplete: (result: TestResult) => void;
  onExit: () => void;
}

export const TestMode: React.FC<TestModeProps> = ({ initialLevel, onComplete, onExit }) => {
  // Phases: 'setup' -> 'loading' -> 'running' -> 'analysis'
  const [phase, setPhase] = useState<'setup' | 'loading' | 'running' | 'analysis'>('setup');
  
  // Setup State
  const [config, setConfig] = useState<TestConfig>({
    target: 'JLPT',
    level: initialLevel,
    type: 'mixed',
    durationMinutes: 10,
    questionCount: 10
  });

  // Test State
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis State
  const [result, setResult] = useState<TestResult | null>(null);

  // --- SETUP PHASE HANDLERS ---
  const handleStart = async () => {
    setPhase('loading');
    const qs = await generateTestQuestions(config);
    setQuestions(qs);
    setTimeLeft(config.durationMinutes * 60);
    setPhase('running');
  };

  // --- RUNNER PHASE HANDLERS ---
  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest(); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleSelectOption = (idx: number) => {
    const qId = questions[currentQuestionIndex].id;
    setUserAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate Results
    const correctIds: string[] = [];
    const wrongIds: string[] = [];
    let score = 0;

    questions.forEach(q => {
      const uAns = userAnswers[q.id];
      if (uAns === q.correctIndex) {
        score++;
        correctIds.push(q.id);
      } else {
        wrongIds.push(q.id);
      }
    });

    const testResult: TestResult = {
      score,
      total: questions.length,
      timeSpentSeconds: (config.durationMinutes * 60) - timeLeft,
      correctIds,
      wrongIds,
      questions,
      userAnswers
    };

    setResult(testResult);
    setPhase('analysis');
    onComplete(testResult); // Notify App to update global stats
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDERERS ---

  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto h-full flex flex-col justify-center animate-fade-in p-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">综合冲刺测试</h2>
          <p className="text-slate-500">自定义你的测试环境，进行针对性训练</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
           {/* Target Selection */}
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">考试目标</label>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setConfig({...config, target: 'JLPT'})}
                   className={`p-4 rounded-xl border-2 font-bold text-center transition-all ${config.target === 'JLPT' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}`}
                 >
                    JLPT {config.level}
                 </button>
                 <button 
                   onClick={() => setConfig({...config, target: 'EJU'})}
                   className={`p-4 rounded-xl border-2 font-bold text-center transition-all ${config.target === 'EJU' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}`}
                 >
                    EJU 留考
                 </button>
              </div>
           </div>

           {/* Type Selection */}
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">题型偏好</label>
              <div className="flex space-x-2">
                 {['mixed', 'vocab', 'grammar'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setConfig({...config, type: t as any})}
                      className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${config.type === t ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                       {t === 'mixed' ? '混合综合' : t === 'vocab' ? '只考词汇' : '只考语法'}
                    </button>
                 ))}
              </div>
           </div>

           {/* Duration */}
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">考试长度</label>
              <div className="grid grid-cols-3 gap-3">
                 {[5, 10, 20].map((min) => (
                    <button 
                      key={min}
                      onClick={() => setConfig({...config, durationMinutes: min, questionCount: min === 5 ? 5 : min === 10 ? 10 : 15})}
                      className={`py-3 rounded-xl border font-bold transition-all ${config.durationMinutes === min ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'border-slate-100 text-slate-400'}`}
                    >
                       {min} 分钟
                    </button>
                 ))}
              </div>
           </div>
           
           <button 
             onClick={handleStart}
             className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
           >
              <span>开始测试</span>
              <ArrowRight size={20} />
           </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center">
         <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
         <p className="text-slate-500 font-medium">正在生成真题模拟卷...</p>
      </div>
    );
  }

  if (phase === 'running') {
     const q = questions[currentQuestionIndex];
     const answeredCount = Object.keys(userAnswers).length;
     const progress = ((answeredCount) / questions.length) * 100;

     return (
       <div className="h-full flex flex-col bg-slate-50">
          {/* Top Bar */}
          <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
             <div className="flex items-center space-x-2 text-slate-600 font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg">
                <Clock size={16} />
                <span className={timeLeft < 60 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
             </div>
             <div className="flex-1 mx-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
             </div>
             <button onClick={handleSubmitTest} className="text-xs font-bold text-slate-400 hover:text-indigo-600">交卷</button>
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
             <div className="max-w-2xl w-full">
                <div className="flex items-center justify-between mb-6">
                   <span className="text-slate-400 font-bold text-sm">Question {currentQuestionIndex + 1} / {questions.length}</span>
                   <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-bold uppercase">{q.type.replace('_', ' ')}</span>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6 min-h-[200px] flex items-center justify-center">
                   <h3 className="text-2xl font-bold font-jp text-slate-800 leading-loose text-center">
                      {q.questionText.split('______').map((part, i, arr) => (
                        <React.Fragment key={i}>
                           {part}
                           {i < arr.length - 1 && (
                             <span className="inline-block border-b-2 border-indigo-500 min-w-[60px] mx-1 text-indigo-600 px-2 text-center">
                                {userAnswers[q.id] !== undefined ? q.options[userAnswers[q.id]] : ''}
                             </span>
                           )}
                        </React.Fragment>
                      ))}
                   </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-4 rounded-xl border-2 text-left transition-all relative font-jp text-lg
                          ${userAnswers[q.id] === idx 
                             ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold' 
                             : 'border-white bg-white hover:border-slate-200 text-slate-600 shadow-sm'
                          }
                        `}
                      >
                         <span className={`absolute top-4 left-4 text-xs font-bold ${userAnswers[q.id] === idx ? 'text-indigo-400' : 'text-slate-300'}`}>
                            {String.fromCharCode(65 + idx)}
                         </span>
                         <span className="pl-6 block">{opt}</span>
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Navigation */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-between">
             <button 
               onClick={handlePrev} 
               disabled={currentQuestionIndex === 0}
               className="px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50"
             >
                上一题
             </button>
             {currentQuestionIndex === questions.length - 1 ? (
                <button 
                  onClick={handleSubmitTest}
                  className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700"
                >
                   提交试卷
                </button>
             ) : (
                <button 
                   onClick={handleNext}
                   className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700"
                >
                   下一题
                </button>
             )}
          </div>
       </div>
     );
  }

  if (phase === 'analysis' && result) {
     const percentage = Math.round((result.score / result.total) * 100);
     const isPass = percentage >= 60; // Simple pass logic

     return (
       <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
          {/* Header */}
          <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
             <h2 className="text-xl font-bold text-slate-800">测试报告</h2>
             <button onClick={onExit} className="text-slate-400 hover:text-slate-600 font-medium">关闭</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
             <div className="max-w-3xl mx-auto space-y-6">
                {/* Score Card */}
                <div className={`rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg
                   ${isPass ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}
                `}>
                   <div className="mb-4 md:mb-0 text-center md:text-left">
                      <h3 className="text-lg opacity-90 font-medium mb-1">本次得分</h3>
                      <div className="text-5xl font-bold mb-2">{percentage}<span className="text-2xl opacity-60">/100</span></div>
                      <p className="opacity-80 text-sm">{isPass ? '合格！相当于N2水平略上' : '未合格，建议加强基础'}</p>
                   </div>
                   <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm w-full md:w-auto">
                      <div className="flex items-center space-x-4 mb-2">
                         <BarChart3 size={20} />
                         <span className="font-bold">用时: {formatTime(result.timeSpentSeconds)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                         <AlertTriangle size={20} />
                         <span className="font-bold">错题: {result.wrongIds.length} 道</span>
                      </div>
                   </div>
                </div>

                {/* Weakness Analysis / Recommendation */}
                {result.wrongIds.length > 0 && (
                   <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4">
                         <Zap className="text-amber-500" />
                         <h3 className="font-bold text-slate-800">重点加强建议</h3>
                      </div>
                      <div className="space-y-3">
                         <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
                            建议回顾 <b>“{result.questions.find(q => q.id === result.wrongIds[0])?.relatedConcept || '语法基础'}”</b> 的用法。
                         </div>
                         <p className="text-slate-500 text-sm">
                            系统已将错题知识点加入复习队列。在“复习模式”中将优先出现相关句型。
                         </p>
                      </div>
                   </div>
                )}

                {/* Question Review List */}
                <div className="space-y-4">
                   <h3 className="font-bold text-slate-800 px-2">错题解析 ({result.wrongIds.length})</h3>
                   {result.questions.map((q, idx) => {
                      const isCorrect = result.correctIds.includes(q.id);
                      if (isCorrect && result.wrongIds.length > 0) return null; // Only show wrongs if there are wrongs. Or show all? Let's show wrongs first.
                      if (isCorrect) return null; // Only show wrongs for clarity in this view

                      return (
                         <div key={q.id} className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
                            <div className="flex items-start mb-4">
                               <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold mr-3 mt-1">Wrong</span>
                               <h4 className="text-lg font-jp font-bold text-slate-800">{q.questionText}</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                               <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                  <span className="text-xs text-red-400 block mb-1">你的选择</span>
                                  <span className="font-bold text-red-700">{q.options[result.userAnswers[q.id]] || '未作答'}</span>
                               </div>
                               <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                  <span className="text-xs text-green-400 block mb-1">正确答案</span>
                                  <span className="font-bold text-green-700">{q.options[q.correctIndex]}</span>
                               </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed">
                               <span className="font-bold text-indigo-600 mr-2">解析:</span>
                               {q.explanation}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
       </div>
     );
  }

  return null;
};
