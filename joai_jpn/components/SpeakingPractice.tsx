
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Square, RefreshCcw, Check, ArrowRight, MessageCircle, Volume2, Award, Zap, Activity, Users, ChevronRight, XCircle, RotateCcw } from 'lucide-react';
import { SpeakingMode, ShadowingItem, PatternDrill, RoleplayScenario } from '../types';
import { SPEAKING_SHADOWING_DATA, SPEAKING_DRILLS, SPEAKING_ROLEPLAYS, DICTIONARY } from '../constants';
import { KnowledgeCard } from './KnowledgeCard';

interface SpeakingPracticeProps {
  onExit: () => void;
  onAddToSRS: (id: number) => void;
}

export const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({ onExit, onAddToSRS }) => {
  const [mode, setMode] = useState<SpeakingMode | null>(null);

  // --- DASHBOARD ---
  const Dashboard = () => (
    <div className="h-full flex flex-col p-6 animate-fade-in bg-slate-50 overflow-y-auto">
       <div className="flex items-center space-x-2 mb-8">
          <div className="p-3 bg-pink-500 rounded-2xl text-white shadow-lg shadow-pink-200">
             <Mic size={24} />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-slate-800">口语特训</h2>
             <p className="text-slate-500 text-sm">Talking Practice</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {/* Mode A: Shadowing */}
          <button 
             onClick={() => setMode('shadowing')}
             className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all text-left group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity size={80} />
             </div>
             <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Volume2 size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-1">影子跟读 (Shadowing)</h3>
             <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded mb-3">N5~N1 基础</span>
             <p className="text-sm text-slate-500 leading-relaxed">
                听音跟读，模仿节奏与语调。<br/>
                适合建立发音肌肉记忆。
             </p>
          </button>

          {/* Mode B: Pattern Drills */}
          <button 
             onClick={() => setMode('drill')}
             className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={80} />
             </div>
             <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <RefreshCcw size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-1">句型替换 (Drills)</h3>
             <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded mb-3">N3~N2 进阶</span>
             <p className="text-sm text-slate-500 leading-relaxed">
                快速替换句子成分。<br/>
                将语法知识转化为瞬间反应。
             </p>
          </button>

          {/* Mode C: Roleplay */}
          <button 
             onClick={() => setMode('roleplay')}
             className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all text-left group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users size={80} />
             </div>
             <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MessageCircle size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-1">情境对话 (Roleplay)</h3>
             <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded mb-3">实战模拟</span>
             <p className="text-sm text-slate-500 leading-relaxed">
                在真实场景中完成沟通任务。<br/>
                获取AI针对性表达建议。
             </p>
          </button>
       </div>
    </div>
  );

  // --- MODE A: SHADOWING ---
  const ShadowingSession = () => {
     const [currentIndex, setCurrentIndex] = useState(0);
     const [status, setStatus] = useState<'idle' | 'playing' | 'recording' | 'analyzing' | 'result'>('idle');
     const item = SPEAKING_SHADOWING_DATA[currentIndex];
     
     const playAudio = () => {
        setStatus('playing');
        const u = new SpeechSynthesisUtterance(item.text);
        u.lang = 'ja-JP';
        u.rate = 0.8;
        u.onend = () => setStatus('idle');
        window.speechSynthesis.speak(u);
     };

     const startRecording = () => {
        setStatus('recording');
        // Simulate recording duration
        setTimeout(() => {
           setStatus('analyzing');
           // Simulate analysis
           setTimeout(() => {
              setStatus('result');
           }, 1500);
        }, 3000);
     };

     const handleRating = (rating: 'unstable' | 'ok' | 'stable') => {
        if (rating === 'stable') {
           // Move to next or finish
           if (currentIndex < SPEAKING_SHADOWING_DATA.length - 1) {
              setCurrentIndex(prev => prev + 1);
              setStatus('idle');
           } else {
              onExit();
           }
        } else {
           // Retry same
           setStatus('idle');
        }
     };

     return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
           <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-700">影子跟读 (Shadowing)</h3>
              <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={20}/></button>
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl w-full mb-8 relative overflow-hidden">
                 {status === 'analyzing' && (
                    <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center">
                       <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-2"></div>
                       <span className="text-pink-500 font-bold text-sm">AI 正在分析发音与节奏...</span>
                    </div>
                 )}
                 
                 <h2 className="text-3xl font-bold font-jp text-slate-800 mb-4">{item.text}</h2>
                 <p className="text-slate-500 mb-6">{item.translation}</p>
                 
                 <div className="flex flex-wrap gap-2 justify-center">
                    {item.focusPoints.map((pt, i) => (
                       <span key={i} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold border border-pink-100">
                          Focus: {pt}
                       </span>
                    ))}
                 </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-6">
                 {status === 'idle' && (
                    <>
                       <button onClick={playAudio} className="w-16 h-16 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors">
                          <Volume2 size={24} />
                       </button>
                       <button onClick={startRecording} className="w-20 h-20 rounded-full bg-pink-500 text-white shadow-xl shadow-pink-200 flex items-center justify-center hover:scale-105 transition-transform">
                          <Mic size={32} />
                       </button>
                    </>
                 )}
                 
                 {status === 'recording' && (
                    <div className="flex flex-col items-center">
                       <div className="w-20 h-20 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2 animate-pulse">
                          <Mic size={32} />
                       </div>
                       <span className="text-xs font-bold text-pink-500">正在录音...</span>
                    </div>
                 )}

                 {status === 'playing' && (
                    <div className="flex flex-col items-center">
                       <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 animate-pulse">
                          <Volume2 size={32} />
                       </div>
                    </div>
                 )}
              </div>

              {/* Result Actions */}
              {status === 'result' && (
                 <div className="w-full max-w-md animate-slide-up-fade">
                    <div className="flex justify-around mb-6">
                       <div className="text-center">
                          <div className="text-xl font-bold text-green-500 mb-1">OK</div>
                          <div className="text-[10px] text-slate-400 uppercase">发音准确</div>
                       </div>
                       <div className="text-center">
                          <div className="text-xl font-bold text-amber-500 mb-1">Wait</div>
                          <div className="text-[10px] text-slate-400 uppercase">节奏停顿</div>
                       </div>
                       <div className="text-center">
                          <div className="text-xl font-bold text-green-500 mb-1">OK</div>
                          <div className="text-[10px] text-slate-400 uppercase">关键词</div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                       <button onClick={() => handleRating('unstable')} className="py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm border border-red-100">不稳 (Retry)</button>
                       <button onClick={() => handleRating('ok')} className="py-3 bg-amber-50 text-amber-500 rounded-xl font-bold text-sm border border-amber-100">勉强 (Again)</button>
                       <button onClick={() => handleRating('stable')} className="py-3 bg-green-50 text-green-500 rounded-xl font-bold text-sm border border-green-100">稳 (Next)</button>
                    </div>
                 </div>
              )}
           </div>
        </div>
     );
  };

  // --- MODE B: DRILLS ---
  const DrillSession = () => {
     const [drillIndex, setDrillIndex] = useState(0);
     const [varIndex, setVarIndex] = useState(0);
     const [phase, setPhase] = useState<'prompt' | 'speaking' | 'feedback'>('prompt');
     
     const drill = SPEAKING_DRILLS[drillIndex];
     const variation = drill.variations[varIndex];

     useEffect(() => {
        if (phase === 'prompt') {
           const t = setTimeout(() => setPhase('speaking'), 1500);
           return () => clearTimeout(t);
        }
        if (phase === 'speaking') {
           // Simulate user thinking/speaking time limit
           const t = setTimeout(() => setPhase('feedback'), 4000); // 4s to speak
           return () => clearTimeout(t);
        }
     }, [phase, varIndex, drillIndex]);

     const handleNext = () => {
        if (varIndex < drill.variations.length - 1) {
           setVarIndex(prev => prev + 1);
           setPhase('prompt');
        } else if (drillIndex < SPEAKING_DRILLS.length - 1) {
           setDrillIndex(prev => prev + 1);
           setVarIndex(0);
           setPhase('prompt');
        } else {
           onExit();
        }
     };

     return (
        <div className="h-full flex flex-col bg-slate-900 text-white animate-fade-in relative overflow-hidden">
           {/* Progress Bar Timer */}
           {phase === 'speaking' && (
              <div className="absolute top-0 left-0 h-1 bg-indigo-500 animate-width-shrink w-full"></div>
           )}

           <div className="p-4 flex justify-between items-center z-10">
              <span className="text-xs font-bold text-slate-400 uppercase">Pattern Drill {drillIndex + 1}-{varIndex + 1}</span>
              <button onClick={() => setMode(null)} className="text-slate-400 hover:text-white"><XCircle size={20}/></button>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="mb-12">
                 <h2 className="text-xl text-slate-400 mb-2 font-mono">Structure</h2>
                 <p className="text-2xl font-bold text-indigo-300">{drill.skeleton}</p>
              </div>

              <div className="mb-12 min-h-[120px]">
                 <p className="text-sm text-slate-500 uppercase font-bold tracking-widest mb-4">Cue</p>
                 <div className="text-4xl md:text-6xl font-black font-jp tracking-wider">
                    {variation.cue}
                 </div>
              </div>

              {phase === 'feedback' ? (
                 <div className="animate-slide-up-fade">
                    <p className="text-sm text-green-400 uppercase font-bold tracking-widest mb-2">Correct Answer</p>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-8 border-b-2 border-green-500 pb-2 inline-block">
                       {variation.expected}
                    </p>
                    <button 
                       onClick={handleNext}
                       className="block mx-auto px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-indigo-50 transition-colors"
                    >
                       Next Drill
                    </button>
                 </div>
              ) : (
                 <div className="h-24 flex items-center justify-center">
                    {phase === 'speaking' && <Mic className="text-red-500 w-12 h-12 animate-pulse" />}
                    {phase === 'prompt' && <span className="text-slate-500 font-bold">Get Ready...</span>}
                 </div>
              )}
           </div>
           
           <style>{`
              @keyframes width-shrink {
                 from { width: 100%; }
                 to { width: 0%; }
              }
              .animate-width-shrink {
                 animation: width-shrink 4s linear forwards;
              }
           `}</style>
        </div>
     );
  };

  // --- MODE C: ROLEPLAY ---
  const RoleplaySession = () => {
     const [status, setStatus] = useState<'intro' | 'ai_speaking' | 'user_turn' | 'feedback'>('intro');
     const [chatHistory, setChatHistory] = useState<{role: 'ai'|'user', text: string}[]>([]);
     const scenario = SPEAKING_ROLEPLAYS[0];

     useEffect(() => {
        if (status === 'intro') {
           // Auto start AI turn after short delay
           setTimeout(() => {
              setChatHistory([{ role: 'ai', text: scenario.aiFirstMessage }]);
              setStatus('ai_speaking');
              
              // Simulate TTS time
              const u = new SpeechSynthesisUtterance(scenario.aiFirstMessage);
              u.lang = 'ja-JP';
              u.onend = () => setStatus('user_turn');
              window.speechSynthesis.speak(u);
           }, 2000);
        }
     }, [status, scenario]);

     const handleUserSpeak = () => {
        // Simulate recording and result
        setStatus('user_turn'); // Keep visuals
        
        setTimeout(() => {
           setChatHistory(prev => [...prev, { role: 'user', text: "頭が痛くて... 熱もあります。" }]); // Mock User Input
           setStatus('feedback');
        }, 2000);
     };

     return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
           {/* Header */}
           <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
               <div>
                  <h3 className="font-bold text-slate-700">{scenario.title}</h3>
                  <p className="text-xs text-slate-400">Mission: {scenario.expectedIntent}</p>
               </div>
               <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={20}/></button>
           </div>

           {/* Chat Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {status === 'intro' && (
                 <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center text-sm text-indigo-800">
                    <p className="font-bold mb-1">情境说明</p>
                    {scenario.context}
                 </div>
              )}

              {chatHistory.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'}`}>
                       <p className="font-jp text-lg">{msg.text}</p>
                    </div>
                 </div>
              ))}

              {status === 'feedback' && (
                 <div className="animate-slide-up-fade mt-8 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="bg-emerald-500 p-3 text-white flex justify-between items-center">
                       <span className="font-bold flex items-center"><Award size={18} className="mr-2"/> AI Feedback</span>
                       <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Score: 8/10</span>
                    </div>
                    <div className="p-4 space-y-4">
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">你的意图</p>
                          <div className="flex items-center text-green-600 font-bold text-sm">
                             <Check size={16} className="mr-2" />
                             成功传达了“头痛和发烧”的症状。
                          </div>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">更地道的表达 (Recommended)</p>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="font-jp font-bold text-slate-700">頭がガンガンして、熱っぽいんです。</p>
                             <p className="text-xs text-slate-400 mt-1">"ガンガン" 形象地描述了剧烈头痛。</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                             onClick={() => onAddToSRS(8001)} // Mock ID add
                             className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                          >
                             收藏推荐表达
                          </button>
                          <button onClick={() => onExit()} className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold">
                             结束对话
                          </button>
                       </div>
                    </div>
                 </div>
              )}
           </div>

           {/* User Input Area */}
           {status !== 'feedback' && (
              <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-center">
                 {status === 'user_turn' ? (
                    <button 
                      onClick={handleUserSpeak}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center space-x-2"
                    >
                       <Mic size={24} />
                       <span>按住说话 (Tap to Speak)</span>
                    </button>
                 ) : (
                    <div className="text-slate-400 text-sm font-bold flex items-center">
                       <div className="w-2 h-2 bg-slate-400 rounded-full mr-2 animate-bounce"></div>
                       对方正在说话...
                    </div>
                 )}
              </div>
           )}
        </div>
     );
  };

  return (
     <div className="h-full w-full">
        {mode === null && <Dashboard />}
        {mode === 'shadowing' && <ShadowingSession />}
        {mode === 'drill' && <DrillSession />}
        {mode === 'roleplay' && <RoleplaySession />}
     </div>
  );
};
