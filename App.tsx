
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ChatWindow from './components/ChatWindow';
import FAQPage from './components/FAQPage';
import { ThemeProvider } from './hooks/useTheme';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatWindow />;
      case 'faq':
        return <FAQPage />;
      case 'home':
      default:
        return <HomePage onStartChat={() => navigateTo('chat')} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header onNavigate={navigateTo} currentPage={currentPage} />
        <main className="flex-grow container mx-auto px-4 py-8 flex">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
