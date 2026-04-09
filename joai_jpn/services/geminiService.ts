
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KnowledgePoint, TestConfig, TestQuestion } from "../types";

// Mode specific instructions to guide the AI
const getSystemInstruction = (mode: 'vocab' | 'grammar' | 'all') => {
  const baseInstruction = `
You are an expert Japanese language tutor AI. 
Your goal is to generate engaging reading passages for Japanese learners.
Output MUST be valid JSON.
The translation MUST be in Simplified Chinese.
You MUST include at least 80% of the provided list in the story.
The content difficulty should target JLPT N3-N2 levels.

CRITICAL INSTRUCTION FOR QUIZ:
- You MUST generate EXACTLY 3 comprehension questions based on the story content.
- Questions should test understanding of context, nuance, or specific vocabulary/grammar usage within the story.
- Provide DETAILED explanations in Simplified Chinese for each answer, analyzing why the correct option is right and why distractors are wrong.
`;

  switch (mode) {
    case 'vocab':
      return `${baseInstruction}
      FOCUS: Vocabulary Retention.
      - Create a story where the provided VOCABULARY words are the key elements.
      - Use N3/N2 level sentence structures to support the vocabulary context.
      - Contextualize the words clearly.
      `;
    case 'grammar':
      return `${baseInstruction}
      FOCUS: Grammar Application.
      - Create a story that explicitly demonstrates the usage of the provided GRAMMAR patterns.
      - The story should feel like a textbook example but natural.
      - Highlight how the grammar connects sentences or nuances.
      `;
    case 'all':
    default:
      return `${baseInstruction}
      FOCUS: Comprehensive Synthesis.
      - Create a natural, flowing narrative suitable for N3-N2 learners.
      - Seamlessly weave both Vocabulary and Grammar together.
      - Usage should be idiomatic and real-world.
      `;
  }
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short title in Japanese" },
    body: { type: Type.STRING, description: "The Japanese text content. Wrap the specific target vocabulary and grammar used in <b></b> tags for highlighting." },
    translation: { type: Type.STRING, description: "Natural Simplified Chinese translation of the story" },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "A comprehension question in Japanese" },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
          answer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
          explanation: { type: Type.STRING, description: "Detailed explanation in Simplified Chinese why the answer is correct." }
        }
      }
    }
  },
  required: ["title", "body", "translation", "quiz"]
};

export const generateStudyContent = async (items: KnowledgePoint[], mode: 'vocab' | 'grammar' | 'all') => {
  // NOTE: In a real app, API_KEY comes from process.env. 
  // For this demo, we assume it's injected.
  // If no key is present, we return a fallback mock to prevent app crash during UI review.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("No API Key found. Returning mock content.");
    // Simulate network delay for realism in mock mode
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockGeneratedContent(items, mode);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const promptList = items.map(item => {
      return item.type === 'vocab' 
        ? `[Vocab] ${item.surface_jp} (${item.meaning_zh})`
        : `[Grammar] ${item.form_jp} (${item.meaning_zh})`;
    }).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `Create a story using these items:\n${promptList}\n\nEnsure the story is suitable for N3-N2 level learners. Generate exactly 3 comprehension questions with detailed Chinese explanations.` }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(mode),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    if (response.text) {
      let text = response.text;
      // Defensive parsing: Remove markdown code blocks if present
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(text);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini generation failed", error);
    return getMockGeneratedContent(items, mode);
  }
};

const getMockGeneratedContent = (items: KnowledgePoint[], mode: string) => {
  // Simple Mock fallback based on mode for demo purposes
  const titleMap: Record<string, string> = {
    vocab: "単語の記憶",
    grammar: "文法の練習",
    all: "締め切り前のオフィス"
  };

  return {
    title: titleMap[mode] || "学習ストーリー",
    body: `今日はプロジェクトの<b>提出</b>日だ。部長の指示<b>に従って</b>、全員が忙しく働いている。時間の<b>短縮</b>のために、昼食もデスクで食べた。残業<b>に対して</b>不満を持つ人もいるが、今日だけは協力しなければならない。`,
    translation: "今天是项目的提交日。按照部长的指示，大家都在忙碌地工作。为了缩短时间，午饭也是在办公桌上吃的。虽然有人对加班感到不满，但只有今天必须通力合作。",
    quiz: [
      {
        question: "なぜみんな忙しく働いていますか？",
        options: ["給料日前だから", "プロジェクトの提出日だから", "部長が怒っているから", "新しい人が来たから"],
        answer: 1,
        explanation: "原文提到“今日はプロジェクトの提出日だ”（今天是项目提交日），因此大家都很忙碌。"
      },
      {
        question: "昼食はどこで食べましたか？",
        options: ["食堂で", "レストランで", "デスクで", "家で"],
        answer: 2,
        explanation: "原文明确写道“昼食もデスクで食べた”（午饭也是在桌子上吃的）。"
      },
      {
        question: "残業についてどう思っている人がいますか？",
        options: ["楽しい", "不満だ", "嬉しい", "興味がない"],
        answer: 1,
        explanation: "原文提到“残業に対して不満を持つ人もいる”（也有人对加班感到不满）。"
      }
    ]
  };
};

// --- New Feature: AI Daily Encouragement ---

const QUOTE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    japanese: { type: Type.STRING, description: "The quote in Japanese" },
    reading: { type: Type.STRING, description: "Hiragana reading" },
    chinese: { type: Type.STRING, description: "Chinese translation" },
    author: { type: Type.STRING, description: "Author or source (optional)" }
  },
  required: ["japanese", "reading", "chinese"]
};

export interface DailyQuote {
  japanese: string;
  reading: string;
  chinese: string;
  author?: string;
}

export const generateDailyQuote = async (): Promise<DailyQuote> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return {
      japanese: "千里の道も一歩から。",
      reading: "せんりのみちもいっぽから",
      chinese: "千里之行，始于足下。",
      author: "老子"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: "Generate a short, inspiring quote for a Japanese learner." }] },
      config: {
        systemInstruction: "You are a motivating Japanese tutor. Provide a famous proverb, idiom, or inspiring short sentence.",
        responseMimeType: "application/json",
        responseSchema: QUOTE_SCHEMA,
        temperature: 1.0, 
      },
    });

    if (response.text) {
       let text = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
       return JSON.parse(text);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Quote generation failed", error);
    return {
      japanese: "継続は力なり。",
      reading: "けいぞくはちからなり",
      chinese: "坚持就是力量。",
    };
  }
};

// --- TEST MODE GENERATION ---

const TEST_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['vocab_fill', 'grammar_form', 'cloze'] },
          questionText: { type: Type.STRING, description: "Japanese sentence with '______' for blank" },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING, description: "Detailed Chinese explanation" },
          relatedConcept: { type: Type.STRING, description: "The specific grammar point or vocabulary word being tested" }
        }
      }
    }
  },
  required: ["questions"]
};

export const generateTestQuestions = async (config: TestConfig): Promise<TestQuestion[]> => {
  const apiKey = process.env.API_KEY;
  const mockQuestions: TestQuestion[] = [
    {
      id: "q1", type: "grammar_form",
      questionText: "どんなに忙しくても、授業だけは休ま______。",
      options: ["ないつもりだ", "ないことにする", "ないわけにはいかない", "ないはずがない"],
      correctIndex: 2,
      explanation: "表示由于某种义务或客观情况而‘不能不……’、‘不得不……’。虽然很忙，但也不能翘课。",
      relatedConcept: "～わけにはいかない"
    },
    {
       id: "q2", type: "vocab_fill",
       questionText: "授業の______はレポートの提出で評価される。",
       options: ["成績", "生活", "気分", "規則"],
       correctIndex: 0,
       explanation: "‘成績（せいせき）’符合语境。上课的成绩通过提交报告来评价。",
       relatedConcept: "成績"
    }
  ];

  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockQuestions;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct Prompt based on Config
    let focusInstruction = "";
    if (config.type === 'vocab') focusInstruction = "Focus heavily on Vocabulary selection (Noun/Verb nuances).";
    else if (config.type === 'grammar') focusInstruction = "Focus heavily on Grammar forms, conjugation, and particles.";
    else focusInstruction = "Mix of Vocabulary selection and Grammar structure questions.";

    let styleInstruction = "";
    if (config.target === 'EJU') styleInstruction = "Style: EJU Academic Japanese. Topics: University life, lectures, reports, social issues.";
    else styleInstruction = "Style: JLPT Standard. Topics: General life, business, abstract concepts.";

    const prompt = `Generate ${config.questionCount} multiple-choice questions for a Japanese test.
    Level: ${config.level}
    ${focusInstruction}
    ${styleInstruction}
    
    IMPORTANT Rules:
    1. Each question MUST be a single Japanese sentence with a blank '______'.
    2. Provide 4 options.
    3. Distractors (wrong answers) must be plausible (same part of speech, similar kanji, or confusing grammar).
    4. Provide a clear explanation in Simplified Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: TEST_SCHEMA,
        temperature: 0.8,
      },
    });

    if (response.text) {
      let text = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(text);
      return parsed.questions;
    }
    return mockQuestions;
  } catch (error) {
    console.error("Test generation failed", error);
    return mockQuestions;
  }
};
