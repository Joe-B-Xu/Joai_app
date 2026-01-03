import React, { useState } from 'react';
import { Calendar, CheckSquare, ArrowRight, Clock } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';
import { StudyPlan } from '../types';

const StudyPlanner: React.FC = () => {
  const [target, setTarget] = useState('');
  const [level, setLevel] = useState('');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!target || !level) return;
    setLoading(true);
    const data = await generateStudyPlan(target, level);
    setPlan(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">个性化备考规划</h2>
        <p className="text-gray-500 text-sm">根据你的现状生成时间轴与策略</p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">目标院校 / 实验室</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            placeholder="例如: 东京大学 信息理工"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">当前状态</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            placeholder="例如: JLPT N3, 托福 80, 无研究计划书"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !target || !level}
          className="bg-accent text-white font-bold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors w-full md:w-auto h-[42px]"
        >
          {loading ? '生成中...' : '生成计划'}
        </button>
      </div>

      {/* Timeline View */}
      {plan && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Calendar className="text-primary"/> 建议时间轴
          </h3>
          
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
            {plan.timeline.map((item, index) => (
              <div key={index} className="relative pl-8">
                {/* Dot */}
                <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 ${item.type === 'must' ? 'bg-red-500 border-red-500' : 'bg-white border-gray-400'}`}></div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg">{item.phase}</h4>
                    <ul className="mt-2 space-y-2">
                      {item.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <CheckSquare size={16} className="mt-0.5 text-gray-400"/>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="sm:text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                      <Clock size={12}/> {item.deadline}
                    </span>
                    {item.type === 'must' && (
                      <div className="mt-2">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">关键阶段</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="relative pl-8 pb-2">
               <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-500 border-2 border-green-500"></div>
               <h4 className="font-bold text-gray-800">提交申请</h4>
            </div>
          </div>
        </div>
      )}

      {!plan && !loading && (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
          <ArrowRight className="mx-auto mb-2 opacity-50" size={32}/>
          <p>在上方输入你的信息以生成备考策略</p>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;