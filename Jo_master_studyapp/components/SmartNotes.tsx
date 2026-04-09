
import React, { useState, useEffect } from 'react';
import { Mic, Send, FileText, MessageSquare, Sun, Loader2, Play, Pause, RefreshCw } from 'lucide-react';
import { SmartNote, CompiledDocs } from '../types';
import { processNoteContent, compileDocuments } from '../services/geminiService';

const SmartNotes: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [compiling, setCompiling] = useState(false);
  const [compiledDocs, setCompiledDocs] = useState<CompiledDocs | null>(null);
  const [activeTab, setActiveTab] = useState<'RESEARCH' | 'INTERVIEW'>('RESEARCH');

  // Speech Recognition Setup
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Actual stopping is handled by the recognition instance if we kept a ref, 
      // but simpler to just let user manually stop or rely on silence in this simple implementation.
      // For this demo, we assume the user clicks "Stop" to finish intent.
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("您的浏览器不支持语音识别。");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText(prev => prev + finalTranscript);
      }
    };

    recognition.start();
    // Stop after 10 seconds of silence or manual stop
    setTimeout(() => {
      if (isListening) recognition.stop();
    }, 30000); 
  };

  const handleAddNote = async () => {
    if (!inputText.trim()) return;
    setProcessing(true);
    
    const { category, tags } = await processNoteContent(inputText);
    
    const newNote: SmartNote = {
      id: Date.now().toString(),
      content: inputText,
      timestamp: new Date(),
      category,
      tags
    };

    setNotes(prev => [newNote, ...prev]);
    setInputText('');
    setProcessing(false);
  };

  const handleCompile = async () => {
    if (notes.length === 0) return;
    setCompiling(true);
    const result = await compileDocuments(notes);
    setCompiledDocs(result);
    setCompiling(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Left Panel: Input & History */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">智能语音笔记</h2>
          <p className="text-gray-500 text-sm">记录想法，自动生成研究计划</p>
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
          <textarea
            className="w-full p-3 bg-gray-50 rounded-lg border-none outline-none resize-none focus:ring-2 focus:ring-blue-100 transition-all"
            rows={4}
            placeholder="点击麦克风说话，或直接输入文字... (例如：关于老龄化对医疗AI的影响)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <button 
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Mic size={20} />
            </button>
            <button 
              onClick={handleAddNote}
              disabled={processing || !inputText.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>}
              添加笔记
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {notes.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>暂无笔记</p>
            </div>
          )}
          {notes.map(note => (
            <div key={note.id} className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium 
                  ${note.category === 'RESEARCH' ? 'bg-blue-100 text-blue-700' : 
                    note.category === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {note.category === 'RESEARCH' ? '研究计划' : note.category === 'INTERVIEW' ? '面试准备' : '生活随笔'}
                </span>
                <span className="text-xs text-gray-400">{note.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{note.content}</p>
              <div className="flex flex-wrap gap-1">
                {note.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Compiled Output */}
      <div className="w-full md:w-2/3 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('RESEARCH')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'RESEARCH' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={16} className="inline mr-1"/> 研究计划书草案
            </button>
            <button 
              onClick={() => setActiveTab('INTERVIEW')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'INTERVIEW' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <MessageSquare size={16} className="inline mr-1"/> 模拟面试脚本
            </button>
          </div>
          <button 
            onClick={handleCompile}
            disabled={compiling || notes.length === 0}
            className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-700 disabled:opacity-50"
          >
            {compiling ? <RefreshCw className="animate-spin" size={12}/> : <SparklesIcon />}
            生成文档
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          {!compiledDocs ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText size={48} className="mb-4 opacity-20"/>
              <p>添加笔记并点击“生成文档”以查看AI整理的结果</p>
            </div>
          ) : (
            <div className="prose max-w-none text-sm">
              {activeTab === 'RESEARCH' ? (
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800 bg-white p-8 shadow-sm rounded-lg min-h-[500px]">
                  {compiledDocs.researchPlan || "内容生成中..."}
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800 bg-white p-8 shadow-sm rounded-lg min-h-[500px]">
                  {compiledDocs.interviewScript || "内容生成中..."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

export default SmartNotes;
