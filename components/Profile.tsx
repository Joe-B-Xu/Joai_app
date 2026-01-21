import React from 'react';
import { User, Settings, LogOut, Award, Calendar, ChevronRight, Bell, Volume2, Shield, Clock, Zap, Target } from 'lucide-react';
import { JLPTLevel, DailyStats } from '../types';

interface ProfileProps {
  stats: DailyStats;
  currentLevel: JLPTLevel;
}

export const Profile: React.FC<ProfileProps> = ({ stats, currentLevel }) => {
  
  const MenuItem = ({ icon: Icon, label, value, onClick }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
    >
      <div className="flex items-center space-x-4">
         <div className="p-2 bg-slate-100 rounded-full text-slate-500">
            <Icon size={18} />
         </div>
         <span className="font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
         {value && <span className="text-sm text-slate-400">{value}</span>}
         <ChevronRight size={16} className="text-slate-300" />
      </div>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
      {/* User Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center space-x-5 mb-6">
        <div className="relative">
           <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <User size={36} />
           </div>
           <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
           <h2 className="text-2xl font-bold text-slate-800">Guest Student</h2>
           <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">ID: 8839201</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-xs text-slate-400">Joined Feb 2024</span>
           </div>
           <div className="flex mt-3 space-x-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                 {currentLevel} Learner
              </span>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg border border-amber-100">
                 Premium
              </span>
           </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-slate-500">
           <Settings size={24} />
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="text-indigo-500 mb-2"><Zap size={20}/></div>
            <span className="text-2xl font-bold text-slate-800">{stats.streak}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">连续打卡</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="text-emerald-500 mb-2"><CheckCircle size={20} /></div>
            <span className="text-2xl font-bold text-slate-800">{stats.reviewed}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">今日复习</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="text-blue-500 mb-2"><Target size={20}/></div>
            <span className="text-2xl font-bold text-slate-800">92%</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">正确率</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="text-purple-500 mb-2"><Clock size={20}/></div>
            <span className="text-2xl font-bold text-slate-800">12h</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">学习时长</span>
         </div>
      </div>

      {/* Menu Section 1 */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-6">
         <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Account Settings
         </div>
         <MenuItem icon={User} label="个人信息" value="已完善" />
         <MenuItem icon={Bell} label="消息通知" value="开启" />
         <MenuItem icon={Volume2} label="声音设置" />
         <MenuItem icon={Shield} label="隐私与安全" />
      </div>

      {/* Menu Section 2 */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-8">
         <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Support
         </div>
         <MenuItem icon={Award} label="我的成就" />
         <MenuItem icon={Calendar} label="学习计划" />
         <MenuItem icon={Clock} label="历史记录" />
      </div>

      {/* Sign Out */}
      <button className="w-full py-4 rounded-2xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2">
         <LogOut size={20} />
         <span>退出登录</span>
      </button>
      
      <p className="text-center text-xs text-slate-300 mt-6">Version 2.1.0 (Build 20240515)</p>
    </div>
  );
};

// Helper icon component import fix
import { CheckCircle } from 'lucide-react';