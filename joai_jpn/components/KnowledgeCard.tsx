
import React, { useState } from 'react';
import { Volume2, X, Star, Check, Maximize2, Minimize2, FileText, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import { KnowledgePoint, VocabCard, GrammarCard } from '../types';

type RatingOption = 'unfamiliar' | 'memorable' | 'familiar';

interface CardProps {
  data: KnowledgePoint;
  onFlip?: () => void;
  isFlipped?: boolean;
  interactive?: boolean;
  onRate?: (rating: RatingOption) => void;
  selectedRating?: RatingOption | null;
  mode?: 'full' | 'mini';
  isInNotebook?: boolean;
  onToggleNotebook?: (id: number) => void;
}

export const KnowledgeCard: React.FC<CardProps> = ({ 
  data, 
  onFlip, 
  isFlipped = false, 
  interactive = false,
  onRate,
  selectedRating,
  mode = 'full',
  isInNotebook = false,
  onToggleNotebook
}) => {
  const [isDetailedMode, setIsDetailedMode] = useState(false);

  const playAudio = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const isVocab = data.type === 'vocab';

  const toggleDetailMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailedMode(!isDetailedMode);
  };

  const handleNotebookToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleNotebook?.(data.id);
  };

  const RatingControls = () => (
    <div className={`shrink-0 flex space-x-2 ${mode === 'mini' ? 'mt-4' : 'mt-auto p-3 bg-white border-t border-slate-100'}`}>
      <button 
        onClick={(e) => { e.stopPropagation(); onRate?.('unfamiliar'); }}
        className={`flex-1 rounded-xl font-bold border flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-2
          ${selectedRating === 'unfamiliar' ? 'bg-red-50 text-white shadow-md shadow-red-200' : 'bg-white text-slate-400 border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100'}
        `}
      >
          <X size={mode === 'mini' ? 16 : 20} className="mb-0.5" />
          <span className="text-[10px]">不熟</span>
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onRate?.('memorable'); }}
        className={`flex-1 rounded-xl font-bold border flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-2
          ${selectedRating === 'memorable' ? 'bg-amber-400 text-white shadow-md shadow-amber-200' : 'bg-white text-slate-400 border-slate-100 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-100'}
        `}
      >
          <Star size={mode === 'mini' ? 16 : 20} className="mb-0.5" />
          <span className="text-[10px]">模糊</span>
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onRate?.('familiar'); }}
        className={`flex-1 rounded-xl font-bold border flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-2
          ${selectedRating === 'familiar' ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-white text-slate-400 border-slate-100 hover:bg-green-50 hover:text-green-500 hover:border-green-100'}
        `}
      >
          <Check size={mode === 'mini' ? 16 : 20} className="mb-0.5" />
          <span className="text-[10px]">掌握</span>
      </button>
    </div>
  );

  // --- MINI MODE (For Sentence Learning Popup) ---
  if (mode === 'mini') {
    return (
      <div className="flex flex-col bg-white h-full relative">
         <div className="flex items-start justify-between mb-2">
            <div>
               <div className="flex items-center space-x-2 mb-1">
                 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${isVocab ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                    {isVocab ? '单词' : '语法'}
                 </span>
                 <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">{data.level}</span>
                 {data.is_eju && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">EJU</span>}
               </div>
               <h3 className="text-2xl font-bold text-slate-800 font-jp leading-tight">
                  {isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp}
               </h3>
               <p className="text-indigo-600 font-jp font-medium text-sm">
                  {isVocab ? (data as VocabCard).reading : (data as GrammarCard).pattern_jp}
               </p>
            </div>
            <div className="flex space-x-2">
               {onToggleNotebook && (
                 <button 
                    onClick={handleNotebookToggle}
                    className={`p-2 rounded-full hover:bg-slate-100 ${isInNotebook ? 'text-amber-500' : 'text-slate-300'}`}
                 >
                    {isInNotebook ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
                 </button>
               )}
               <button 
                  onClick={(e) => playAudio(isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp, e)}
                  className="p-2 rounded-full bg-slate-50 text-indigo-500 hover:bg-indigo-100"
               >
                  <Volume2 size={18} />
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
             <p className="text-base text-slate-800 font-bold">{data.meaning_zh}</p>
             <p className="text-xs text-slate-500 leading-snug">
               {isVocab ? (data as VocabCard).meaning_zh_detail : (data as GrammarCard).notes_zh}
             </p>
             {data.meaning_jp && (
                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 font-jp">
                   <span className="font-bold text-indigo-400 mr-1">JP</span>{data.meaning_jp}
                </div>
             )}
         </div>

         {interactive && <RatingControls />}
      </div>
    );
  }

  // --- DETAILED VIEW ---
  const DetailedView = () => {
    const commonExamples = data.examples.slice(0, 2);
    const additionalExamples = data.examples.slice(2);

    return (
      <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col relative overflow-hidden animate-fade-in">
        <button onClick={toggleDetailMode} className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-indigo-600 transition-colors z-20">
           <Minimize2 size={18} />
        </button>

        <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
           <div className="flex items-center space-x-2 mb-1">
             <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">{data.level}</span>
             {data.is_eju && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">EJU</span>}
           </div>

           <div className="flex items-end justify-between">
              <div>
                 <h2 className="text-3xl font-bold text-slate-800 font-jp leading-tight">
                    {isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp}
                 </h2>
                 <p className="text-base text-indigo-600 font-jp font-medium mt-0.5">
                    {isVocab ? (data as VocabCard).reading : (data as GrammarCard).pattern_jp}
                 </p>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                 {onToggleNotebook && (
                    <button 
                      onClick={handleNotebookToggle}
                      className={`p-2 rounded-full hover:bg-indigo-50 transition-colors ${isInNotebook ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                       {isInNotebook ? <BookmarkCheck size={24} fill="currentColor" /> : <Bookmark size={24} />}
                    </button>
                 )}
                 <button onClick={(e) => playAudio(isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp, e)} className="p-2 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors">
                   <Volume2 size={20} />
                 </button>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
           <div>
              {data.meaning_jp && (
                <div className="mb-2 pb-2 border-b border-slate-100">
                   <p className="text-sm text-slate-600 font-jp leading-snug">
                     <span className="text-[10px] font-bold text-indigo-400 mr-2 bg-indigo-50 px-1 rounded">JP</span>{data.meaning_jp}
                   </p>
                </div>
              )}
              <p className="text-lg text-slate-800 font-medium leading-snug">{data.meaning_zh}</p>
              {isVocab && (data as VocabCard).meaning_zh_detail && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{(data as VocabCard).meaning_zh_detail}</p>}
              {!isVocab && (data as GrammarCard).notes_zh && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-1.5 rounded mt-1.5 inline-block">{(data as GrammarCard).notes_zh}</p>}
           </div>

           <div>
              <div className="space-y-2">
                 {commonExamples.map((ex, idx) => (
                    <div key={`common-${idx}`} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                       <p className="text-sm text-slate-700 font-jp mb-0.5 leading-snug" dangerouslySetInnerHTML={{__html: ex.jp}} />
                       <p className="text-[10px] text-slate-400">{ex.zh}</p>
                    </div>
                 ))}
              </div>
           </div>
           
           {additionalExamples.length > 0 && (
             <div>
                <div className="space-y-2">
                   {additionalExamples.map((ex, idx) => (
                      <div key={`extra-${idx}`} className="pl-2 border-l-2 border-slate-100 py-0.5">
                         <p className="text-xs text-slate-600 font-jp leading-snug" dangerouslySetInnerHTML={{__html: ex.jp}} />
                         <p className="text-[10px] text-slate-400">{ex.zh}</p>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>
        {interactive && onRate && <RatingControls />}
      </div>
    );
  };

  // --- FRONT FACE ---
  const FrontFace = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 relative bg-white">
       <div className="absolute top-6 left-6 flex space-x-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold tracking-wider">{data.level}</span>
          {data.is_eju && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">EJU</span>}
       </div>
       
       <div className="absolute top-4 right-4 flex space-x-2 z-20">
          {onToggleNotebook && (
             <button 
               onClick={handleNotebookToggle}
               className={`p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors ${isInNotebook ? 'text-amber-500' : 'text-slate-300'}`}
             >
                {isInNotebook ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
             </button>
          )}
          <button onClick={toggleDetailMode} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
              <FileText size={20} />
          </button>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center w-full">
         <h2 className="text-7xl md:text-9xl font-bold text-slate-800 font-jp mb-8 tracking-tight">
            {isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp}
         </h2>
         <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
       </div>
       <button onClick={(e) => playAudio(isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp, e)} className="mb-12 p-5 rounded-full bg-slate-50 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
         <Volume2 size={28} />
       </button>
       {interactive && <p className="text-sm text-slate-300 absolute bottom-8 font-medium tracking-wide">点击翻转</p>}
    </div>
  );

  // --- BACK FACE ---
  const BackFace = () => (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden relative">
       <div className="absolute top-4 right-4 flex space-x-2 z-20">
          {onToggleNotebook && (
             <button 
               onClick={handleNotebookToggle}
               className={`p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors ${isInNotebook ? 'text-amber-500' : 'text-slate-300'}`}
             >
                {isInNotebook ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
             </button>
          )}
          <button onClick={toggleDetailMode} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
              <FileText size={20} />
          </button>
       </div>

       <div className="shrink-0 flex flex-col items-center justify-center pt-8 pb-4 border-b border-slate-50 bg-slate-50/30">
           <h3 className="text-4xl font-bold text-slate-800 font-jp mb-1">
             {isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp}
           </h3>
           <p className="text-xl text-indigo-600 font-jp font-medium">
              {isVocab ? (data as VocabCard).reading : (data as GrammarCard).pattern_jp}
           </p>
           <button onClick={(e) => playAudio(isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp, e)} className="absolute top-6 left-6 text-slate-400 hover:text-indigo-500 transition-colors">
             <Volume2 size={24} />
           </button>
       </div>
       <div className="flex-1 p-6 flex flex-col min-h-0 overflow-y-auto no-scrollbar items-center text-center">
         <div className="mb-6 max-w-md w-full">
            <p className="text-2xl text-slate-700 font-medium leading-relaxed">{data.meaning_zh}</p>
            {isVocab && (data as VocabCard).meaning_zh_detail && <p className="mt-2 text-sm text-slate-500 leading-relaxed">{(data as VocabCard).meaning_zh_detail}</p>}
            {!isVocab && (data as GrammarCard).notes_zh && <p className="mt-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">{(data as GrammarCard).notes_zh}</p>}
         </div>
         <div className="w-full text-left">
            <div className="space-y-3">
              {data.examples.slice(0, 2).map((ex, idx) => (
                <div key={idx} className="cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors group" onClick={(e) => playAudio(ex.jp.replace(/<\/?[^>]+(>|$)/g, ""), e)}>
                   <div className="flex items-start">
                     <span className="text-slate-200 text-xs mr-2 mt-1 font-bold">0{idx + 1}</span>
                     <div>
                       <p className="text-lg text-slate-700 font-jp mb-1 group-hover:text-indigo-900 transition-colors leading-snug" dangerouslySetInnerHTML={{__html: ex.jp}} />
                       <p className="text-sm text-slate-400 font-light">{ex.zh}</p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
         </div>
       </div>
       {interactive && onRate && <RatingControls />}
    </div>
  );

  if (isDetailedMode) return <DetailedView />;
  
  if (!interactive) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col relative">
         <div className="absolute top-4 right-4 flex space-x-2 z-20">
            {onToggleNotebook && (
               <button 
                 onClick={handleNotebookToggle}
                 className={`p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors ${isInNotebook ? 'text-amber-500' : 'text-slate-300'}`}
               >
                  {isInNotebook ? <BookmarkCheck size={16} fill="currentColor" /> : <Bookmark size={16} />}
               </button>
            )}
             <button onClick={toggleDetailMode} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
               <Maximize2 size={16} />
             </button>
         </div>

         <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
             <div>
                <h3 className="text-3xl font-bold text-slate-800 font-jp">
                  {isVocab ? (data as VocabCard).surface_jp : (data as GrammarCard).form_jp}
                </h3>
                <p className="text-indigo-600 font-jp text-lg mt-1">
                  {isVocab ? (data as VocabCard).reading : (data as GrammarCard).pattern_jp}
                </p>
             </div>
             <div className="flex space-x-2 mr-8">
               <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-400 font-bold">{data.level}</span>
             </div>
         </div>
         <div className="p-6 space-y-4">
             <div>
               <p className="text-xl text-slate-800 font-medium">{data.meaning_zh}</p>
               {isVocab && (data as VocabCard).meaning_zh_detail && <p className="text-sm text-slate-500 mt-1">{(data as VocabCard).meaning_zh_detail}</p>}
             </div>
             <div>
               {data.examples.slice(0, 1).map((ex, i) => (
                 <div key={i} className="bg-slate-50 p-3 rounded-lg">
                    <p className="font-jp text-slate-700" dangerouslySetInnerHTML={{__html: ex.jp}} />
                    <p className="text-xs text-slate-400 mt-1">{ex.zh}</p>
                 </div>
               ))}
             </div>
         </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full cursor-pointer perspective-1000"
      onClick={!isFlipped ? onFlip : undefined}
    >
      <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 backface-hidden">
           <FrontFace />
        </div>
        <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 rotate-y-180 backface-hidden">
           <BackFace />
        </div>
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
