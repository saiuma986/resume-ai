import type { AnalysisResult, AnalysisRecord } from '../types';

const HISTORY_KEY = 'nextHireAnalysisHistory';

export const getHistory = (): AnalysisRecord[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        if (!historyJson) return [];
        const history = JSON.parse(historyJson);
        // Basic validation
        if (Array.isArray(history)) {
            return history;
        }
        return [];
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        return [];
    }
};

export const saveAnalysis = (jobTitle: string, result: AnalysisResult): void => {
    const history = getHistory();
    const newRecord: AnalysisRecord = {
        id: new Date().toISOString(),
        jobTitle,
        date: new Date().toLocaleString(),
        result,
    };
    const updatedHistory = [newRecord, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const clearHistory = (): void => {
    localStorage.removeItem(HISTORY_KEY);
};
