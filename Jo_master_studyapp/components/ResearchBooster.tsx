import React, { useState } from 'react';
import { FileText, Sparkles, AlertCircle, Check } from 'lucide-react';
import { optimizeResearchProposal } from '../services/geminiService';

const ResearchBooster: React.FC = () => {
  const [proposal, setProposal] = useState('');
  const [result, setResult] = useState<{ feedback: string; refinedText: string; issues: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimization = async () => {
    if (!proposal.trim()) return;
    setLoading(true);
    const data = await optimizeResearchProposal(proposal);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">科研效率加速器</h2>
        <p className="text-gray-500 text-sm">使用 AI 优化你的研究计划书</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Editor Side */}
        <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm p-4">
          <label className="text-sm font-bold text-gray-700 mb-2 flex justify-between">
            <span>研究计划书草稿</span>
            <span className="text-xs font-normal text-gray-400">支持日语或英语</span>
          </label>
          <textarea
            className="flex-1 p-4 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="在此粘贴你的研究目的、方法论和预期结果..."
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleOptimization}
              disabled={loading || !proposal}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <Sparkles className="animate-spin" size={18}/> : <Sparkles size={18}/>}
              {loading ? '优化中...' : '分析计划书'}
            </button>
          </div>
        </div>

        {/* Feedback Side */}
        <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm p-4 overflow-y-auto">
          <label className="text-sm font-bold text-gray-700 mb-2">AI 反馈与改进建议</label>
          
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
              <FileText size={48} className="mb-2 opacity-50"/>
              <p>提交草稿以查看分析结果</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-2 fade-in">
              
              {/* Critical Issues */}
              {result.issues.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <h4 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle size={16}/> 方法论 / 逻辑警报
                  </h4>
                  <ul className="list-disc ml-5 text-sm text-red-700 space-y-1">
                    {result.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Feedback */}
              <div>
                <h4 className="text-gray-800 font-bold text-sm mb-2">综合反馈</h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  {result.feedback}
                </p>
              </div>

              {/* Refined Text */}
              <div>
                <h4 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-2">
                  <Check size={16} className="text-green-600"/> 润色后的摘要 / 关键文本
                </h4>
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border font-mono">
                  {result.refinedText}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchBooster;