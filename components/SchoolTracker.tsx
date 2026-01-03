import React from 'react';
import { School, User, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { Professor } from '../types';

const MOCK_SCHOOLS = [
  { id: 'utokyo', name: 'University of Tokyo', school: 'School of Information Science', deadline: '2024-08-01' },
  { id: 'kyodai', name: 'Kyoto University', school: 'Graduate School of Informatics', deadline: '2024-07-20' },
  { id: 'titech', name: 'Tokyo Tech', school: 'School of Computing', deadline: '2024-06-15' },
];

const MOCK_PROFESSORS: Professor[] = [
  { id: 'p1', name: 'Dr. Tanaka', universityId: 'utokyo', researchArea: 'AI / 视觉', acceptanceRate: 'High', riskLevel: 'None', internationalFriendly: true },
  { id: 'p2', name: 'Dr. Sato', universityId: 'utokyo', researchArea: '系统架构', acceptanceRate: 'Medium', riskLevel: 'Sabbatical', internationalFriendly: false },
  { id: 'p3', name: 'Dr. Suzuki', universityId: 'kyodai', researchArea: '机器人', acceptanceRate: 'Low', riskLevel: 'RetiringSoon', internationalFriendly: true },
];

const SchoolTracker: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">院校情报追踪</h2>
        <p className="text-gray-500 text-sm">监控申请截止日期和教授动态</p>
      </div>

      {/* Schools Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SCHOOLS.map(school => (
          <div key={school.id} className="bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <School size={80} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-gray-800">{school.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">Rank A</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{school.school}</p>
            <div className="flex items-center gap-2 text-sm text-amber-600 font-medium bg-amber-50 p-2 rounded">
              <Calendar size={16} />
              截止日期: {school.deadline}
            </div>
            <button className="mt-4 w-full py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
              查看招生简章 <ExternalLink size={14}/>
            </button>
          </div>
        ))}
      </div>

      {/* Lab / Professor Updates */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2"><User size={18}/> 教授与实验室情报</h3>
          <span className="text-xs text-gray-400">更新时间: 今天</span>
        </div>
        <div className="divide-y">
          {MOCK_PROFESSORS.map(prof => (
            <div key={prof.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  {prof.name.charAt(4)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{prof.name}</h4>
                  <p className="text-sm text-gray-500">{prof.researchArea} • {MOCK_SCHOOLS.find(s => s.id === prof.universityId)?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                 {/* Status Badges */}
                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                  prof.acceptanceRate === 'High' ? 'bg-green-50 text-green-700 border-green-200' : 
                  prof.acceptanceRate === 'Low' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  接收率: {prof.acceptanceRate}
                </span>

                {prof.riskLevel !== 'None' && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                    <AlertTriangle size={12}/>
                    {prof.riskLevel === 'RetiringSoon' ? '即将退休' : '学术休假 (Sabbatical)'}
                  </span>
                )}

                {prof.internationalFriendly && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    留学生友好
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchoolTracker;