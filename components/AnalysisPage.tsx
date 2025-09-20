import React, { useState } from 'react';
import { getRelevanceAnalysis } from '../services/geminiService';
import { saveAnalysis } from '../services/historyService';
import type { AnalysisResult } from '../types';
import { MOCK_RESUME_TEXT } from '../constants';
import { Spinner } from './Spinner';
import { FileUpload } from './FileUpload';
import { XCircleIcon, LinkIcon, ArrowRightIcon, TrashIcon, PlusIcon } from './Icons';
import { ResultsDisplay } from './ResultsDisplay';

interface AnalysisPageProps {
  onNavigateHome: () => void;
}

type ResumeInputMode = 'file' | 'url';
interface JobRole {
  id: number;
  title: string;
  description: string;
}
type AnalysisResultWithTitle = AnalysisResult & { jobTitle: string };

const Step: React.FC<{ number: number; title: string; subtitle: string }> = ({ number, title, subtitle }) => (
  <div>
    <div className="flex items-center">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <h2 className="ml-3 text-lg font-bold text-neutral-800">{title}</h2>
    </div>
    <p className="text-sm text-neutral-500 ml-11 mt-1">{subtitle}</p>
  </div>
);

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = (s: number) => {
        if (s >= 75) return 'bg-green-100 text-green-800';
        if (s >= 50) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    return (
        <span className={`font-bold text-xs px-2 py-1 rounded-full ${getScoreColor(score)}`}>
            {score}
        </span>
    );
};


export const AnalysisPage: React.FC<AnalysisPageProps> = ({ onNavigateHome }) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([{ id: Date.now(), title: '', description: '' }]);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeInputMode, setResumeInputMode] = useState<ResumeInputMode>('file');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultWithTitle[] | null>(null);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const handleFileSelect = (file: File | null) => {
    setResumeFile(file);
    if (file) {
      setResumeText(MOCK_RESUME_TEXT);
      setError(null);
    } else {
      setResumeText('');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setResumeUrl(url);
    if (url.trim()) {
      setResumeText(MOCK_RESUME_TEXT);
      setError(null);
    } else {
      setResumeText('');
    }
  };
  
  const addJobRole = () => {
    setJobRoles([...jobRoles, { id: Date.now(), title: '', description: '' }]);
  };

  const removeJobRole = (id: number) => {
    setJobRoles(jobRoles.filter(role => role.id !== id));
  };

  const updateJobRole = (id: number, field: 'title' | 'description', value: string) => {
    setJobRoles(jobRoles.map(role => role.id === id ? { ...role, [field]: value } : role));
  };


  const handleAnalyze = async () => {
    const validJobRoles = jobRoles.filter(r => r.title.trim() && r.description.trim());
    if (validJobRoles.length === 0 || !resumeText.trim()) {
      setError('Please provide a resume and fill out the title and description for at least one job role.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analyses = validJobRoles.map(role => 
        getRelevanceAnalysis(role.description, resumeText).then(result => ({
          ...result,
          jobTitle: role.title,
        }))
      );
      
      const results = await Promise.all(analyses);
      
      results.forEach(res => {
        saveAnalysis(res.jobTitle, res);
      });

      setAnalysisResults(results);
      window.scrollTo(0, 0);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewAnalysis = () => {
    setAnalysisResults(null);
    setJobRoles([{ id: Date.now(), title: '', description: '' }]);
    setResumeText('');
    setResumeFile(null);
    setResumeUrl('');
    setResumeInputMode('file');
    setError(null);
    setActiveResultIndex(0);
  };

  if (analysisResults) {
    return (
       <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-neutral-200/80 border border-neutral-200/80">
          <h1 className="text-3xl font-bold text-neutral-800 mb-6 text-center">Analysis Complete!</h1>
           <div className="border-b border-neutral-200 mb-6">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {analysisResults.map((result, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveResultIndex(index)}
                            className={`${
                                index === activeResultIndex
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                            aria-current={index === activeResultIndex ? 'page' : undefined}
                        >
                            <span className="truncate max-w-48">{result.jobTitle}</span>
                            <ScoreBadge score={result.relevanceScore} />
                        </button>
                    ))}
                </nav>
            </div>

          {analysisResults.length > 0 && <ResultsDisplay result={analysisResults[activeResultIndex]} showChatAssistant={true} />}

          <div className="mt-8 text-center">
            <button
              onClick={handleStartNewAnalysis}
              className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-lg shadow-primary-200"
            >
              Start New Analysis <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isResumeInputValid = resumeText.trim() !== '';
  const isAnyJobRoleValid = jobRoles.some(r => r.title.trim() !== '' && r.description.trim() !== '');
  const isAnalyzeButtonDisabled = !isResumeInputValid || !isAnyJobRoleValid || isLoading;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <button 
        onClick={onNavigateHome} 
        className="text-primary-600 hover:text-primary-800 font-semibold text-sm flex items-center group"
      >
        <span className="transform transition-transform group-hover:-translate-x-1 mr-1">&larr;</span> Back to Home
      </button>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-neutral-200/80 border border-neutral-200/80">
        <div className="space-y-8">
          
          <div className="space-y-4">
              <Step number={1} title="Your Resume" subtitle="Upload your resume file or provide a link to an online profile." />
              <div className="ml-11">
                  <div className="flex space-x-2 mb-3 bg-neutral-100 p-1 rounded-lg w-min">
                     <button onClick={() => setResumeInputMode('file')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${ resumeInputMode === 'file' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300' }`} aria-pressed={resumeInputMode === 'file'}>Upload File</button>
                     <button onClick={() => setResumeInputMode('url')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${ resumeInputMode === 'url' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`} aria-pressed={resumeInputMode === 'url'}>Provide Link</button>
                  </div>
                  {resumeInputMode === 'file' && <FileUpload onFileSelect={handleFileSelect} />}
                  {resumeInputMode === 'url' && (
                    <div className="relative">
                       <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                       <input type="url" className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm bg-neutral-50" placeholder="e.g., https://linkedin.com/in/yourprofile" value={resumeUrl} onChange={handleUrlChange} />
                    </div>
                  )}
              </div>
          </div>

          <div className="space-y-4">
            <Step number={2} title="Job Roles" subtitle="Add one or more job roles you want to analyze your resume against." />
            <div className="ml-11 space-y-4">
              {jobRoles.map((role, index) => (
                <div key={role.id} className="p-4 border border-neutral-200 rounded-xl relative bg-neutral-50/50">
                   {jobRoles.length > 1 && (
                      <button onClick={() => removeJobRole(role.id)} className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-500 hover:bg-red-100 hover:text-red-600 transition-colors" aria-label="Remove job role">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                   <div className="space-y-3">
                     <input
                        type="text"
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm"
                        placeholder={`Job Title #${index + 1}`}
                        value={role.title}
                        onChange={(e) => updateJobRole(role.id, 'title', e.target.value)}
                      />
                      <textarea
                        rows={6}
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm"
                        placeholder={`Paste job description #${index + 1} here...`}
                        value={role.description}
                        onChange={(e) => updateJobRole(role.id, 'description', e.target.value)}
                      />
                   </div>
                </div>
              ))}
               <button onClick={addJobRole} className="w-full flex items-center justify-center text-sm font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors border border-primary-200 border-dashed">
                 <PlusIcon className="w-4 h-4 mr-2"/>
                 Add Another Job Role
               </button>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzeButtonDisabled}
              className="w-full flex items-center justify-center bg-primary-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 disabled:bg-neutral-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-primary-200 disabled:shadow-none"
            >
              {isLoading && <Spinner />}
              {isLoading ? `Analyzing ${jobRoles.filter(r=>r.title.trim()&&r.description.trim()).length} Roles...` : `Analyze Resume`}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-6 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg relative flex items-center" role="alert">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};