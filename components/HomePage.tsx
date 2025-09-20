import React from 'react';
import { ArrowRightIcon, ZapIcon, BarChartIcon, LightbulbIcon, BotIcon, HistoryIcon } from './Icons';

interface HomePageProps {
  onNavigateToAnalysis: () => void;
  onNavigateToHistory: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToAnalysis, onNavigateToHistory }) => {
  return (
    <div className="animate-fade-in relative">
       <div className="absolute top-0 right-0">
        <button 
            onClick={onNavigateToHistory}
            className="flex items-center text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors group p-2"
        >
            <HistoryIcon className="h-5 w-5 mr-2 text-neutral-500 group-hover:text-primary-600" />
            History
        </button>
      </div>

      <div className="text-center py-10 md:py-20">
        <BotIcon className="h-12 w-12 md:h-16 md:w-16 text-primary-600 mx-auto mb-4"/>
        <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 mb-4 leading-tight">
          NextHire
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-neutral-600 mb-10">
          Instantly check your resume's relevance against single or multiple job descriptions at once. Get a detailed score for each role, identify skill gaps, and receive actionable feedback to land your next interview.
        </p>
        <button
          onClick={onNavigateToAnalysis}
          className="bg-primary-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-primary-200 flex items-center mx-auto"
        >
          Start Analyzing Now <ArrowRightIcon className="h-5 w-5 ml-2" />
        </button>
        <p className="mt-8 text-sm text-neutral-500">Powered by Gemini AI</p>

        <div className="mt-20 md:mt-28">
          <h2 className="text-3xl font-bold text-neutral-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/80 border border-neutral-200/80 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-primary-100 text-primary-600 rounded-lg h-12 w-12 flex items-center justify-center mb-4">
                  <ZapIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Instant Scoring</h3>
              <p className="text-neutral-600">Receive a relevance score from 0-100 in seconds, powered by Google's Gemini AI.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/80 border border-neutral-200/80 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-primary-100 text-primary-600 rounded-lg h-12 w-12 flex items-center justify-center mb-4">
                  <BarChartIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Detailed Skill Gap Analysis</h3>
              <p className="text-neutral-600">Pinpoint the exact 'must-have' and 'nice-to-have' skills you're missing.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/80 border border-neutral-200/80 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-primary-100 text-primary-600 rounded-lg h-12 w-12 flex items-center justify-center mb-4">
                  <LightbulbIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Actionable Feedback</h3>
              <p className="text-neutral-600">Get personalized, concrete suggestions to tailor your resume for the job.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};