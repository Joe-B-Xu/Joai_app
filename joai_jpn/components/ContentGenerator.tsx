import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, BrainCircuit, BookOpen, AlertCircle, XCircle, HelpCircle, Check, ChevronRight } from 'lucide-react';
import { KnowledgePoint, GeneratedContent } from '../types';
import { generateStudyContent } from '../services/geminiService';

interface ContentGeneratorProps {
  items: KnowledgePoint[];
  mode: 'vocab' | 'grammar' | 'all';
  onFinish: () => void;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ items, mode, onFinish }) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'quiz' | 'result'>('loading');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const fetchContent = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await generateStudyContent(items, mode);
      if (result) {
        setContent(result);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    } catch (e) {
      console.error(e);
      setStatus('error'); 
    }
  }, [items, mode]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handlePlayAudio = () => {
    if (!content) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = content.body.replace(/<[^>]+>/g, ''); // strip html
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9; // Slightly slower for learners
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleQuizOptionClick = (optionIndex: number) => {
    if (!content) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuizIndex] = optionIndex;
    setUserAnswers(newAnswers);

    if (currentQuizIndex < content.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setStatus('result');
    }
  };

  const getModeLabel = () => {
    switch(mode) {
      case 'vocab': return '单词强化模式';
      case 'grammar': return '语法应用模式';
      case 'all': return '综合实战模式';
      default: return '学习模式';
    }
  };

  // --- RENDER: LOADING ---
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative w-24 h-24 mb-8">
           <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
           <BrainCircuit className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">正在生成 AI 故事...</h3>
        <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full mb-4">
           <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
           <span className="text-xs font-bold text-indigo-700">{getModeLabel()}</span>
        </div>
        <p className="text-slate-500 text-center max-w-md">
          {mode === 'vocab' && 'AI 正在尝试用最简单的句子串联这些单词。'}
          {mode === 'grammar' && 'AI 正在构建包含特定语法结构的场景。'}
          {mode === 'all' && 'AI 正在将单词与语法编织成一篇完整的短文。'}
        </p>
      </div>
    );
  }

  // --- RENDER: ERROR ---
  if (status === 'error' || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 animate-fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
           <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">生成失败</h3>
        <p className="text-slate-500 mb-6 max-w-xs mx-auto">AI 服务暂时不可用或网络连接出现问题。</p>
        <div className="flex space-x-4">
           <button 
             onClick={onFinish}
             className="px-6 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100 transition-colors"
           >
             返回
           </button>
           <button 
             onClick={() => fetchContent()}
             className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform hover:-translate-y-1 flex items-center space-x-2"
           >
             <RotateCcw size={18} />
             <span>重试</span>
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER: QUIZ MODE (Split Screen) ---
  if (status === 'quiz') {
    return (
      <div className="flex flex-col bg-slate-50 min-h-full">
        {/* TOP: Story Text Area (Natural Height) */}
        <div className="p-6 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold font-jp text-slate-800">{content.title}</h2>
               <button 
                  onClick={handlePlayAudio}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
            </div>
            <div 
               className="text-lg font-jp leading-loose text-slate-800"
               dangerouslySetInnerHTML={{__html: content.body}}
             />
          </div>
        </div>

        {/* BOTTOM: Question Area */}
        <div className="bg-slate-50 p-6 flex flex-col justify-center">
           <div className="max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    问题 {currentQuizIndex + 1} / {content.quiz.length}
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                    Reading Comprehension
                  </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-6 font-jp">
                 {content.quiz[currentQuizIndex].question}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                 {content.quiz[currentQuizIndex].options.map((option, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleQuizOptionClick(idx)}
                     className="text-left px-4 py-3 rounded-xl border border-white bg-white shadow-sm hover:border-indigo-500 hover:shadow-md hover:text-indigo-700 transition-all font-jp text-slate-600 text-sm md:text-base"
                   >
                     <span className="font-bold mr-2 opacity-50">{idx + 1}.</span>
                     {option}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: RESULT MODE (With Explanations) ---
  if (status === 'result') {
    const score = userAnswers.reduce((acc, ans, idx) => ans === content.quiz[idx].answer ? acc + 1 : acc, 0);
    const isPerfect = score === content.quiz.length;

    return (
      <div className="flex flex-col bg-slate-50 min-h-full">
         <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
              {/* Score Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center mb-6">
                 <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isPerfect ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isPerfect ? <CheckCircle size={40} /> : <BrainCircuit size={40} />}
                 </div>
                 <h2 className="text-3xl font-bold text-slate-800 mb-1">
                    得分: {score} / {content.quiz.length}
                 </h2>
                 <p className="text-slate-500 text-sm">
                   {isPerfect ? "太棒了！你完全理解了文章。" : "做得不错，来看看错题解析吧。"}
                 </p>
              </div>

              {/* Questions Review */}
              <div className="space-y-4 mb-8">
                {content.quiz.map((q, idx) => {
                  const isCorrect = userAnswers[idx] === q.answer;
                  return (
                    <div key={idx} className={`bg-white rounded-xl border overflow-hidden transition-all ${isCorrect ? 'border-slate-200' : 'border-red-200 shadow-sm'}`}>
                       {/* Question Header */}
                       <div className="p-4 flex items-start gap-3">
                          <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                             {isCorrect ? <Check size={14} /> : <XCircle size={14} />}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-slate-800 text-sm md:text-base mb-2 font-jp">{q.question}</h4>
                             
                             {/* Choices Display */}
                             <div className="space-y-1 mb-3">
                                {q.options.map((opt, optIdx) => {
                                  let itemClass = "text-xs md:text-sm px-3 py-2 rounded border ";
                                  if (optIdx === q.answer) {
                                     itemClass += "bg-green-50 border-green-200 text-green-700 font-medium"; // Correct Answer
                                  } else if (optIdx === userAnswers[idx] && !isCorrect) {
                                     itemClass += "bg-red-50 border-red-200 text-red-700"; // User's Wrong Answer
                                  } else {
                                     itemClass += "bg-slate-50 border-transparent text-slate-400"; // Others
                                  }
                                  return (
                                    <div key={optIdx} className={itemClass}>
                                      {opt}
                                      {optIdx === q.answer && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider">[正确]</span>}
                                    </div>
                                  )
                                })}
                             </div>

                             {/* Explanation Section (Targeted) */}
                             {!isCorrect && (
                               <div className="bg-amber-50 rounded-lg p-3 flex gap-3 items-start animate-fade-in mt-2">
                                  <HelpCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-xs font-bold text-amber-600 block mb-1">解析 (Explanation)</span>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                      {q.explanation || "AI 未提供详细解析，请参考原文理解。"}
                                    </p>
                                  </div>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-center gap-4">
             <button 
               className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
               onClick={onFinish}
             >
               完成并退出
             </button>
             <button 
               onClick={() => {
                 setStatus('ready'); // Go back to reading mode
                 setCurrentQuizIndex(0); // Reset quiz
                 setUserAnswers([]);
               }}
               className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 flex items-center"
             >
               <BookOpen size={18} className="mr-2" />
               重读原文
             </button>
         </div>
      </div>
    );
  }

  // --- RENDER: READY (READING MODE) ---
  return (
    <div className="max-w-3xl mx-auto flex flex-col animate-fade-in pb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:min-h-[600px]">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                 <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium backdrop-blur-sm border border-white/10">
                   {getModeLabel()}
                 </span>
                 <span className="text-indigo-200 text-xs">AI Generated</span>
              </div>
              <h2 className="text-2xl font-bold font-jp mb-1">{content.title}</h2>
            </div>
            <button 
              onClick={handlePlayAudio}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 md:p-8">
             <div 
               className="text-lg md:text-xl font-jp leading-loose text-slate-800 space-y-4"
               dangerouslySetInnerHTML={{__html: content.body}}
             />

             <div className="mt-8 border-t border-slate-100 pt-6">
                <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 text-sm font-medium"
                >
                  <BookOpen size={16} />
                  <span>{showTranslation ? '隐藏翻译' : '查看翻译'}</span>
                </button>
                
                {showTranslation && (
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl animate-fade-in">
                    {content.translation}
                  </p>
                )}
             </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <button 
              onClick={() => setStatus('quiz')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span>开始测验</span>
              <BrainCircuit size={18} />
            </button>
          </div>
        </div>
    </div>
  );
};