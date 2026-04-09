
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { BookOpen, Zap, Trophy, Target, UserCircle, Smile, Activity, ChevronLeft, ChevronRight, Sparkles, Quote, Mountain, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { DailyStats, JLPTLevel } from '../types';
import { generateDailyQuote, DailyQuote } from '../services/geminiService';

interface DashboardProps {
  stats: DailyStats;
  currentLevel: JLPTLevel;
  onLevelChange: (level: JLPTLevel) => void;
  levelProgress: Record<JLPTLevel, number>;
}

// 1. Memory Retention Curve
const CURVE_DATA = [
  { name: '第1周', vocab: 20, grammar: 5, retention: 90 },
  { name: '第2周', vocab: 50, grammar: 12, retention: 88 },
  { name: '第3周', vocab: 100, grammar: 20, retention: 85 },
  { name: '第4周', vocab: 180, grammar: 35, retention: 92 },
  { name: '第5周', vocab: 250, grammar: 50, retention: 95 },
  { name: '第6周', vocab: 340, grammar: 70, retention: 94 },
];

// 2. Skill Analysis Radar
const RADAR_DATA = [
  { subject: '词汇', A: 120, fullMark: 150 },
  { subject: '语法', A: 98, fullMark: 150 },
  { subject: '阅读', A: 86, fullMark: 150 },
  { subject: '听力', A: 99, fullMark: 150 },
  { subject: '口语', A: 85, fullMark: 150 },
];

// 3. Satisfaction/Engagement Bar
const SATISFACTION_DATA = [
  { name: '专注度', value: 85, fill: '#6366f1' },
  { name: '趣味性', value: 92, fill: '#a855f7' },
  { name: '成就感', value: 78, fill: '#10b981' },
  { name: '效率', value: 88, fill: '#f59e0b' },
];

const StatCard = ({ icon: Icon, label, value, subLabel, color }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {subLabel && <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-full">{subLabel}</span>}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, currentLevel, onLevelChange, levelProgress }) => {
  const [chartIndex, setChartIndex] = useState<number>(0);
  const [quote, setQuote] = useState<DailyQuote | null>(null);

  useEffect(() => {
    // Randomly select a chart index
    setChartIndex(Math.floor(Math.random() * 3));
    
    // Fetch AI Quote
    generateDailyQuote().then(setQuote);
  }, []);

  const nextChart = () => setChartIndex((prev) => (prev + 1) % 3);
  const prevChart = () => setChartIndex((prev) => (prev - 1 + 3) % 3);

  const renderChart = () => {
    switch (chartIndex) {
      case 0: // Retention
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center lg:justify-start">
              <Target className="w-5 h-5 mr-2 text-indigo-500" />
              记忆曲线 (Memory Retention)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CURVE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="vocab" stroke="#6366f1" fillOpacity={1} fill="url(#colorVocab)" strokeWidth={3} name="已记单词" />
                  <Area type="monotone" dataKey="grammar" stroke="#10b981" fill="none" strokeWidth={3} name="已学语法" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 1: // Skill Radar
        return (
          <div className="animate-fade-in">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center lg:justify-start">
              <Activity className="w-5 h-5 mr-2 text-emerald-500" />
              能力六边形 (Skill Analysis)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="我的能力" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 2: // Satisfaction
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center lg:justify-start">
              <Smile className="w-5 h-5 mr-2 text-amber-500" />
              学习满意度 (Satisfaction)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SATISFACTION_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 500}} width={60} />
                   <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                   <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0]} animationDuration={1500}>
                     {SATISFACTION_DATA.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const levels: { id: JLPTLevel; label: string; desc: string; color: string }[] = [
    { id: 'N5', label: 'N5 入门', desc: '基础词汇', color: 'bg-emerald-500' },
    { id: 'N4', label: 'N4 初级', desc: '日常会话', color: 'bg-teal-500' },
    { id: 'N3', label: 'N3 中级', desc: '应用过渡', color: 'bg-sky-500' },
    { id: 'N2', label: 'N2 高级', desc: '商务学术', color: 'bg-indigo-500' },
    { id: 'N1', label: 'N1 精通', desc: '母语理解', color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col pb-12 animate-fade-in">
      
      {/* Header & AI Encouragement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
            <p className="text-slate-500 text-sm">欢迎回来，今日目标完成度 <span className="text-indigo-600 font-bold">85%</span></p>
        </div>
        
        {/* AI Quote Card */}
        <div className="lg:col-span-1">
           <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg">
              <Sparkles className="absolute top-2 right-2 text-white opacity-20 w-12 h-12" />
              <div className="flex items-center space-x-2 mb-2 opacity-80">
                 <Quote size={14} />
                 <span className="text-xs font-bold uppercase tracking-wider">AI Daily Encouragement</span>
              </div>
              {quote ? (
                <div className="animate-fade-in">
                   <p className="font-jp text-lg font-bold leading-relaxed mb-1">{quote.japanese}</p>
                   <p className="text-xs opacity-80 mb-2">{quote.reading}</p>
                   <p className="text-sm font-medium border-t border-white/20 pt-2">{quote.chinese}</p>
                </div>
              ) : (
                <div className="flex space-x-1 animate-pulse py-4">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                   <div className="w-2 h-2 bg-white rounded-full animation-delay-200"></div>
                   <div className="w-2 h-2 bg-white rounded-full animation-delay-400"></div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Switchable Chart Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
        <button 
          onClick={prevChart}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-indigo-600 transition-colors z-10 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextChart}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-indigo-600 transition-colors z-10 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>
        {renderChart()}
        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setChartIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${chartIndex === idx ? 'bg-indigo-500 w-4' : 'bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap} color="bg-amber-500" value={`${stats.streak} 天`} label="连续打卡" subLabel="历史最佳: 21"/>
        <StatCard icon={BookOpen} color="bg-blue-500" value={`${stats.totalDue} 个`} label="今日待复习" subLabel="含 3 个语法"/>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-2">
             <div className="p-3 rounded-xl bg-emerald-500 bg-opacity-10">
                <Target className="w-6 h-6 text-emerald-500" />
             </div>
             <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-full">New</span>
           </div>
           <div>
              <div className="flex items-baseline space-x-1">
                 <h3 className="text-2xl font-bold text-slate-800">{stats.newLearned}</h3>
                 <span className="text-xs text-slate-400">个新知识</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-2">
             <div className="p-3 rounded-xl bg-indigo-500 bg-opacity-10">
                <Trophy className="w-6 h-6 text-indigo-500" />
             </div>
             <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-full">{currentLevel}</span>
           </div>
           <div>
              <div className="flex justify-between items-end mb-1">
                 <h3 className="text-2xl font-bold text-slate-800">{levelProgress[currentLevel]}%</h3>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-indigo-500 h-full w-[45%] rounded-full"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
