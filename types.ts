

export enum Verdict {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export interface SkillAnalysis {
    skill: string;
    isPresent: boolean;
    explanation: string;
}

export interface AnalysisResult {
    relevanceScore: number;
    verdict: Verdict;
    summary: string;
    missingSkills: {
        mustHave: string[];
        niceToHave: string[];
    };
    improvementSuggestions: string[];
    alternativeRoles?: string[];
}

export interface AnalysisRecord {
    id: string;
    jobTitle: string;
    date: string;
    result: AnalysisResult;
}