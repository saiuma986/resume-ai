import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { Verdict } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon, XCircleIcon, LightbulbIcon, BriefcaseIcon, MessageSquareIcon } from './Icons';
import { Modal } from './Modal';
import { ChatAssistant } from './ChatAssistant';


interface ResultsDisplayProps {
  result: AnalysisResult & { jobTitle?: string };
  showChatAssistant?: boolean;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const getStrokeColor = (s: number) => {
        if (s >= 75) return 'url(#success-gradient)';
        if (s >= 50) return 'url(#warning-gradient)';
        return 'url(#danger-gradient)';
    };

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="success-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                     <linearGradient id="danger-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                </defs>
                <circle
                    className="text-neutral-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    // Fix: Changed getScoreColor to getStrokeColor
                    stroke={getStrokeColor(score)}
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold text-neutral-700`}>
                <span className="text-5xl">{score}</span>
                <span className="text-sm text-neutral-500">out of 100</span>
            </div>
        </div>
    );
};

const VerdictCard: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
    const verdictConfig = {
        [Verdict.HIGH]: {
            icon: <ThumbsUpIcon className="h-6 w-6" />,
            textColor: 'text-green-600',
        },
        [Verdict.MEDIUM]: {
            icon: <ThumbsUpIcon className="h-6 w-6 -rotate-90" />,
            textColor: 'text-yellow-600',
        },
        [Verdict.LOW]: {
            icon: <ThumbsDownIcon className="h-6 w-6" />,
            textColor: 'text-red-600',
        },
    };
    const config = verdictConfig[verdict];

    return (
        <div className={`flex items-center justify-center p-2 rounded-lg`}>
            <div className={config.textColor}>{config.icon}</div>
            <span className={`font-semibold text-xl ml-2 text-neutral-700`}>{verdict} Relevance</span>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, showChatAssistant = false }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col items-center space-y-4 p-6 bg-neutral-100/50 rounded-2xl">
                <ScoreCircle score={result.relevanceScore} />
                <VerdictCard verdict={result.verdict} />
            </div>

            <div className="text-center p-6 bg-primary-50 rounded-2xl border border-primary-200">
                <h3 className="font-bold text-lg text-primary-800 mb-2">AI Summary</h3>
                <p className="text-neutral-600">{result.summary}</p>
            </div>
            
            {showChatAssistant && (
                <>
                    <div className="text-center">
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            <MessageSquareIcon className="h-5 w-5 mr-2" />
                            Ask AI Assistant
                        </button>
                    </div>
                    <Modal
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        title={`Ask about: ${result.jobTitle || 'Your Analysis'}`}
                        allowMaximize={true}
                    >
                        <ChatAssistant analysisContext={result} />
                    </Modal>
                </>
            )}

            {result.alternativeRoles && result.alternativeRoles.length > 0 && (
                 <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <h3 className="font-bold text-lg text-indigo-800 flex items-center mb-4">
                        <BriefcaseIcon className="h-6 w-6 mr-2 text-indigo-500" />
                        Alternative Role Suggestions
                    </h3>
                    <p className="text-sm text-indigo-700 mb-3">
                        Based on the skills in the resume, here are some other roles that could be a great fit:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {result.alternativeRoles.map((role, i) => (
                           <span key={`alt-role-${i}`} className="text-sm font-medium bg-white text-indigo-800 px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm">
                               {role}
                           </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-neutral-200/80">
                    <h3 className="font-bold text-lg text-neutral-800 flex items-center mb-4">
                        <XCircleIcon className="h-6 w-6 mr-2 text-red-500" />
                        Missing Skills
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-neutral-700 mb-1">Must-Have:</h4>
                            {result.missingSkills.mustHave.length > 0 ? (
                                <ul className="space-y-1">
                                    {result.missingSkills.mustHave.map((skill, i) => <li key={`must-${i}`} className="flex items-center text-neutral-600"><span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-2"></span>{skill}</li>)}
                                </ul>
                            ) : <p className="text-neutral-500 italic">No must-have skills are missing. Great job!</p>}
                        </div>
                        <div className="border-t border-neutral-200 pt-4">
                            <h4 className="font-semibold text-neutral-700 mb-1">Nice-to-Have:</h4>
                            {result.missingSkills.niceToHave.length > 0 ? (
                                <ul className="space-y-1">
                                    {result.missingSkills.niceToHave.map((skill, i) => <li key={`nice-${i}`} className="flex items-center text-neutral-600"><span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-2"></span>{skill}</li>)}
                                </ul>
                            ) : <p className="text-neutral-500 italic">No nice-to-have skills are missing.</p>}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-neutral-200/80">
                    <h3 className="font-bold text-lg text-neutral-800 flex items-center mb-4">
                        <LightbulbIcon className="h-6 w-6 mr-2 text-green-500" />
                        Improvement Suggestions
                    </h3>
                    {result.improvementSuggestions.length > 0 ? (
                        <ul className="space-y-3 text-sm text-neutral-600">
                             {result.improvementSuggestions.map((suggestion, i) => (
                                <li key={`sug-${i}`} className="flex">
                                    <span className="text-green-500 font-bold mr-2">✓</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-neutral-500 italic text-sm">Your resume looks well-aligned. No specific suggestions at this time.</p>}
                </div>
            </div>
        </div>
    );
};