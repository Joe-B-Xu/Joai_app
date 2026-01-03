import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Search, Brain, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Major, AnalysisResult } from '../types';
import ResearchTree from './ResearchTree';
import { assessBackgroundFit } from '../services/geminiService';

const MOCK_MAJORS: Major[] = [
  {
    id: 'cs',
    nameJP: '情報理工学 (Information Science)',
    nameCN: '计算机科学 / 信息工程',
    description: '专注于高级计算、人工智能和系统架构。在日本，这通常属于“信息理工学”研究科。',
    misconceptions: ['不仅仅是写代码；日本非常重视数学基础。', '与文科的“社会情报学”不同。'],
    prospects: { academic: 90, career: 95, difficulty: 85 },
    researchAreas: {
      name: "Computer Science",
      children: [
        { name: "AI & Machine Learning", children: [{ name: "Computer Vision" }, { name: "NLP" }] },
        { name: "Systems", children: [{ name: "OS" }, { name: "Distributed Systems" }] }
      ]
    }
  },
  {
    id: 'econ',
    nameJP: '経済学 (Economics)',
    nameCN: '经济学',
    description: '传统经济学。注意日本的学术研究导向（经济学研究科）与MBA（经营学）有很大区别。',
    misconceptions: ['即使是英语项目也需要较高的日语水平。', '数学要求正在提高。'],
    prospects: { academic: 80, career: 85, difficulty: 70 },
    researchAreas: {
      name: "Economics",
      children: [
        { name: "Microeconomics", children: [{ name: "Game Theory" }] },
        { name: "Macroeconomics" },
        { name: "Econometrics" }
      ]
    }
  }
];

const MajorSelection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [userBackground, setUserBackground] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredMajors = MOCK_MAJORS.filter(m => 
    m.nameJP.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nameCN.includes(searchTerm)
  );

  const handleAnalyze = async () => {
    if (!selectedMajor || !userBackground) return;
    setLoading(true);
    const result = await assessBackgroundFit(userBackground, selectedMajor.nameJP);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">专业智能匹配</h2>
          <p className="text-gray-500 text-sm">利用 AI 洞察找到最适合你的升学路径</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索专业 (例如: Computer Science, 経済学)"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Majors */}
        <div className="lg:col-span-1 space-y-4">
          {filteredMajors.map(major => (
            <div 
              key={major.id}
              onClick={() => { setSelectedMajor(major); setAnalysis(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedMajor?.id === major.id ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <h3 className="font-bold text-gray-800">{major.nameJP}</h3>
              <p className="text-sm text-gray-500">{major.nameCN}</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">难度: {major.prospects.difficulty}</span>
                <span className="px-2 py-1 bg-green-100 rounded text-green-700">就业: {major.prospects.career}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMajor ? (
            <>
              {/* Top Overview */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{selectedMajor.nameJP}</h3>
                    <p className="text-gray-600 mb-4">{selectedMajor.description}</p>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-sm text-amber-900 mb-4">
                      <strong>常见误区:</strong>
                      <ul className="list-disc ml-4 mt-1">
                        {selectedMajor.misconceptions.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="w-full md:w-64 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: '学术', A: selectedMajor.prospects.academic, fullMark: 100 },
                        { subject: '就业', A: selectedMajor.prospects.career, fullMark: 100 },
                        { subject: '难度', A: selectedMajor.prospects.difficulty, fullMark: 100 },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name={selectedMajor.nameJP} dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Research Tree */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><BookOpen size={18}/> 研究领域与架构</h4>
                <ResearchTree data={selectedMajor.researchAreas} />
              </div>

              {/* Fit Assessment */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Brain size={18}/> 背景匹配度评估</h4>
                {!analysis ? (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      rows={4}
                      placeholder="请描述你的背景：专业、GPA、已修课程（如线性代数）、语言成绩等..."
                      value={userBackground}
                      onChange={(e) => setUserBackground(e.target.value)}
                    />
                    <button 
                      onClick={handleAnalyze}
                      disabled={loading || !userBackground}
                      className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {loading ? '分析中...' : '开始评估'}
                    </button>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-bottom-2 fade-in">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-16 w-16 flex items-center justify-center rounded-full border-4 border-blue-500 text-blue-800 font-bold text-xl">
                        {analysis.score}
                      </div>
                      <div>
                        <h5 className="font-bold">匹配度得分</h5>
                        <p className="text-sm text-gray-500">基于你输入的信息</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h6 className="text-green-800 font-bold text-sm mb-2 flex items-center gap-1"><CheckCircle size={14}/> 优势</h6>
                        <ul className="text-sm text-green-700 list-disc ml-4 space-y-1">
                          {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h6 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-1"><AlertCircle size={14}/> 差距/不足</h6>
                        <ul className="text-sm text-red-700 list-disc ml-4 space-y-1">
                          {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="text-gray-700 font-bold text-sm mb-2">建议</h6>
                      <div className="flex flex-wrap gap-2">
                        {analysis.recommendations.map((rec, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{rec}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setAnalysis(null)} className="mt-4 text-sm text-primary underline">重新评估</button>
                  </div>
                )}
              </div>

            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              请选择一个专业查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MajorSelection;