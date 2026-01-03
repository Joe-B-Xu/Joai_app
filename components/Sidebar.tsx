
import React from 'react';
import { View } from '../types';
import { Compass, GraduationCap, Microscope, CalendarClock, Settings, Mic } from 'lucide-react';

interface Props {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<Props> = ({ currentView, setView }) => {
  const menuItems = [
    { id: View.MAJOR_SELECTION, label: '专业选择', icon: Compass },
    { id: View.SCHOOL_TRACKER, label: '院校追踪', icon: GraduationCap },
    { id: View.RESEARCH_BOOSTER, label: '科研辅助', icon: Microscope },
    { id: View.STUDY_PLANNER, label: '备考规划', icon: CalendarClock },
    { id: View.SMART_NOTES, label: '智能笔记', icon: Mic },
  ];

  return (
    <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-slate-700">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">S</div>
        <span className="font-bold text-xl hidden lg:block">Shingaku</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative ${
              currentView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium hidden lg:block">{item.label}</span>
            {/* Tooltip for mobile/collapsed state */}
            <span className="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings size={22} />
          <span className="font-medium hidden lg:block">设置</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
