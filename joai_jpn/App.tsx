
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SentenceLearning } from './components/SentenceLearning';
import { StudySession } from './components/StudySession'; 
import { ContentGenerator } from './components/ContentGenerator';
import { TestMode } from './components/TestMode'; 
import { Profile } from './components/Profile'; 
import { ListeningPractice } from './components/ListeningPractice'; 
import { SpeakingPractice } from './components/SpeakingPractice'; 
import { MOCK_STATS, DICTIONARY, getAllItems, getSentencesByScenario, SENTENCES, getItemsByType, LIFE_SCENARIOS } from './constants';
import { BookOpen, PenTool, Sparkles, Check, Repeat, ArrowRight, BrainCircuit, Library, History, CheckCircle, RotateCcw, ListChecks, ArrowLeftRight, Search, AlertTriangle, PlayCircle, GraduationCap, Coffee, Anchor, Puzzle, XCircle, ToggleLeft, ToggleRight, BookMarked, Upload, FileText, PlusCircle, LibraryBig, RefreshCw, Zap, Compass, Home, Stethoscope, Briefcase, Mail, Youtube, Image, Plus, Wand2, MessageCircle, Headphones, Mic, Volume2 } from 'lucide-react';
import { KnowledgePoint, JLPTLevel, Sentence, TestResult, VocabCard, GrammarCard, ScenarioTemplate, TrainingMode } from './types';
import { KnowledgeCard } from './components/KnowledgeCard';

// Updated View State
type ViewState = 'dashboard' | 'study_home' | 'study_session' | 'session_summary' | 'custom_selection' | 'scenario_preview' | 'study_story' | 'notebook' | 'test_mode' | 'profile' | 'life_scenario_hub' | 'content_import_hub' | 'import_result' | 'listening_practice' | 'speaking_practice';
type FilterType = 'all' | 'vocab' | 'grammar';
type DictionaryMode = 'review' | 'mastered';
type ScenarioType = 'all' | 'life' | 'academic';
type SessionMode = 'sentence' | 'flashcard'; 

interface SRSResult {
  id: number;
  item: KnowledgePoint;
  rating: 'unfamiliar' | 'memorable' | 'familiar';
  timestamp: number;
}

// Internal Search Bar Component with Suggestions
const SearchBar = ({ 
  query, 
  setQuery, 
  onSelect, 
  suggestions 
}: { 
  query: string, 
  setQuery: (q: string) => void, 
  onSelect: (id: number) => void,
  suggestions: KnowledgePoint[]
}) => {
  return (
    <div className="relative w-full max-w-md group z-50">
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索: 单词、语法 (支持联想)"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
          />
       </div>
       {/* Suggestions Dropdown */}
       {query.trim().length > 0 && suggestions.length > 0 && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Suggested Results
            </div>
            {suggestions.map(item => (
              <button 
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center justify-between group/item border-b border-slate-50 last:border-0"
              >
                 <div>
                    <div className="font-bold text-slate-800 text-sm font-jp">
                       {item.type === 'vocab' ? (item as any).surface_jp : (item as any).form_jp}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{item.meaning_zh}</div>
                 </div>
                 <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-2 ${item.type === 'vocab' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {item.type === 'vocab' ? '词' : '文'}
                 </div>
              </button>
            ))}
         </div>
       )}
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [currentLevel, setCurrentLevel] = useState<JLPTLevel>('N2');
  const [levelProgress, setLevelProgress] = useState<Record<JLPTLevel, number>>({
    'N5': 100, 'N4': 80, 'N3': 65, 'N2': 45, 'N1': 10,
  });

  // Notebook State (Replaces Library)
  const [notebookIds, setNotebookIds] = useState<Set<number>>(new Set());
  const [expandedLibraryItem, setExpandedLibraryItem] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Book Store State
  const [isBookStoreMode, setIsBookStoreMode] = useState(false);
  const [bookStoreTab, setBookStoreTab] = useState<'vocab' | 'grammar'>('vocab');
  const [bookStoreLevel, setBookStoreLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  
  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<KnowledgePoint[]>([]);
  
  // Study State
  const [studyTab, setStudyTab] = useState<'learn' | 'practice'>('learn');
  const [sessionMode, setSessionMode] = useState<SessionMode>('sentence');
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('academic');
  const [activeSentences, setActiveSentences] = useState<Sentence[]>([]);
  const [activeFlashcards, setActiveFlashcards] = useState<KnowledgePoint[]>([]);
  const [scenarioItems, setScenarioItems] = useState<KnowledgePoint[]>([]);
  
  // New Feature States
  const [selectedScenarioTemplate, setSelectedScenarioTemplate] = useState<ScenarioTemplate | null>(null);
  // NEW: Track selected mode within the Scenario Modal
  const [activeScenarioMode, setActiveScenarioMode] = useState<TrainingMode>('reading');

  const [importText, setImportText] = useState('');
  
  // Global Accumulator
  const [srsHistory, setSrsHistory] = useState<SRSResult[]>([]);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);
  
  const [reviewQueue, setReviewQueue] = useState<KnowledgePoint[]>([]);
  
  useEffect(() => {
    if (!hasIntroPlayed) {
      const timer = setTimeout(() => {
        setCurrentView('study_home');
        setHasIntroPlayed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasIntroPlayed]);

  // Reset scenario mode when opening a scenario
  useEffect(() => {
    if (selectedScenarioTemplate) {
      setActiveScenarioMode('reading');
    }
  }, [selectedScenarioTemplate]);

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      const all = getAllItems();
      const matches = all.filter(item => {
          const jp = item.type === 'vocab' ? (item as any).surface_jp : (item as any).form_jp;
          const reading = item.type === 'vocab' ? (item as any).reading : (item as any).pattern_jp;
          return jp.includes(lower) || item.meaning_zh.includes(lower) || (reading && reading.includes(lower));
      }).slice(0, 5); // Limit suggestions
      setSearchSuggestions(matches);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSelect = (id: number) => {
      setExpandedLibraryItem(id);
      setSearchQuery(''); // Optional: clear or keep
      setSearchSuggestions([]);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'study') setCurrentView('study_home');
    else setCurrentView(tabId as ViewState);
  };

  const handleLevelChange = (level: JLPTLevel) => {
    setCurrentLevel(level);
  };

  const toggleNotebook = (id: number) => {
    setNotebookIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Notebook Import Logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        
        // Simple parsing: split by newlines, commas, spaces
        const tokens = text.split(/[\n,\s]+/).map(t => t.trim()).filter(t => t.length > 0);
        
        const allItems = getAllItems();
        let count = 0;
        
        setNotebookIds(prev => {
            const next = new Set(prev);
            tokens.forEach(token => {
                // Try to find match for surface form or reading
                const match = allItems.find(item => {
                    if (item.type === 'vocab') {
                        return (item as VocabCard).surface_jp === token || (item as VocabCard).reading === token;
                    } else {
                        return (item as GrammarCard).form_jp === token || (item as GrammarCard).pattern_jp === token;
                    }
                });
                
                if (match) {
                    if (!next.has(match.id)) {
                        next.add(match.id);
                        count++;
                    }
                }
            });
            return next;
        });
        
        alert(`成功从文本导入 ${count} 个匹配内容到笔记本！`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Logic to Auto-Add to Notebook if item was Unfamiliar and is now Mastered
  const checkAndAddToNotebook = (id: number, rating: 'unfamiliar' | 'memorable' | 'familiar') => {
    if (rating === 'familiar') {
       // Check if it was EVER marked unfamiliar in history
       const wasUnfamiliar = srsHistory.some(h => h.id === id && h.rating === 'unfamiliar');
       if (wasUnfamiliar) {
          setNotebookIds(prev => new Set(prev).add(id));
       }
    }
  };

  // --- NEW SCENARIO SESSION LOGIC ---
  const startScenarioSession = () => {
    // 1. SRS Selection Logic
    // Priority: Review Queue -> Unfamiliar History -> Random New
    
    const getCandidates = (type: 'vocab' | 'grammar', count: number) => {
      const allTypeItems = getItemsByType(type).filter(i => i.level === currentLevel);
      const learnedIds = new Set(srsHistory.map(h => h.id));
      const unfamiliarIds = new Set(srsHistory.filter(h => h.rating === 'unfamiliar').map(h => h.id));
      const reviewIds = new Set(reviewQueue.map(r => r.id));

      let selection: KnowledgePoint[] = [];

      // 1. From Immediate Review Queue
      const fromQueue = allTypeItems.filter(i => reviewIds.has(i.id));
      selection = [...selection, ...fromQueue];

      // 2. From History (Unfamiliar) - if not already selected
      if (selection.length < count) {
         const fromHistory = allTypeItems.filter(i => unfamiliarIds.has(i.id) && !selection.includes(i));
         selection = [...selection, ...fromHistory];
      }

      // 3. From New Items
      if (selection.length < count) {
         const fromNew = allTypeItems.filter(i => !learnedIds.has(i.id) && !selection.includes(i));
         selection = [...selection, ...fromNew];
      }
      
      // 4. Fill with random if still not enough
      if (selection.length < count) {
         const remaining = allTypeItems.filter(i => !selection.includes(i));
         selection = [...selection, ...remaining];
      }

      return selection.slice(0, count);
    };

    const vocabSelection = getCandidates('vocab', 6);
    const grammarSelection = getCandidates('grammar', 3);
    const mixedItems = [...vocabSelection, ...grammarSelection];

    if (mixedItems.length === 0) {
       alert("当前等级内容不足，请切换等级或查看笔记本。");
       return;
    }

    setScenarioItems(mixedItems);
    setCurrentView('scenario_preview');
  };

  // Start Flashcard-Based Learning
  const startFlashcardSession = (type: 'vocab' | 'grammar', isReview: boolean) => {
    let items = getItemsByType(type).filter(item => item.level === currentLevel);
    
    // Filter items based on whether they have been learned (present in history)
    const learnedIds = new Set(srsHistory.map(h => h.id));
    
    if (isReview) {
       items = items.filter(i => learnedIds.has(i.id));
       if (items.length === 0) {
          alert("暂无待复习内容。请先进行新学。");
          return;
       }
       // Simple sort by last reviewed time (oldest first for review) could be added here
    } else {
       // New Learning
       items = items.filter(i => !learnedIds.has(i.id));
       if (items.length === 0) {
          alert("当前等级的该类内容已全部学习！建议进行复习或挑战下一等级。");
          return;
       }
    }
    
    const batch = items.slice(0, 10);
    setActiveFlashcards(batch);
    setSessionMode('flashcard');
    setCurrentView('study_session');
  };

  const handleSessionComplete = (results: { familiar: KnowledgePoint[], memorable: KnowledgePoint[], unfamiliar: KnowledgePoint[] }) => {
    // Update SRS History and Notebook logic
    const now = Date.now();
    const newHistory = [...srsHistory];

    // Helper to process list
    const processList = (list: KnowledgePoint[], rating: 'unfamiliar' | 'memorable' | 'familiar') => {
      list.forEach(item => {
         newHistory.push({ id: item.id, item, rating, timestamp: now });
         checkAndAddToNotebook(item.id, rating);
      });
    };

    processList(results.familiar || [], 'familiar');
    processList(results.memorable || [], 'memorable');
    processList(results.unfamiliar || [], 'unfamiliar');

    setSrsHistory(newHistory);
    
    setLevelProgress(prev => ({
        ...prev,
        [currentLevel]: Math.min(100, prev[currentLevel] + 2)
    }));
    setCurrentView('session_summary');
  };

  // TEST MODE Handlers
  const initTestMode = () => {
    setCurrentView('test_mode');
  };

  const handleTestComplete = (result: TestResult) => {
    if (result.wrongIds.length > 0) {
        const reviewItems = getItemsByType('grammar').filter(i => i.level === currentLevel).slice(0, 2);
        setReviewQueue(prev => {
            const newSet = new Set(prev.map(p => p.id));
            const distinct = reviewItems.filter(r => !newSet.has(r.id));
            return [...prev, ...distinct];
        });
    }
    
    setLevelProgress(prev => ({
        ...prev,
        [currentLevel]: Math.min(100, prev[currentLevel] + (result.score > 7 ? 5 : 1))
    }));
  };

  // Notebook Helper
  const getNotebookItems = () => {
    const allItems = getAllItems();
    return allItems.filter(item => notebookIds.has(item.id));
  };

  // Book Store Helper
  const getStoreItems = () => {
    const all = getAllItems();
    return all.filter(item => {
      const typeMatch = item.type === bookStoreTab;
      const levelMatch = bookStoreLevel === 'ALL' || item.level === bookStoreLevel;
      return typeMatch && levelMatch;
    });
  };

  // --- Scenario & Import Helpers ---
  const handleSimulateScenario = (template: ScenarioTemplate, mode: TrainingMode = 'reading') => {
    // Convert template keywords to partial KnowledgePoints for Generator
    // Note: We don't have full data here, so we mock minimal required fields.
    const items: KnowledgePoint[] = template.keywords.map(k => ({
       id: k.id,
       type: k.type,
       level: 'N3', // Mock
       meaning_zh: k.zh,
       examples: [],
       // Conditionally add fields based on type
       ...(k.type === 'vocab' 
          ? { surface_jp: k.jp, reading: k.kana, pos: '名詞' } as VocabCard 
          : { form_jp: k.jp, pattern_jp: k.kana } as GrammarCard
       )
    }));
    
    setScenarioItems(items);
    
    // Routing Logic based on selected mode
    if (mode === 'listening') {
       setCurrentView('listening_practice');
    } else if (mode === 'speaking') {
       setCurrentView('speaking_practice');
    } else {
       // Default Reading
       setCurrentView('study_story');
    }
    
    setSelectedScenarioTemplate(null);
  };

  const handleAnalyzeImport = () => {
    if(!importText.trim()) return;
    setCurrentView('import_result');
  };

  const ScenarioIcon = ({ id, size=24, className="" }: any) => {
    switch(id) {
      case 'home': return <Home size={size} className={className} />;
      case 'hospital': return <Stethoscope size={size} className={className} />;
      case 'work': return <Briefcase size={size} className={className} />;
      case 'mail': return <Mail size={size} className={className} />;
      default: return <Sparkles size={size} className={className} />;
    }
  };
  
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
            <Dashboard 
                stats={MOCK_STATS} 
                currentLevel={currentLevel} 
                onLevelChange={handleLevelChange} 
                levelProgress={levelProgress}
            />
        );
      
      case 'profile':
        return (
            <Profile 
              stats={MOCK_STATS}
              currentLevel={currentLevel}
            />
        );

      case 'study_home':
        return (
          <div className="w-full h-full flex flex-col overflow-y-auto no-scrollbar pb-8">
             <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                <h2 className="text-2xl font-bold text-slate-800">学习中心</h2>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-full">
                   <button 
                       onClick={() => setStudyTab('learn')} 
                       className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${studyTab === 'learn' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                      学习模式
                   </button>
                   <button 
                       onClick={() => setStudyTab('practice')} 
                       className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${studyTab === 'practice' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                      练习模式
                   </button>
                </div>
             </div>
             
             {/* Review Queue Alert */}
             {reviewQueue.length > 0 && (
                <div className="mb-6 mx-2 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between animate-fade-in">
                   <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle size={20} /></div>
                      <div>
                         <h4 className="font-bold text-slate-800 text-sm">错题急救</h4>
                         <p className="text-xs text-red-500">{reviewQueue.length} 个重点复习项</p>
                      </div>
                   </div>
                   <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-200">
                      立即复习
                   </button>
                </div>
             )}

             {studyTab === 'practice' ? (
                 <div className="flex flex-col gap-6 mb-8 animate-fade-in">
                    
                    {/* 1. Core Practice Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* MERGED: Scenario Integration (Academic + Life) */}
                        <button 
                          onClick={startScenarioSession}
                          className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col items-center justify-center text-center p-6 relative overflow-hidden active:scale-[0.98] duration-100 min-h-[160px]"
                        >
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-orange-500"></div>
                          
                          <div className="flex -space-x-3 mb-3 group-hover:scale-105 transition-transform">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                                <GraduationCap size={20} />
                              </div>
                              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Coffee size={20} />
                              </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-800 mb-1">情境综合学习</h3>
                          <p className="text-slate-400 text-[10px]">
                              6词 + 3文 → AI生成沉浸式文章
                          </p>
                        </button>

                        {/* Test / Sprint Mode */}
                        <button 
                          onClick={initTestMode}
                          className="bg-slate-800 rounded-3xl shadow-lg hover:shadow-xl hover:bg-slate-900 transition-all group flex flex-col items-center justify-center text-center p-6 relative overflow-hidden active:scale-[0.98] duration-100 min-h-[160px]"
                        >
                          <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-indigo-500/20 rounded-full blur-3xl"></div>
                          <div className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-sm">
                              <Sparkles size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">综合测评</h3>
                          <p className="text-slate-400 text-[10px]">模拟考场 (计时・评分)</p>
                        </button>

                        {/* LISTENING PRACTICE */}
                        <button 
                          onClick={() => setCurrentView('listening_practice')}
                          className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-sky-200 transition-all group flex flex-col items-center justify-center text-center p-6 relative overflow-hidden active:scale-[0.98] duration-100 min-h-[160px]"
                        >
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
                          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                             <Headphones size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">EJU 听力特训</h3>
                          <p className="text-slate-400 text-[10px]">
                              题型分类训练 · 精听填空 · AI 助手
                          </p>
                        </button>

                        {/* NEW: SPEAKING PRACTICE */}
                        <button 
                          onClick={() => setCurrentView('speaking_practice')}
                          className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-pink-200 transition-all group flex flex-col items-center justify-center text-center p-6 relative overflow-hidden active:scale-[0.98] duration-100 min-h-[160px]"
                        >
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-400 to-rose-500"></div>
                          <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                             <Mic size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">口语特训</h3>
                          <p className="text-slate-400 text-[10px]">
                              影子跟读 · 句型替换 · 情境对话
                          </p>
                        </button>
                    </div>

                    {/* 2. Life Application Scenarios */}
                    <div>
                       <div className="flex items-center justify-between mb-3 px-1">
                          <h3 className="font-bold text-slate-700 flex items-center">
                             <Compass className="mr-2 text-indigo-500" size={18} />
                             生活应用场景库
                          </h3>
                          <button onClick={() => setCurrentView('life_scenario_hub')} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">全部</button>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {LIFE_SCENARIOS.map(scene => (
                            <button 
                               key={scene.id} 
                               onClick={() => setSelectedScenarioTemplate(scene)}
                               className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group"
                            >
                               <div className={`w-10 h-10 ${scene.color.replace('bg-', 'text-').replace('500', '600')} bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors`}>
                                  <ScenarioIcon id={scene.iconId} size={20} />
                               </div>
                               <h4 className="font-bold text-slate-800 text-sm mb-1">{scene.title}</h4>
                               <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{scene.goal}</p>
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* 3. Content Import */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                          <Library size={120} />
                       </div>
                       <h3 className="font-bold text-indigo-900 mb-2 flex items-center">
                          <Upload className="mr-2" size={18} />
                          兴趣内容导入
                       </h3>
                       <p className="text-sm text-indigo-700/80 mb-6 max-w-sm">
                          将 YouTube 字幕、动漫台词或讲义导入系统。AI 自动分词并生成学习卡片，让兴趣成为最好的老师。
                       </p>
                       <div className="flex gap-3">
                          <button 
                             onClick={() => setCurrentView('content_import_hub')}
                             className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm border border-indigo-100 hover:bg-indigo-50"
                          >
                             <FileText size={16} />
                             <span>文本导入</span>
                          </button>
                          <button className="flex items-center space-x-2 bg-white text-slate-400 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm border border-slate-100 cursor-not-allowed">
                             <Youtube size={16} />
                             <span>视频导入 (Dev)</span>
                          </button>
                       </div>
                    </div>

                 </div>
             ) : (
                 <div className="flex flex-col gap-6 animate-fade-in">
                    {/* NEW LEARNING CARD - Split Left/Right */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-indigo-50 p-3 text-center border-b border-indigo-100 flex items-center justify-center space-x-2">
                            <Sparkles size={16} className="text-indigo-600" />
                            <h3 className="font-bold text-indigo-700">今日新学 (New Learning)</h3>
                        </div>
                        <div className="flex h-40">
                            {/* Left: Vocab */}
                            <button 
                                onClick={() => startFlashcardSession('vocab', false)}
                                className="flex-1 flex flex-col items-center justify-center border-r border-slate-100 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Anchor size={24} />
                                </div>
                                <span className="font-bold text-slate-700">单词</span>
                                <span className="text-[10px] text-slate-400 mt-1">Vocabulary</span>
                            </button>
                            {/* Right: Grammar */}
                            <button 
                                onClick={() => startFlashcardSession('grammar', false)}
                                className="flex-1 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Puzzle size={24} />
                                </div>
                                <span className="font-bold text-slate-700">语法</span>
                                <span className="text-[10px] text-slate-400 mt-1">Grammar</span>
                            </button>
                        </div>
                    </div>

                    {/* REVIEW CARD - Split Left/Right */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-amber-50 p-3 text-center border-b border-amber-100 flex items-center justify-center space-x-2">
                            <RefreshCw size={16} className="text-amber-600" />
                            <h3 className="font-bold text-amber-700">智能复习 (SRS Review)</h3>
                        </div>
                        <div className="flex h-40">
                            {/* Left: Vocab */}
                            <button 
                                onClick={() => startFlashcardSession('vocab', true)}
                                className="flex-1 flex flex-col items-center justify-center border-r border-slate-100 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Anchor size={24} />
                                </div>
                                <span className="font-bold text-slate-700">单词</span>
                                <span className="text-[10px] text-slate-400 mt-1">Vocabulary</span>
                            </button>
                            {/* Right: Grammar */}
                            <button 
                                onClick={() => startFlashcardSession('grammar', true)}
                                className="flex-1 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Puzzle size={24} />
                                </div>
                                <span className="font-bold text-slate-700">语法</span>
                                <span className="text-[10px] text-slate-400 mt-1">Grammar</span>
                            </button>
                        </div>
                    </div>
                 </div>
             )}
             
             {/* Life Scenario Modal */}
             {selectedScenarioTemplate && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedScenarioTemplate(null)}>
                  <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-slide-up-fade" onClick={e => e.stopPropagation()}>
                      <div className={`p-6 ${selectedScenarioTemplate.color} text-white`}>
                         <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                               <ScenarioIcon id={selectedScenarioTemplate.iconId} size={24} />
                            </div>
                            <button onClick={() => setSelectedScenarioTemplate(null)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><XCircle size={20}/></button>
                         </div>
                         <h2 className="text-2xl font-bold mb-1">{selectedScenarioTemplate.title}</h2>
                         <p className="opacity-90 text-sm">{selectedScenarioTemplate.goal}</p>
                      </div>
                      
                      {/* Mode Selector Tabs */}
                      <div className="px-6 pt-4 flex space-x-2">
                         <button 
                           onClick={() => setActiveScenarioMode('reading')}
                           className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${activeScenarioMode === 'reading' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                         >
                            <BookOpen size={14} />
                            <span>阅读</span>
                         </button>
                         <button 
                           onClick={() => setActiveScenarioMode('listening')}
                           className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${activeScenarioMode === 'listening' ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                         >
                            <Headphones size={14} />
                            <span>听力</span>
                         </button>
                         <button 
                           onClick={() => setActiveScenarioMode('speaking')}
                           className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${activeScenarioMode === 'speaking' ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                         >
                            <Mic size={14} />
                            <span>口语</span>
                         </button>
                      </div>

                      <div className="p-6 max-h-[50vh] overflow-y-auto">
                         <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                               <span>关键表达 (For {activeScenarioMode})</span>
                               <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">Filtered</span>
                            </h4>
                            <div className="space-y-2">
                               {selectedScenarioTemplate.keywords.filter(k => k.tags.includes(activeScenarioMode)).length > 0 ? (
                                  selectedScenarioTemplate.keywords
                                    .filter(k => k.tags.includes(activeScenarioMode))
                                    .map((kw) => (
                                       <div key={kw.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <div>
                                             <div className="font-bold text-slate-800 font-jp">{kw.jp}</div>
                                             <div className="text-xs text-slate-500">{kw.zh}</div>
                                          </div>
                                          <button onClick={() => {}} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">
                                             {activeScenarioMode === 'listening' ? <Volume2 size={18} /> : <PlusCircle size={20} />}
                                          </button>
                                       </div>
                                    ))
                               ) : (
                                  <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                     暂无该模式专属词汇，请尝试其他模式。
                                  </div>
                               )}
                            </div>
                         </div>
                         
                         {/* Dynamic Button Action based on Mode */}
                         <button 
                            onClick={() => handleSimulateScenario(selectedScenarioTemplate, activeScenarioMode)}
                            className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2 
                               ${activeScenarioMode === 'reading' ? 'bg-purple-600 shadow-purple-200' : ''}
                               ${activeScenarioMode === 'listening' ? 'bg-sky-600 shadow-sky-200' : ''}
                               ${activeScenarioMode === 'speaking' ? 'bg-pink-600 shadow-pink-200' : ''}
                            `}
                         >
                            {activeScenarioMode === 'reading' && <><Sparkles size={20} /><span>开始阅读生成 (Generate Story)</span></>}
                            {activeScenarioMode === 'listening' && <><Headphones size={20} /><span>进入听力特训 (Start Listening)</span></>}
                            {activeScenarioMode === 'speaking' && <><Mic size={20} /><span>进入口语模拟 (Start Roleplay)</span></>}
                         </button>
                      </div>
                  </div>
               </div>
             )}
          </div>
        );

      case 'life_scenario_hub':
         return (
            <div className="h-full flex flex-col bg-slate-50">
               <div className="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center space-x-2 shrink-0">
                  <button onClick={() => setCurrentView('study_home')} className="p-2 hover:bg-slate-50 rounded-full"><ArrowLeftRight size={20} /></button>
                  <h2 className="text-xl font-bold text-slate-800">生活应用场景库</h2>
               </div>
               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                  {LIFE_SCENARIOS.map(scene => (
                     <div key={scene.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <div className={`w-12 h-12 ${scene.color.replace('bg-', 'text-').replace('500', '600')} bg-slate-50 rounded-2xl flex items-center justify-center`}>
                              <ScenarioIcon id={scene.iconId} size={24} />
                           </div>
                           <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">Action Template</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{scene.title}</h3>
                        <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{scene.goal}</p>
                        <button 
                           onClick={() => setSelectedScenarioTemplate(scene)}
                           className="w-full py-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                        >
                           查看详情
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         );

      case 'listening_practice':
         return (
             <ListeningPractice 
               onExit={() => setCurrentView('study_home')} 
               onAddToNotebook={toggleNotebook}
             />
         );

      case 'speaking_practice':
         return (
            <SpeakingPractice 
               onExit={() => setCurrentView('study_home')} 
               onAddToSRS={toggleNotebook} 
            />
         );

      case 'content_import_hub':
         return (
            <div className="h-full flex flex-col bg-slate-50">
               <div className="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center space-x-2 shrink-0">
                  <button onClick={() => setCurrentView('study_home')} className="p-2 hover:bg-slate-50 rounded-full"><ArrowLeftRight size={20} /></button>
                  <h2 className="text-xl font-bold text-slate-800">内容导入 (Content Import)</h2>
               </div>
               
               <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full md:h-auto">
                     <div className="flex border-b border-slate-100">
                        <button className="flex-1 py-4 text-center font-bold text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50">文本 / 讲义</button>
                        <button className="flex-1 py-4 text-center font-bold text-slate-400 hover:text-slate-600">YouTube URL</button>
                        <button className="flex-1 py-4 text-center font-bold text-slate-400 hover:text-slate-600">图片 OCR</button>
                     </div>
                     <div className="p-6 flex-1 flex flex-col">
                        <label className="block text-sm font-bold text-slate-700 mb-2">输入或粘贴日语内容</label>
                        <textarea 
                           className="w-full flex-1 min-h-[200px] p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 resize-none font-jp text-lg leading-relaxed text-slate-800 placeholder-slate-400"
                           placeholder="在此粘贴想要学习的文章、台词或歌词..."
                           value={importText}
                           onChange={(e) => setImportText(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end">
                           <button 
                              onClick={handleAnalyzeImport}
                              disabled={!importText.trim()}
                              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                           >
                              <Sparkles size={18} />
                              <span>智能分析与分词</span>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         );

      case 'import_result':
         // Mock Segmentation: Split by particles/punctuation roughly for demo visuals
         // In real app, use a proper tokenizer API
         const segments = importText.split(/([、。！？\s\n])/).filter(Boolean);
         
         return (
            <div className="h-full flex flex-col bg-slate-50">
               <div className="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div className="flex items-center space-x-2">
                     <button onClick={() => setCurrentView('content_import_hub')} className="p-2 hover:bg-slate-50 rounded-full"><ArrowLeftRight size={20} /></button>
                     <h2 className="text-xl font-bold text-slate-800">导入分析结果</h2>
                   </div>
                   <button className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg">全部加入复习</button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-3xl mx-auto leading-loose text-xl font-jp text-slate-800">
                     {segments.map((seg, i) => {
                        // Very rough heuristic to identify "words" vs "particles" for demo interactivity
                        const isWord = seg.length > 1 && !/[、。！？\s]/.test(seg);
                        if (isWord) {
                           return (
                              <span key={i} className="inline-block relative group cursor-pointer mx-0.5">
                                 <span className="border-b-2 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 transition-colors rounded px-0.5">{seg}</span>
                                 <button className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    点击添加
                                 </button>
                              </span>
                           );
                        }
                        return <span key={i}>{seg}</span>;
                     })}
                  </div>
                  <p className="text-center text-slate-400 mt-6 text-sm">点击高亮词汇即可加入生词本</p>
               </div>
            </div>
         );

      case 'test_mode':
        return (
            <TestMode 
                initialLevel={currentLevel}
                onComplete={handleTestComplete}
                onExit={() => setCurrentView('study_home')}
            />
        );

      // --- NEW SCENARIO PREVIEW VIEW ---
      case 'scenario_preview':
        const vocabPreviews = scenarioItems.filter(i => i.type === 'vocab');
        const grammarPreviews = scenarioItems.filter(i => i.type === 'grammar');
        
        return (
          <div className="h-full flex flex-col animate-fade-in bg-slate-50 overflow-y-auto no-scrollbar pb-8">
             <div className="bg-white p-6 border-b border-slate-200 shrink-0 sticky top-0 z-20">
                <div className="flex items-center space-x-2 mb-2">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Compass size={20} /></div>
                   <h2 className="text-xl font-bold text-slate-800">情境学习预览</h2>
                </div>
                <p className="text-sm text-slate-500">
                   根据记忆曲线为您推荐了 <span className="font-bold text-indigo-600">6个单词</span> 和 <span className="font-bold text-emerald-600">3个语法</span>。
                   <br/>请确认以下内容，AI 将基于此生成文章。
                </p>
             </div>

             <div className="flex-1 p-4 space-y-6">
                {/* Vocab Section */}
                <div>
                   <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 px-1">核心单词 ({vocabPreviews.length})</h3>
                   <div className="grid grid-cols-2 gap-3">
                      {vocabPreviews.map(item => (
                         <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                               {item.level}
                            </div>
                            <div className="min-w-0">
                               <div className="font-bold text-slate-800 font-jp truncate">{(item as any).surface_jp}</div>
                               <div className="text-xs text-indigo-500 truncate">{(item as any).reading}</div>
                               <div className="text-xs text-slate-400 mt-1 truncate">{item.meaning_zh}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Grammar Section */}
                <div>
                   <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 px-1">重点语法 ({grammarPreviews.length})</h3>
                   <div className="grid grid-cols-1 gap-3">
                      {grammarPreviews.map(item => (
                         <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                               {item.level}
                            </div>
                            <div className="min-w-0">
                               <div className="font-bold text-slate-800 font-jp">{(item as any).form_jp}</div>
                               <div className="text-xs text-slate-400 mt-0.5">{item.meaning_zh}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="p-4 bg-white border-t border-slate-200 shrink-0 sticky bottom-0 z-20">
                <button 
                  onClick={() => setCurrentView('study_story')}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2"
                >
                   <Sparkles size={20} />
                   <span>生成情境文章 (Generate Story)</span>
                </button>
             </div>
          </div>
        );

      case 'study_story': 
        return (
          <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 shrink-0">
                  <button onClick={() => setCurrentView('study_home')} className="flex items-center text-slate-500 font-bold text-sm">
                      <ArrowLeftRight size={16} className="mr-1"/> 退出
                  </button>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Scenario Mode</span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                  <ContentGenerator 
                      items={scenarioItems} 
                      mode="all" 
                      onFinish={() => setCurrentView('session_summary')} 
                  />
              </div>
          </div>
        );

      case 'study_session':
        return (
          <div className="flex flex-col h-full">
             <div className="mb-2 flex items-center justify-between shrink-0 px-2">
                {sessionMode === 'sentence' ? (
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-8 rounded-full bg-indigo-500"></div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-800">句卡特训</h2>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          {activeScenario === 'academic' ? 'ACADEMIC' : 'LIFE'}
                        </p>
                     </div>
                  </div>
                ) : (
                  <div></div>
                )}

                <button onClick={() => setCurrentView('study_home')} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <span className="text-xl font-bold leading-none">&times;</span>
                </button>
             </div>
             <div className="flex-1 min-h-0 relative">
                {sessionMode === 'sentence' ? (
                   <SentenceLearning sentences={activeSentences} onComplete={handleSessionComplete} />
                ) : (
                   <StudySession items={activeFlashcards} onComplete={handleSessionComplete} />
                )}
             </div>
          </div>
        );

      case 'session_summary':
        return (
          <div className="max-w-xl mx-auto h-full flex flex-col justify-center animate-fade-in">
             <div className="text-center mb-10 shrink-0">
               <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
                 <Check className="w-12 h-12 text-green-500" />
               </div>
               <h2 className="text-3xl font-bold text-slate-800 mb-2">
                 {sessionMode === 'sentence' ? '本组句卡完成' : '练习完成'}
               </h2>
               <p className="text-base text-slate-500">
                 {sessionMode === 'sentence' 
                   ? `已学习 ${activeSentences.length} 个句子场景。` 
                   : `已复习 ${activeFlashcards.length} 个基础知识点。`
                 }
               </p>
               <p className="text-xs text-slate-400 mt-2">
                 * 不熟悉且已掌握的单词已自动加入笔记
               </p>
             </div>
             <button 
                onClick={() => setCurrentView('study_home')}
                className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-between group"
            >
                <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg"><Repeat size={20} /></div>
                    <div className="text-left">
                    <h4 className="font-bold text-lg">返回学习中心</h4>
                    </div>
                </div>
                <ArrowRight size={20} />
            </button>
          </div>
        );
      
      case 'custom_selection': return <div className="p-4">Selection Screen</div>;

      case 'notebook':
        // If in "Book Store" mode
        if (isBookStoreMode) {
          const storeItems = getStoreItems();
          return (
            <div className="h-full flex flex-col bg-slate-50">
               {/* Store Header */}
               <div className="bg-white p-4 shadow-sm z-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div className="flex items-center space-x-2">
                      <button onClick={() => setIsBookStoreMode(false)} className="p-2 -ml-2 rounded-full hover:bg-slate-100"><ArrowLeftRight size={20} /></button>
                      <h2 className="text-xl font-bold text-slate-800">词书中心 (Book Store)</h2>
                   </div>
                   <div className="flex space-x-1 bg-slate-100 p-1 rounded-full">
                       <button onClick={() => setBookStoreTab('vocab')} className={`px-3 py-1 text-xs font-bold rounded-full ${bookStoreTab === 'vocab' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>单词词书</button>
                       <button onClick={() => setBookStoreTab('grammar')} className={`px-3 py-1 text-xs font-bold rounded-full ${bookStoreTab === 'grammar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>语法词书</button>
                   </div>
               </div>

               {/* Level Filters */}
               <div className="px-4 py-2 bg-white border-b border-slate-100 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
                  {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                    <button 
                      key={level}
                      onClick={() => setBookStoreLevel(level as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${bookStoreLevel === level ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {level === 'ALL' ? '全部等级' : level}
                    </button>
                  ))}
               </div>

               {/* Store List */}
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {storeItems.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                       <LibraryBig size={48} className="mx-auto mb-4 opacity-30" />
                       <p>该分类下暂无内容</p>
                    </div>
                  ) : (
                    storeItems.map((item) => {
                      const isAdded = notebookIds.has(item.id);
                      return (
                        <div key={item.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between group">
                            <div>
                               <div className="flex items-center space-x-2 mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.type === 'vocab' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                      {item.type === 'vocab' ? '词' : '文'}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{item.level}</span>
                               </div>
                               <h3 className="text-lg font-bold text-slate-800 font-jp">
                                  {item.type === 'vocab' ? (item as any).surface_jp : (item as any).form_jp}
                               </h3>
                               <p className="text-xs text-slate-500">{item.meaning_zh}</p>
                            </div>
                            <button 
                              onClick={() => toggleNotebook(item.id)}
                              disabled={isAdded}
                              className={`p-3 rounded-full transition-all ${isAdded ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110'}`}
                            >
                               {isAdded ? <Check size={20} /> : <PlusCircle size={20} />}
                            </button>
                        </div>
                      );
                    })
                  )}
               </div>
            </div>
          );
        }

        // Standard Notebook Mode
        const notebookItems = getNotebookItems();
        const vocabItems = notebookItems.filter(i => i.type === 'vocab');
        const grammarItems = notebookItems.filter(i => i.type === 'grammar');

        const renderNotebookItem = (item: KnowledgePoint) => {
            return (
                <div key={item.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setExpandedLibraryItem(item.id)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.type === 'vocab' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {item.type === 'vocab' ? '词' : '文'}
                                </span>
                                {item.is_eju && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">EJU</span>}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 font-jp">
                                {item.type === 'vocab' ? (item as any).surface_jp : (item as any).form_jp}
                            </h3>
                            <p className="text-xs text-indigo-500 font-jp mb-1">
                                {item.type === 'vocab' ? (item as any).reading : (item as any).pattern_jp}
                            </p>
                            <p className="text-sm text-slate-500 line-clamp-1">{item.meaning_zh}</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 mt-2" />
                    </div>
                </div>
            );
        };

        return (
             <div className="h-full flex flex-col bg-slate-50">
                {/* Header */}
                <div className="bg-white p-4 shadow-sm z-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div>
                       <div className="flex items-center space-x-2 mb-1">
                          <BookMarked className="text-indigo-600" />
                          <h2 className="text-xl font-bold text-slate-800">笔记本 (Notebook)</h2>
                       </div>
                       <p className="text-xs text-slate-400">自动或手动收集的重点内容</p>
                   </div>
                   <div className="flex items-center space-x-2">
                       <button 
                           onClick={() => setIsBookStoreMode(true)}
                           className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-xs font-bold"
                       >
                           <LibraryBig size={16} />
                           <span>词书中心</span>
                       </button>

                       <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleFileChange} 
                           className="hidden" 
                           accept=".txt" 
                       />
                       <button 
                           onClick={handleImportClick}
                           className="flex items-center space-x-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-xs font-bold"
                       >
                           <Upload size={16} />
                           <span>导入</span>
                       </button>
                   </div>
                </div>

                {/* Notebook List */}
                <div className="flex-1 overflow-y-auto p-4">
                   {notebookItems.length === 0 ? (
                      <div className="text-center py-20 text-slate-400">
                         <BookMarked size={48} className="mx-auto mb-4 opacity-30" />
                         <p>笔记本为空</p>
                         <p className="text-xs mt-2 opacity-60">点击导入，或前往词书中心添加</p>
                         <div className="mt-6 flex flex-col space-y-2 items-center">
                            <button onClick={() => setIsBookStoreMode(true)} className="text-indigo-600 text-sm font-bold flex items-center"><LibraryBig size={16} className="mr-1"/> 前往词书中心</button>
                            <button onClick={handleImportClick} className="text-slate-500 text-xs font-medium hover:underline">导入文本文件 (.txt)</button>
                         </div>
                      </div>
                   ) : (
                      <div className="space-y-8 animate-fade-in">
                         {/* Vocabulary Row */}
                         {vocabItems.length > 0 && (
                            <div>
                               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center">
                                  <Anchor size={16} className="mr-2" />
                                  单词笔记 (Vocabulary) <span className="ml-2 bg-slate-200 text-slate-600 text-[10px] px-1.5 rounded-full">{vocabItems.length}</span>
                               </h3>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {vocabItems.map(renderNotebookItem)}
                               </div>
                            </div>
                         )}

                         {/* Grammar Row */}
                         {grammarItems.length > 0 && (
                            <div>
                               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center">
                                  <Puzzle size={16} className="mr-2" />
                                  语法笔记 (Grammar) <span className="ml-2 bg-slate-200 text-slate-600 text-[10px] px-1.5 rounded-full">{grammarItems.length}</span>
                               </h3>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {grammarItems.map(renderNotebookItem)}
                               </div>
                            </div>
                         )}
                      </div>
                   )}
                </div>

                {/* Expanded Modal/Overlay */}
                {expandedLibraryItem && (
                   <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setExpandedLibraryItem(null)}>
                      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden h-[85vh] sm:h-[650px] relative flex flex-col" onClick={e => e.stopPropagation()}>
                         <button onClick={() => setExpandedLibraryItem(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full z-20"><XCircle size={20}/></button>
                         <div className="flex-1 overflow-hidden">
                           <KnowledgeCard 
                              data={DICTIONARY[expandedLibraryItem]} 
                              interactive={false} 
                              isInNotebook={notebookIds.has(expandedLibraryItem)}
                              onToggleNotebook={toggleNotebook}
                           />
                         </div>
                      </div>
                   </div>
                )}
             </div>
        );

      default:
        return <Dashboard stats={MOCK_STATS} currentLevel={currentLevel} onLevelChange={handleLevelChange} levelProgress={levelProgress} />;
    }
  };

  // Determine if we are in an immersive learning mode
  const isImmersive = currentView === 'study_session' || currentView === 'test_mode' || currentView === 'study_story' || currentView === 'listening_practice' || currentView === 'speaking_practice';
  // Allow scrolling for standard views (Dashboard, Study Home, Notebook/Profile)
  const allowScroll = !isImmersive;
  
  // Show Search Bar only in specific standard views
  const shouldShowSearch = ['dashboard', 'study_home', 'notebook'].includes(currentView);

  return (
    <div className="flex flex-col h-full">
      <Layout 
        activeTab={currentView === 'notebook' ? 'notebook' : (currentView.startsWith('study') || currentView === 'test_mode' || currentView.includes('scenario') || currentView.includes('import') || currentView === 'listening_practice' || currentView === 'speaking_practice' ? 'study' : currentView)} 
        onTabChange={handleTabChange} 
        allowScroll={allowScroll}
        isImmersive={isImmersive}
      >
        {/* Search Bar - Positioned inside Layout Content for better spacing */}
        {shouldShowSearch && (
          <div className="mb-2 lg:mb-2">
            <SearchBar 
              query={searchQuery} 
              setQuery={setSearchQuery} 
              onSelect={handleSearchSelect} 
              suggestions={searchSuggestions}
            />
          </div>
        )}
        
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;
