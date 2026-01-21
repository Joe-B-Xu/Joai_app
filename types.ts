
export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export interface Example {
  jp: string;
  zh: string;
}

// Base interface for UI consistency
export interface BaseKnowledgePoint {
  id: number;
  level: JLPTLevel;
  jlpt_level_raw?: string; 
  tag_freq?: string; 
  is_eju?: boolean; // New: EJU High Frequency Tag
  scenario?: 'life' | 'academic' | 'business'; // New: Usage Scenario
  meaning_zh: string;
  meaning_jp?: string;
  examples: Example[];
}

export interface VocabCard extends BaseKnowledgePoint {
  type: 'vocab';
  surface_jp: string;
  reading: string;
  pos: string;
  meaning_zh_detail?: string;
}

export interface GrammarCard extends BaseKnowledgePoint {
  type: 'grammar';
  form_jp: string;
  pattern_jp: string;
  notes_zh?: string;
}

export type KnowledgePoint = VocabCard | GrammarCard;

// Sentence Card Structure
export interface SentenceSegment {
  text: string;
  linkedItemId?: number; // If present, this segment is interactive (Vocab/Grammar)
  type?: 'vocab' | 'grammar';
}

export interface Sentence {
  id: number;
  original: string; // Full Japanese Text
  translation: string;
  scenario: 'life' | 'academic' | 'business'; // "留学生活" | "课业报告"
  segments: SentenceSegment[]; // Parsed for highlighting
  targetIds: number[]; // IDs of KnowledgePoints contained in this sentence
}

export interface DailyStats {
  reviewed: number;
  newLearned: number;
  streak: number;
  totalDue: number;
}

export interface GeneratedContent {
  title: string;
  body: string;
  translation: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

// --- NEW: Test Mode Types ---

export interface TestConfig {
  target: 'JLPT' | 'EJU';
  level: JLPTLevel;
  type: 'vocab' | 'grammar' | 'mixed';
  durationMinutes: number; // 10, 20, or custom
  questionCount: number;
}

export interface TestQuestion {
  id: string;
  type: 'vocab_fill' | 'grammar_form' | 'cloze'; // Specific question types
  questionText: string; // The sentence with a blank usually
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedConcept?: string; // e.g. "～に対して" or "Passive Voice"
}

export interface TestResult {
  score: number;
  total: number;
  timeSpentSeconds: number;
  correctIds: string[];
  wrongIds: string[];
  questions: TestQuestion[];
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
}

// --- NEW: Life Scenario Template ---
export type TrainingMode = 'reading' | 'listening' | 'speaking';

export interface ScenarioKeyword {
  id: number; // Mock ID for tracking
  jp: string;
  kana: string;
  zh: string;
  type: 'vocab' | 'grammar';
  tags: TrainingMode[]; // Filters for specific modes
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  iconId: 'home' | 'hospital' | 'work' | 'mail';
  goal: string;
  color: string;
  keywords: ScenarioKeyword[];
  followUp: string[];
}

// --- NEW: Listening Practice Types ---
export interface ListeningCategory {
  id: string;
  name: string;
  type: 'question_type' | 'topic'; // EJU Type or Topic
  count: number;
  accuracy: number; // 0-100
  color: string;
}

export interface ListeningScriptLine {
  id: number;
  text: string;
  translation: string;
  keywords: number[]; // IDs of KnowledgePoints in DICTIONARY
}

export interface ListeningExercise {
  id: number;
  title: string;
  categoryIds: string[];
  level: JLPTLevel;
  audioText: string; // For TTS simulation
  summaryQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  script: ListeningScriptLine[];
}

// --- NEW: Speaking Practice Types ---
export type SpeakingMode = 'shadowing' | 'drill' | 'roleplay';

export interface ShadowingItem {
  id: number;
  text: string;
  translation: string;
  audioUrl?: string; // Simulated TTS
  focusPoints: string[]; // e.g. "Pitch Accent on 箸", "Pausing after は"
}

export interface PatternDrill {
  id: number;
  skeleton: string; // e.g. "X は Y に違いない"
  grammarPoint: string;
  variations: {
    cue: string; // e.g. "彼 / 犯人"
    expected: string; // "彼は犯人に違いない"
  }[];
}

export interface RoleplayScenario {
  id: number;
  title: string;
  context: string;
  aiFirstMessage: string;
  mission: {
    vocabIds: number[];
    grammarIds: number[];
  };
  expectedIntent: string;
}
