
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { BrainIcon, SunIcon, MoonIcon } from './Icons';
import { Page } from '../types';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { theme, toggleTheme } = useTheme();

  const navLinkClasses = (page: Page) => 
    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      currentPage === page 
      ? 'bg-primary-500 text-white' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400">
          <BrainIcon className="w-8 h-8" />
          <span>AideIA</span>
        </button>
        
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => onNavigate('home')} className={navLinkClasses('home')}>Accueil</button>
          <button onClick={() => onNavigate('chat')} className={navLinkClasses('chat')}>Chat IA</button>
          <button onClick={() => onNavigate('faq')} className={navLinkClasses('faq')}>Aide / FAQ</button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>
       <div className="md:hidden flex justify-center gap-2 pb-3 border-t border-gray-200 dark:border-gray-700 pt-2">
          <button onClick={() => onNavigate('home')} className={navLinkClasses('home')}>Accueil</button>
          <button onClick={() => onNavigate('chat')} className={navLinkClasses('chat')}>Chat IA</button>
          <button onClick={() => onNavigate('faq')} className={navLinkClasses('faq')}>Aide / FAQ</button>
        </div>
    </header>
  );
};

export default Header;
