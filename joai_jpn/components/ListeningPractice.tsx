
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, BrainCircuit, Mic, Headphones, ChevronRight, BarChart3, List, Layers, Eye, EyeOff, PlusCircle, Check } from 'lucide-react';
import { ListeningCategory, ListeningExercise } from '../types';
import { LISTENING_CATEGORIES, LISTENING_EXERCISES, DICTIONARY } from '../constants';
import { KnowledgeCard } from './KnowledgeCard';

interface ListeningPracticeProps {
  onExit: () => void;
  onAddToNotebook: (id: number) => void;
}

export const ListeningPractice: React.FC<ListeningPracticeProps> = ({ onExit, onAddToNotebook }) => {
  const [view, setView] = useState<'dashboard' | 'exercise'>('dashboard');
  const [activeExercise, setActiveExercise] = useState<ListeningExercise | null>(null);

  // --- DASHBOARD VIEW ---
  const Dashboard = () => {
    // Group categories
    const typeCats = LISTENING_CATEGORIES.filter(c => c.type === 'question_type');
    const topicCats = LISTENING_CATEGORIES.filter(c => c.type === 'topic');

    // Simple AI Logic for suggestion
    const weakCategory = [...LISTENING_CATEGORIES].sort((a, b) => a.accuracy - b.accuracy)[0];

    return (
      <div className="flex flex-col lg:flex-row h-full gap-6 p-4 animate-fade-in">
         {/* LEFT: Categories */}
         <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            <div className="flex items-center space-x-2 mb-2">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Headphones size={20} /></div>
               <h2 className="text-xl font-bold text-slate-800">EJU 听力特训</h2>
            </div>
            
            {/* Type Categories */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">按题型 (Question Types)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {typeCats.map(cat => (
                     <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group cursor-pointer hover:border-indigo-200" onClick={() => {
                        const ex = LISTENING_EXERCISES.find(e => e.categoryIds.includes(cat.id));
                        if(ex) { setActiveExercise(ex); setView('exercise'); }
                     }}>
                        <div>
                           <div className="font-bold text-slate-700">{cat.name}</div>
                           <div className="text-xs text-slate-400 mt-1">{cat.count} 题 · 正确率 {cat.accuracy}%</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                           <Play size={16} fill="currentColor" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Topic Categories */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">按话题 (High-Freq Topics)</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {topicCats.map(cat => (
                     <div key={cat.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-all cursor-pointer" onClick={() => {
                         const ex = LISTENING_EXERCISES.find(e => e.categoryIds.includes(cat.id));
                         if(ex) { setActiveExercise(ex); setView('exercise'); }
                     }}>
                        <div className={`w-8 h-8 mx-auto rounded-full mb-2 ${cat.color} bg-opacity-10 text-${cat.color.split('-')[1]}-500 flex items-center justify-center`}>
                           <BarChart3 size={16} />
                        </div>
                        <div className="font-bold text-slate-700 text-sm mb-1">{cat.name}</div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className={`h-full ${cat.color}`} style={{width: `${cat.accuracy}%`}}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* RIGHT: AI Assistant */}
         <div className="lg:w-80 shrink-0">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <BrainCircuit className="absolute top-4 right-4 text-white opacity-20 w-24 h-24" />
               <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4">
                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Mic size={16} />
                     </div>
                     <span className="font-bold text-sm tracking-wide opacity-90">AI Learning Coach</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">今日建议</h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-6">
                     我注意到你在 <b>{weakCategory.name}</b> 话题的正确率较低 ({weakCategory.accuracy}%)。
                     建议今天集中练习该类词汇的听辨。
                  </p>
                  <button 
                     onClick={() => {
                        const ex = LISTENING_EXERCISES.find(e => e.categoryIds.includes(weakCategory.id));
                        if(ex) { setActiveExercise(ex); setView('exercise'); }
                     }}
                     className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors"
                  >
                     开始针对训练
                  </button>
               </div>
            </div>

            {/* Recent History Mock */}
            <div className="mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">最近练习</h4>
               <div className="space-y-3">
                  {[1,2].map(i => (
                     <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 truncate max-w-[150px]">大学の授業登録について...</span>
                        <span className="text-green-500 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">80%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    );
  };

  // --- EXERCISE VIEW ---
  const ExerciseRunner = ({ data }: { data: ListeningExercise }) => {
     const [stage, setStage] = useState<'listen' | 'dictation' | 'analysis'>('listen');
     const [isPlaying, setIsPlaying] = useState(false);
     
     // Dictation State
     const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4>(1); // L1-L4
     
     // Playback
     const handlePlay = () => {
        window.speechSynthesis.cancel();
        if (isPlaying) {
           setIsPlaying(false);
           return;
        }
        const u = new SpeechSynthesisUtterance(data.audioText);
        u.lang = 'ja-JP';
        u.rate = 0.9;
        u.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(u);
        setIsPlaying(true);
     };

     useEffect(() => {
        return () => window.speechSynthesis.cancel();
     }, []);

     // --- STAGE 1: COMPREHENSION ---
     const StageOne = () => {
        const [selected, setSelected] = useState<number | null>(null);
        const [isSubmitted, setIsSubmitted] = useState(false);

        return (
           <div className="animate-fade-in flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 animate-pulse-slow">
                    <Headphones size={40} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Stage 1: 语义理解</h3>
                 <p className="text-slate-500 mb-8 max-w-sm">请听录音，并选择最能概括核心内容的选项。</p>
                 
                 <button 
                   onClick={handlePlay}
                   className={`px-8 py-3 rounded-full font-bold flex items-center space-x-2 transition-all ${isPlaying ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-lg hover:scale-105'}`}
                 >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    <span>{isPlaying ? '暂停音频' : '播放音频'}</span>
                 </button>
              </div>

              <div className="bg-white p-6 rounded-t-3xl shadow-up border-t border-slate-100">
                 <h4 className="font-bold text-slate-700 mb-4">{data.summaryQuestion.question}</h4>
                 <div className="space-y-3">
                    {data.summaryQuestion.options.map((opt, idx) => {
                       let stateClass = "border-slate-200 bg-white hover:border-indigo-300";
                       if (isSubmitted) {
                          if (idx === data.summaryQuestion.correctIndex) stateClass = "border-green-500 bg-green-50 text-green-700";
                          else if (idx === selected) stateClass = "border-red-500 bg-red-50 text-red-700";
                          else stateClass = "opacity-50";
                       } else if (idx === selected) {
                          stateClass = "border-indigo-500 bg-indigo-50 text-indigo-700";
                       }

                       return (
                          <button 
                            key={idx}
                            disabled={isSubmitted}
                            onClick={() => setSelected(idx)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${stateClass}`}
                          >
                             {opt}
                          </button>
                       );
                    })}
                 </div>
                 
                 {!isSubmitted && selected !== null && (
                    <button onClick={() => setIsSubmitted(true)} className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-bold">提交答案</button>
                 )}
                 {isSubmitted && (
                    <button onClick={() => setStage('dictation')} className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center">
                       <span>进入精听训练</span>
                       <ChevronRight size={16} className="ml-1" />
                    </button>
                 )}
              </div>
           </div>
        );
     };

     // --- STAGE 2: DICTATION (CLOZE) ---
     const StageTwo = () => {
        // Toggle visibility of blanks based on difficulty
        const getMaskedText = (line: any) => {
           const parts: React.ReactNode[] = [];
           // Simple heuristic split for demo: Split by punctuation or space is hard in JP
           // We will use the 'keywords' field in data to simulate L1 mask.
           // For L4, we mask whole string.
           
           if (difficulty === 4) {
              return (
                 <div className="w-full">
                    <input type="text" placeholder="听写整句..." className="w-full p-2 border-b-2 border-slate-200 focus:border-indigo-500 outline-none bg-transparent" />
                 </div>
              );
           }

           // For L1-L3 simulation, we just highlight or mask keywords
           // Since we don't have full NLP segmentation in browser, we mock it:
           // L1: Mask keywords.
           // L2: Mask keywords + first 2 chars (mock particles)
           
           let remainingText = line.text;
           // Find keywords and mask them
           const keywords = line.keywords.map((kid:number) => {
               const k = DICTIONARY[kid];
               return k.type === 'vocab' ? (k as any).surface_jp : (k as any).form_jp;
           });

           // Very naive replacement for demo visualization
           keywords.forEach((kw: string) => {
              remainingText = remainingText.replace(kw, `___${kw}___`);
           });

           const segments = remainingText.split('___');
           return (
              <p className="text-lg leading-loose">
                 {segments.map((seg: string, i: number) => {
                    if (keywords.includes(seg)) {
                       // This is a masked word
                       return (
                          <span key={i} className="inline-block border-b-2 border-indigo-400 text-transparent min-w-[3rem] text-center select-none relative group cursor-pointer">
                             {seg}
                             <span className="absolute inset-0 flex items-center justify-center text-xs text-indigo-400 opacity-0 group-hover:opacity-100 font-bold bg-white/90">
                                点击显示
                             </span>
                          </span>
                       );
                    }
                    return <span key={i}>{seg}</span>;
                 })}
              </p>
           );
        };

        return (
           <div className="flex flex-col h-full animate-fade-in bg-slate-50">
              {/* Header Control */}
              <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                 <div className="flex items-center space-x-2">
                    <button onClick={handlePlay} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100">
                       {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <span className="text-sm font-bold text-slate-500">Stage 2: 精听填空</span>
                 </div>
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[1, 2, 3, 4].map(l => (
                       <button 
                         key={l}
                         onClick={() => setDifficulty(l as any)}
                         className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${difficulty === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                       >
                          L{l}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {data.script.map((line) => (
                    <div key={line.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                       {getMaskedText(line)}
                    </div>
                 ))}
              </div>

              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                 <button onClick={() => setStage('analysis')} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">
                    查看完整解析 (Analysis)
                 </button>
              </div>
           </div>
        );
     };

     // --- STAGE 3: ANALYSIS ---
     const StageThree = () => {
        const [activeInfo, setActiveInfo] = useState<number | null>(null);

        return (
           <div className="flex flex-col h-full animate-fade-in bg-slate-50 relative">
              <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-slate-800">深度解析与复习</h3>
                 <button onClick={() => setView('dashboard')} className="text-sm font-bold text-slate-400 hover:text-indigo-600">退出练习</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
                 {data.script.map((line) => (
                    <div key={line.id} className="space-y-2">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                           <p className="text-lg font-jp text-slate-800 mb-2 leading-relaxed">
                              {/* Highlight keywords */}
                              {line.text.split(/([。、])/).map((seg, i) => {
                                 // Check if segment contains any keyword surface
                                 const matchedKwId = line.keywords.find(kid => {
                                    const k = DICTIONARY[kid];
                                    const surface = k.type === 'vocab' ? (k as any).surface_jp : (k as any).form_jp;
                                    return seg.includes(surface);
                                 });

                                 if (matchedKwId) {
                                    const k = DICTIONARY[matchedKwId];
                                    const surface = k.type === 'vocab' ? (k as any).surface_jp : (k as any).form_jp;
                                    return (
                                       <span key={i}>
                                          {seg.split(surface).map((s, j, arr) => (
                                             <React.Fragment key={j}>
                                                {s}
                                                {j < arr.length - 1 && (
                                                   <span 
                                                      className="text-indigo-600 font-bold cursor-pointer border-b border-indigo-200 hover:bg-indigo-50 px-0.5 rounded"
                                                      onClick={() => setActiveInfo(matchedKwId)}
                                                   >
                                                      {surface}
                                                   </span>
                                                )}
                                             </React.Fragment>
                                          ))}
                                       </span>
                                    );
                                 }
                                 return <span key={i}>{seg}</span>;
                              })}
                           </p>
                           <p className="text-sm text-slate-500">{line.translation}</p>
                        </div>
                    </div>
                 ))}
              </div>

              {/* Keyword Flashcard Popup */}
              {activeInfo && (
                 <div className="absolute inset-x-4 bottom-4 top-1/2 z-20 animate-slide-up-fade">
                    <div className="h-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-4 relative flex flex-col">
                       <button onClick={() => setActiveInfo(null)} className="absolute top-2 right-2 p-2 text-slate-300 hover:text-slate-500 z-30"><XCircle size={24} /></button>
                       <KnowledgeCard 
                          data={DICTIONARY[activeInfo]} 
                          mode="mini" 
                          interactive={false}
                          onToggleNotebook={() => onAddToNotebook(activeInfo)}
                          isInNotebook={false} // Assume false or pass down logic
                       />
                       <button 
                          onClick={() => { onAddToNotebook(activeInfo); setActiveInfo(null); }}
                          className="mt-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2"
                       >
                          <PlusCircle size={18} />
                          <span>加入闪卡复习</span>
                       </button>
                    </div>
                 </div>
              )}
           </div>
        );
     };

     return (
        <div className="h-full w-full">
           {stage === 'listen' && <StageOne />}
           {stage === 'dictation' && <StageTwo />}
           {stage === 'analysis' && <StageThree />}
        </div>
     );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {view === 'dashboard' ? (
         <>
            <div className="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center space-x-2 shrink-0">
               <button onClick={onExit} className="text-slate-400 hover:bg-slate-50 p-2 rounded-full"><RotateCcw size={20} /></button>
               <h1 className="text-lg font-bold text-slate-800">听力练习室</h1>
            </div>
            <div className="flex-1 overflow-hidden">
               <Dashboard />
            </div>
         </>
      ) : (
         activeExercise && <ExerciseRunner data={activeExercise} />
      )}
    </div>
  );
};
