
import React, { ReactNode } from 'react';
import { LayoutDashboard, GraduationCap, Layers, Menu, Settings, User, Zap, BookMarked, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  allowScroll?: boolean;
  isImmersive?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, allowScroll = true, isImmersive = false }) => {
  
  const DesktopNavItem = ({ id, icon: Icon, label }: any) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => onTabChange(id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
        className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden mb-2
          ${isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
          }`}
      >
        <div className="relative z-10 flex items-center w-full">
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'animate-pulse-once' : ''} />
          <span className={`ml-3 font-bold text-sm tracking-wide ${isActive ? 'text-white' : 'text-slate-600'}`}>
            {label}
          </span>
          {isActive && <ChevronRight size={16} className="ml-auto text-white/60" />}
        </div>
      </button>
    );
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar (Desktop) - Fixed position */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 h-full z-10 shadow-sm relative">
        <div className="p-8 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-md transform rotate-3">
             <span className="text-white font-extrabold text-sm tracking-widest">JO</span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">JOAI</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">Learning</span>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 overflow-y-auto no-scrollbar space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</div>
          <DesktopNavItem id="dashboard" icon={LayoutDashboard} label="主页" />
          <DesktopNavItem id="study" icon={Zap} label="学习" />
          <DesktopNavItem id="notebook" icon={BookMarked} label="笔记" />
        </nav>

        <div className="p-6 border-t border-slate-100 shrink-0">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group cursor-default">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <TargetIcon size={64} />
             </div>
             <p className="text-[10px] font-bold opacity-80 mb-2 uppercase tracking-wider">每日目标 Daily Goal</p>
             <div className="flex justify-between items-end mb-3">
                <span className="text-3xl font-black">85%</span>
                <span className="text-xs font-medium opacity-80 mb-1">Keep going!</span>
             </div>
             <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="bg-white h-full rounded-full w-[85%] shadow-sm"></div>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center h-16 transition-all duration-300">
         <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
               <span className="text-white font-bold text-xs">JO</span>
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight">JOAI</span>
         </div>
         <button 
           className="p-2.5 bg-slate-50 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
           onClick={() => onTabChange('profile')}
           aria-label="Profile"
         >
            <User size={22} />
         </button>
      </header>

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col h-screen pt-16 lg:pt-0 pb-24 lg:pb-0 relative bg-slate-50/50
          ${allowScroll ? 'overflow-y-auto no-scrollbar scroll-smooth' : 'overflow-hidden'}
        `}
      >
        {/* Desktop Top-Right Profile Access */}
        <div className="hidden lg:flex absolute top-6 right-8 z-50">
           <button 
             onClick={() => onTabChange('profile')} 
             className="flex items-center space-x-3 bg-white pl-1 pr-4 py-1 rounded-full border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
             title="个人中心"
           >
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <User size={18} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">My Profile</span>
           </button>
        </div>

        {/* 
           Padding Logic:
           - Immersive views (Test, Flashcards): p-0
           - Standard views: px-4 lg:px-8, but top padding is minimized (pt-0) to move content up
        */}
        <div className={`w-full max-w-7xl mx-auto flex flex-col ${allowScroll ? 'min-h-max' : 'h-full'} ${isImmersive ? 'p-0' : 'px-4 lg:px-8 pb-4 lg:pb-8 pt-0'}`}>
           {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 px-6 py-3 flex justify-between items-center z-50 h-[4.5rem]">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: '主页' },
          { id: 'study', icon: Zap, label: '学习' },
          { id: 'notebook', icon: BookMarked, label: '笔记' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center w-16 group focus:outline-none"
            >
              <div 
                className={`p-2.5 rounded-2xl transition-all duration-300 ease-out mb-1
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 -translate-y-4 scale-110' 
                    : 'text-slate-400 group-hover:text-slate-600 bg-transparent'
                  }`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span 
                className={`text-[10px] font-bold absolute -bottom-1 transition-all duration-300
                  ${isActive 
                    ? 'text-indigo-600 opacity-100 translate-y-0' 
                    : 'text-slate-400 opacity-0 translate-y-2'
                  }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Helper component for decoration
const TargetIcon = ({ size = 24 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
