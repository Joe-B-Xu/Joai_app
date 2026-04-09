
import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { AnalysisResult, StudyPlan, SmartNote, CompiledDocs } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check for API key
const checkApiKey = () => {
  if (!apiKey) {
    console.error("API Key is missing. AI features will not work.");
    return false;
  }
  return true;
};

export const assessBackgroundFit = async (
  background: string,
  targetMajor: string
): Promise<AnalysisResult> => {
  if (!checkApiKey()) return mockAnalysisResult;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `用户背景: ${background}. 目标专业: ${targetMajor}. 
      评估匹配得分 (0-100), 识别优势, 劣势 (知识缺口), 以及具体建议 (书籍/课程). 请用简体中文回答。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("AI Error:", error);
    return mockAnalysisResult;
  }
};

export const optimizeResearchProposal = async (
  proposalText: string
): Promise<{ feedback: string; refinedText: string; issues: string[] }> => {
  if (!checkApiKey()) return { feedback: "API Key Missing", refinedText: "", issues: [] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `分析这份申请日本研究生的研究计划书草稿。
      识别方法论问题，检查逻辑流畅度，并提供语言改进建议。
      草稿内容: "${proposalText}"
      请用简体中文回答。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING, description: "总体建设性反馈" },
            refinedText: { type: Type.STRING, description: "摘要或引言的润色版本" },
            issues: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "具体的方法论或逻辑缺陷列表" 
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Error:", error);
    return {
      feedback: "分析计划书失败，请重试。",
      refinedText: "",
      issues: ["连接 AI 服务出错"],
    };
  }
};

export const generateStudyPlan = async (
  targetSchool: string,
  currentLevel: string
): Promise<StudyPlan> => {
  if (!checkApiKey()) return mockStudyPlan;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `为申请 ${targetSchool} 创建一个学习计划。
      学生当前水平: ${currentLevel}.
      包括时间轴阶段, 具体任务 (语言, 研究, 备考), 并分类为 'must' (必须) 或 'recommended' (推荐)。
      请用简体中文回答。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deadline: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["must", "recommended"] },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as StudyPlan;
  } catch (error) {
    console.error("AI Error:", error);
    return mockStudyPlan;
  }
};

export const processNoteContent = async (
  content: string
): Promise<{ category: 'RESEARCH' | 'INTERVIEW' | 'LIFE'; tags: string[] }> => {
  if (!checkApiKey()) return { category: 'LIFE', tags: ['Mock Tag'] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `分析以下笔记内容，将其归类为 "RESEARCH" (研究计划相关), "INTERVIEW" (面试练习相关), 或 "LIFE" (日本生活相关)。并提取2-3个关键词标签。
      
      笔记: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["RESEARCH", "INTERVIEW", "LIFE"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return { category: 'LIFE', tags: ['Error'] };
  }
};

export const compileDocuments = async (
  notes: SmartNote[]
): Promise<CompiledDocs> => {
  if (!checkApiKey()) return { researchPlan: "API Key Missing", interviewScript: "API Key Missing" };

  const researchNotes = notes.filter(n => n.category === 'RESEARCH').map(n => n.content).join('\n');
  const interviewNotes = notes.filter(n => n.category === 'INTERVIEW').map(n => n.content).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `根据以下笔记生成文档。
      
      研究相关笔记:
      ${researchNotes}
      
      面试相关笔记:
      ${interviewNotes}
      
      请生成:
      1. 一份结构化的研究计划草案 (包括题目, 背景, 方法)。
      2. 一份模拟面试问答脚本 (Q&A 形式)。
      请用简体中文回答。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            researchPlan: { type: Type.STRING },
            interviewScript: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return { researchPlan: "生成失败", interviewScript: "生成失败" };
  }
};


// MOCK FALLBACKS
const mockAnalysisResult: AnalysisResult = {
  score: 75,
  strengths: ["数学基础扎实", "本科学位相关性高"],
  weaknesses: ["日语能力不足 (需达到 N2)", "目标细分领域无科研经历"],
  recommendations: ["备考 JLPT N2", "阅读《高级算法导论》", "复习线性代数"],
};

const mockStudyPlan: StudyPlan = {
  timeline: [
    { phase: "基础夯实", tasks: ["完成 JLPT N2", "复习微积分"], deadline: "3个月", type: "must" },
    { phase: "研究准备", tasks: ["联系教授", "起草研究计划书"], deadline: "1个月", type: "must" },
  ]
};
