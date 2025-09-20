import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { AnalysisPage } from './components/AnalysisPage';
import { HistoryPage } from './components/HistoryPage';

type Page = 'home' | 'analysis' | 'history';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage 
                  onNavigateToAnalysis={() => navigateTo('analysis')} 
                  onNavigateToHistory={() => navigateTo('history')} 
                />;
      case 'analysis':
        return <AnalysisPage onNavigateHome={() => navigateTo('home')} />;
      case 'history':
        return <HistoryPage 
                  onNavigateToAnalysis={() => navigateTo('analysis')} 
                  onNavigateHome={() => navigateTo('home')}
                />;
      default:
        return <HomePage 
                  onNavigateToAnalysis={() => navigateTo('analysis')}
                  onNavigateToHistory={() => navigateTo('history')}
                />;
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans relative">
       <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-primary-50 via-white to-white -z-1"></div>
      <main className="container mx-auto p-4 md:p-8 relative z-10">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;