
export enum View {
  MAJOR_SELECTION = 'MAJOR_SELECTION',
  SCHOOL_TRACKER = 'SCHOOL_TRACKER',
  RESEARCH_BOOSTER = 'RESEARCH_BOOSTER',
  STUDY_PLANNER = 'STUDY_PLANNER',
  SMART_NOTES = 'SMART_NOTES',
}

export interface Major {
  id: string;
  nameJP: string;
  nameCN: string;
  description: string;
  misconceptions: string[];
  prospects: {
    academic: number; // 0-100
    career: number;   // 0-100
    difficulty: number; // 0-100
  };
  researchAreas: ResearchNode;
}

export interface ResearchNode {
  name: string;
  description?: string;
  children?: ResearchNode[];
}

export interface University {
  id: string;
  name: string;
  rank: number;
  location: string;
}

export interface Professor {
  id: string;
  name: string;
  universityId: string;
  researchArea: string;
  acceptanceRate: 'High' | 'Medium' | 'Low';
  riskLevel: 'None' | 'Sabbatical' | 'RetiringSoon';
  internationalFriendly: boolean;
}

export interface StudyPlan {
  timeline: {
    phase: string;
    tasks: string[];
    deadline: string;
    type: 'must' | 'recommended';
  }[];
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SmartNote {
  id: string;
  content: string;
  timestamp: Date;
  category: 'RESEARCH' | 'INTERVIEW' | 'LIFE' | 'UNCATEGORIZED';
  tags: string[];
}

export interface CompiledDocs {
  researchPlan: string;
  interviewScript: string;
}
