import React from 'react';
import { BotIcon, HistoryIcon } from './Icons';

interface HeaderProps {
    onNavigateHome: () => void;
    onNavigateToHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateToHistory }) => {
  return (
    <header className="bg-transparent sticky top-0 z-20 border-b border-neutral-200/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            onClick={onNavigateHome}
            className="flex items-center cursor-pointer group"
            aria-label="Go to homepage"
            role="button"
          >
            <BotIcon className="h-8 w-8 text-primary-600 mr-3 transition-transform duration-300 group-hover:rotate-12"/>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
              NextHire
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button 
                onClick={onNavigateToHistory}
                className="flex items-center text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors group"
            >
                <HistoryIcon className="h-5 w-5 mr-2 text-neutral-500 group-hover:text-primary-600" />
                History
            </button>
            <p className="hidden md:block text-sm text-neutral-500">Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    </header>
  );
};