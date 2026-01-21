
import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckCircle, ChevronRight, XCircle, HelpCircle, BookOpen, BrainCircuit, AlertTriangle, ArrowRight, Target, RotateCcw, Check, X } from 'lucide-react';
import { Sentence, KnowledgePoint } from '../types';
import { DICTIONARY } from '../constants';
import { KnowledgeCard } from './KnowledgeCard';

interface SentenceLearningProps {
  sentences: Sentence[];
  onComplete: (results: any) => void;
}

type Phase = 'preview' | 'study' | 'quiz' | 'summary';

export const SentenceLearning: React.FC<SentenceLearningProps> = ({ sentences, onComplete }) => {
  const [phase, setPhase] = useState<Phase>('preview');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Audio State Ref
  const wasPlayingRef = useRef(false);

  // Interaction State
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [completedItemsInSentence, setCompletedItemsInSentence] = useState<Set<number>>(new Set());
  
  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{correct: number, total: number}>({correct: 0, total: 0});
  const [quizExplanation, setQuizExplanation] = useState<string | null>(null);
  
  // Tracking for Summary
  const [weaknessIds, setWeaknessIds] = useState<Set<number>>(new Set());

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    // Reset per-sentence state when index changes
    window.speechSynthesis.cancel();
    wasPlayingRef.current = false;
    setActiveItemId(null);
    setCompletedItemsInSentence(new Set());
    setQuizAnswer(null);
    setIsQuizSubmitted(false);
    setQuizExplanation(null);
  }, [currentIndex]);

  // Cleanup
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // --- LOGIC: PREVIEW PHASE ---
  const allBatchItems = Array.from(new Set(sentences.flatMap(s => s.targetIds)))
    .map((id: number) => DICTIONARY[id])
    .filter(Boolean);

  const startBatch = () => {
    setPhase('study');
  };

  // --- LOGIC: STUDY PHASE ---
  const handleItemClick = (id: number) => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      wasPlayingRef.current = true;
    }
    setActiveItemId(id);
  };

  const closePopup = () => {
    setActiveItemId(null);
    if (wasPlayingRef.current) {
      window.speechSynthesis.resume();
      wasPlayingRef.current = false;
    }
  };

  const handleRateItem = (id: number, rating: string) => {
    setCompletedItemsInSentence(prev => new Set(prev).add(id));
    if (rating === 'unfamiliar') {
      setWeaknessIds(prev => new Set(prev).add(id));
    }
    closePopup();
  };

  const playSentenceAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentSentence.original);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const goToQuiz = () => {
    window.speechSynthesis.cancel();
    setPhase('quiz');
  };

  // --- LOGIC: QUIZ PHASE ---
  // Simple deterministic quiz generation based on the sentence
  const generateQuiz = () => {
    const targetId = currentSentence.targetIds[0];
    const targetItem = DICTIONARY[targetId];
    
    // Type 1: Meaning match
    const correctAnswer = currentSentence.translation;
    const distractors = [
       "这只猫非常可爱，每天都在睡觉。",
       "为了提高效率，必须严格遵守规则。", 
       "如果不提交报告，成绩会受到影响。"
    ].filter(d => d !== correctAnswer).slice(0, 3);
    
    // Shuffle
    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAnswer);
    
    return {
      question: "请选择该句子的正确含义：",
      options,
      correctIndex,
      // Mock explanation (In real app, this comes from data/AI)
      explanation: `正确翻译是：“${correctAnswer}”。\n此句重点考察“${targetItem?.type === 'vocab' ? (targetItem as any).surface_jp : (targetItem as any).form_jp}”的含义与上下文搭配。`
    };
  };
  
  // Memoize quiz so it doesn't reshuffle on render
  const currentQuiz = useRef(generateQuiz());
  useEffect(() => {
      if (phase === 'quiz') {
          currentQuiz.current = generateQuiz();
      }
  }, [currentIndex, phase]);

  const handleQuizSubmit = (selectedIdx: number) => {
    setQuizAnswer(selectedIdx);
    setIsQuizSubmitted(true);
    
    const isCorrect = selectedIdx === currentQuiz.current.correctIndex;
    
    if (isCorrect) {
       setQuizScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
       setQuizExplanation(null);
    } else {
       setQuizScore(prev => ({ ...prev, total: prev.total + 1 }));
       setQuizExplanation(currentQuiz.current.explanation);
       // Mark all targets in this sentence as weak if comprehension failed
       currentSentence.targetIds.forEach(id => setWeaknessIds(prev => new Set(prev).add(id)));
    }
  };

  const nextSentenceOrSummary = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPhase('study');
    } else {
      setPhase('summary');
    }
  };

  // --- RENDERERS ---

  if (phase === 'preview') {
    return (
      <div className="h-full flex flex-col animate-fade-in bg-slate-50">
         <div className="p-6 bg-white border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">本次预习 (Preview)</h2>
            <p className="text-slate-500">在进入句卡训练前，请先熟悉以下核心知识点。</p>
         </div>
         <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {allBatchItems.map(item => (
               <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${item.type === 'vocab' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                     {item.level}
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-slate-800 font-jp">
                       {item.type === 'vocab' ? (item as any).surface_jp : (item as any).form_jp}
                     </h3>
                     <p className="text-sm text-slate-500">{item.meaning_zh}</p>
                     <p className="text-xs text-slate-400 mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded">
                       {item.type === 'vocab' ? (item as any).reading : (item as any).pattern_jp}
                     </p>
                  </div>
               </div>
            ))}
         </div>
         <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <button 
              onClick={startBatch}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
               <span>开始句卡特训</span>
               <ArrowRight size={20} />
            </button>
         </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="h-full flex flex-col animate-fade-in bg-white p-6 md:p-10 justify-center items-center">
         <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Target size={40} />
         </div>
         <h2 className="text-3xl font-bold text-slate-800 mb-2">训练完成</h2>
         <p className="text-slate-500 mb-8">本次理解度检查结果</p>
         
         <div className="grid grid-cols-2 gap-6 w-full max-w-lg mb-8">
            <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-100">
               <div className="text-3xl font-bold text-green-600 mb-1">{quizScore.correct}</div>
               <div className="text-xs text-green-800 font-bold uppercase">正确回答</div>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
               <div className="text-3xl font-bold text-red-500 mb-1">{weaknessIds.size}</div>
               <div className="text-xs text-red-800 font-bold uppercase">待加强点</div>
            </div>
         </div>

         {weaknessIds.size > 0 && (
            <div className="w-full max-w-lg bg-slate-50 rounded-2xl p-4 mb-8">
               <h4 className="font-bold text-slate-700 mb-3 flex items-center">
                  <AlertTriangle size={16} className="mr-2 text-amber-500" />
                  薄弱环节 (Shortcomings)
               </h4>
               <div className="space-y-2">
                  {Array.from(weaknessIds).map((id: number) => {
                     const item = DICTIONARY[id];
                     if(!item) return null;
                     return (
                        <div key={id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                           <span className="font-bold text-slate-800 font-jp">
                              {item.type === 'vocab' ? (item as any).surface_jp : (item as any).form_jp}
                           </span>
                           <span className="text-sm text-slate-500">{item.meaning_zh}</span>
                        </div>
                     )
                  })}
               </div>
            </div>
         )}

         <button 
           onClick={() => onComplete({})}
           className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700"
         >
            完成并退出
         </button>
      </div>
    );
  }

  // --- RENDER: STUDY & QUIZ PHASES (Main Loop) ---
  
  const activeKnowledgePoint = activeItemId ? DICTIONARY[activeItemId] : null;
  const isCorrect = isQuizSubmitted && quizAnswer === currentQuiz.current.correctIndex;

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
       {/* Top Bar */}
       <div className="flex items-center justify-between mb-2 px-4 pt-4 shrink-0">
          <div className="flex items-center space-x-2">
             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase text-white ${currentSentence.scenario === 'academic' ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                {currentSentence.scenario === 'academic' ? '课业' : '生活'}
             </span>
             <span className="text-xs text-slate-400 font-bold">Scene {currentIndex + 1} / {sentences.length}</span>
          </div>
          {phase === 'quiz' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">理解度检查</span>}
       </div>

       {/* CARD CONTAINER */}
       <div className="flex-1 p-4 md:p-6 flex flex-col max-w-3xl mx-auto w-full">
          
          {phase === 'study' ? (
             // --- STUDY VIEW ---
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 flex flex-col items-center justify-center min-h-[300px] mb-4 relative overflow-hidden flex-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-50"></div>
                
                <div className="text-center w-full max-w-2xl">
                   <p className="text-2xl md:text-3xl font-jp font-bold text-slate-800 leading-loose">
                      {currentSentence.segments.map((seg, idx) => {
                         if (seg.linkedItemId) {
                            const isCompleted = completedItemsInSentence.has(seg.linkedItemId);
                            const isVocab = seg.type === 'vocab';
                            const isActive = activeItemId === seg.linkedItemId;
                            return (
                              <span 
                                key={idx}
                                onClick={() => handleItemClick(seg.linkedItemId!)}
                                className={`
                                  relative inline-block cursor-pointer px-1 rounded transition-all mx-0.5
                                  ${isActive ? 'bg-slate-800 text-white shadow-lg scale-105 z-10' : ''}
                                  ${!isActive && isVocab ? 'text-indigo-600 border-b-2 border-indigo-200 hover:bg-indigo-50' : ''}
                                  ${!isActive && !isVocab ? 'text-emerald-600 border-b-2 border-emerald-200 hover:bg-emerald-50' : ''}
                                  ${isCompleted && !isActive ? 'opacity-50 decoration-slice' : ''}
                                `}
                              >
                                 {seg.text}
                                 {isCompleted && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>}
                              </span>
                            );
                         }
                         return <span key={idx}>{seg.text}</span>;
                      })}
                   </p>

                   {/* Audio & Interaction */}
                   <button 
                     onClick={playSentenceAudio}
                     className="mt-8 p-4 bg-indigo-50 rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                   >
                      <PlayCircle size={32} />
                   </button>
                   
                   <p className="mt-4 text-sm text-slate-400">点击高亮部分查看释义</p>
                </div>
             </div>
          ) : (
             // --- QUIZ VIEW ---
             <div className="bg-white rounded-3xl shadow-lg border border-indigo-100 p-6 md:p-10 flex flex-col justify-center min-h-[300px] mb-4 relative overflow-hidden flex-1 animate-fade-in">
                 <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                       <BrainCircuit size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">理解度チェック</h3>
                    <p className="text-lg font-jp font-bold text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                       {currentSentence.original}
                    </p>
                    <p className="text-sm text-slate-500 font-bold mb-4">{currentQuiz.current.question}</p>
                 </div>

                 {isQuizSubmitted ? (
                    // --- RESULT / ANALYSIS VIEW ---
                    <div className="w-full max-w-xl mx-auto animate-fade-in">
                       {/* Status Banner */}
                       <div className={`p-4 rounded-xl mb-4 flex items-center space-x-3 ${isCorrect ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                           {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                           <div>
                              <h4 className="font-bold text-lg">{isCorrect ? '正解 (Correct)' : '不正解 (Incorrect)'}</h4>
                           </div>
                       </div>

                       {/* Incorrect Answer Analysis */}
                       {!isCorrect && quizExplanation && (
                          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 mb-6">
                              <div className="flex items-center space-x-2 mb-2">
                                 <HelpCircle size={18} />
                                 <span className="font-bold text-sm uppercase tracking-wider">错误解析 (Analysis)</span>
                              </div>
                              <p className="text-sm leading-relaxed">{quizExplanation}</p>
                          </div>
                       )}

                       <button 
                           onClick={nextSentenceOrSummary}
                           className="w-full bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                        >
                           <span>{currentIndex < sentences.length - 1 ? '进入下一句 (Next)' : '查看总结 (Finish)'}</span>
                           <ChevronRight size={20} />
                        </button>
                    </div>
                 ) : (
                    // --- OPTIONS VIEW ---
                    <div className="space-y-3 w-full max-w-xl mx-auto">
                        {currentQuiz.current.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuizSubmit(idx)}
                            className="w-full p-4 rounded-xl border-2 text-left transition-all border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:shadow-md"
                          >
                             {opt}
                          </button>
                        ))}
                    </div>
                 )}
             </div>
          )}

          {/* Action Area (Bottom) - Only for Study Phase now, Quiz handles its own button */}
          <div className="shrink-0 min-h-[80px]">
             {/* Popup Handling for Study Mode */}
             {activeItemId && activeKnowledgePoint && phase === 'study' && (
                <div className="absolute inset-x-4 bottom-4 top-20 z-20 animate-slide-up-fade">
                   <div className="h-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-4 relative flex flex-col">
                      <button onClick={closePopup} className="absolute top-2 right-2 p-2 text-slate-300 hover:text-slate-500 z-30"><XCircle size={24} /></button>
                      <KnowledgeCard 
                         data={activeKnowledgePoint} 
                         mode="mini" 
                         interactive={true}
                         onRate={(rating) => handleRateItem(activeItemId, rating)}
                         selectedRating={completedItemsInSentence.has(activeItemId) ? 'familiar' : null}
                      />
                   </div>
                </div>
             )}

             {/* Navigation Buttons */}
             {!activeItemId && phase === 'study' && (
                <div className="flex justify-center">
                   <button 
                     onClick={goToQuiz}
                     className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-all flex items-center space-x-2"
                   >
                      <CheckCircle size={20} />
                      <span>理解度检查</span>
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
