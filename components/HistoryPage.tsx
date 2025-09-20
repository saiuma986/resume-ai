import React, { useState, useEffect } from 'react';
import type { AnalysisRecord } from '../types';
import { getHistory, clearHistory } from '../services/historyService';
import { Modal } from './Modal';
import { ResultsDisplay } from './ResultsDisplay';
import { TrashIcon, BarChartIcon, ArrowRightIcon } from './Icons';
import { Verdict } from '../types';

interface HistoryPageProps {
  onNavigateToAnalysis: () => void;
  onNavigateHome: () => void;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = (s: number) => {
        if (s >= 75) return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200';
        if (s >= 50) return 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200';
        return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200';
    };
    return (
        <span className={`font-bold text-sm px-2.5 py-1 rounded-full ${getScoreColor(score)}`}>
            {score}
        </span>
    );
};

const VerdictBadge: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
     const verdictConfig = {
        [Verdict.HIGH]: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200',
        [Verdict.MEDIUM]: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200',
        [Verdict.LOW]: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200',
    };
    return (
         <span className={`text-xs font-semibold px-2 py-0.5 rounded ${verdictConfig[verdict]}`}>
            {verdict.toUpperCase()}
        </span>
    );
};

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToAnalysis, onNavigateHome }) => {
    const [history, setHistory] = useState<AnalysisRecord[]>([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleClearHistory = () => {
        clearHistory();
        setHistory([]);
    };

    if (history.length === 0) {
        return (
            <div className="text-center animate-fade-in py-10 md:py-20 max-w-2xl mx-auto">
                 <div className="mx-auto w-20 h-20 bg-neutral-200 rounded-2xl flex items-center justify-center mb-6">
                    <BarChartIcon className="h-10 w-10 text-neutral-400" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-800 mb-2">No Analysis History</h1>
                <p className="text-neutral-600 mb-6">
                    You haven't analyzed any resumes yet. Start by analyzing a resume to see your history here.
                </p>
                <button
                    onClick={onNavigateToAnalysis}
                    className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary-200 flex items-center mx-auto"
                >
                    Analyze First Resume <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button 
                onClick={onNavigateHome} 
                className="text-primary-600 hover:text-primary-800 font-semibold text-sm flex items-center group mb-4"
            >
                <span className="transform transition-transform group-hover:-translate-x-1 mr-1">&larr;</span> Back to Home
            </button>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-neutral-800">Analysis History</h1>
                <button
                    onClick={handleClearHistory}
                    className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors"
                >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Clear History
                </button>
            </div>

            <div className="space-y-4">
                {history.map(record => (
                    <div 
                        key={record.id} 
                        onClick={() => setSelectedAnalysis(record)}
                        className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-200/80 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary-300 hover:-translate-y-1"
                    >
                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-3 sm:mb-0">
                                <p className="font-bold text-primary-700 text-lg">{record.jobTitle}</p>
                                <p className="text-xs text-neutral-500">{record.date}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <ScoreBadge score={record.result.relevanceScore} />
                                <VerdictBadge verdict={record.result.verdict} />
                            </div>
                       </div>
                    </div>
                ))}
            </div>

            <Modal 
                isOpen={!!selectedAnalysis}
                onClose={() => setSelectedAnalysis(null)}
                title={`Analysis for: ${selectedAnalysis?.jobTitle || ''}`}
            >
                {selectedAnalysis && <ResultsDisplay result={selectedAnalysis.result} />}
            </Modal>
        </div>
    );
};