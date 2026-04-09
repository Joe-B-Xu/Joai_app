
import React, { useState } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import MajorSelection from './components/MajorSelection';
import SchoolTracker from './components/SchoolTracker';
import ResearchBooster from './components/ResearchBooster';
import StudyPlanner from './components/StudyPlanner';
import SmartNotes from './components/SmartNotes';
import { Bell, Search } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.MAJOR_SELECTION);

  const renderView = () => {
    switch (currentView) {
      case View.MAJOR_SELECTION: return <MajorSelection />;
      case View.SCHOOL_TRACKER: return <SchoolTracker />;
      case View.RESEARCH_BOOSTER: return <ResearchBooster />;
      case View.STUDY_PLANNER: return <StudyPlanner />;
      case View.SMART_NOTES: return <SmartNotes />;
      default: return <MajorSelection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} setView={setCurrentView} />

      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-white border-b sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
          <div className="text-gray-400 hidden sm:block">
            {/* Breadcrumb-like text or just welcome message */}
            <span className="text-sm">欢迎回来，同学</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="全局搜索..." 
                 className="pl-10 pr-4 py-2 text-sm bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary outline-none w-64 transition-all"
               />
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs cursor-pointer">
              JD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
