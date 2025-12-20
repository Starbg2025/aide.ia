
import React from 'react';
import { SparklesIcon, ChatBubbleIcon, AcademicCapIcon, CodeBracketIcon, LanguageIcon } from './Icons';

interface HomePageProps {
  onStartChat: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ onStartChat }) => {
  return (
    <div className="w-full text-center flex flex-col items-center">
      <div className="max-w-4xl">
        <div className="inline-block bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full px-4 py-1 mb-4 font-semibold">
          Bienvenue sur AideIA.com
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          L’intelligence qui vous <span className="text-primary-600 dark:text-primary-400">simplifie la vie.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Votre assistant personnel virtuel propulsé par DeepSeek pour trouver des réponses précises et libérer votre créativité.
        </p>
        <button 
          onClick={onStartChat}
          className="bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 flex items-center gap-2 mx-auto"
        >
          <SparklesIcon className="w-6 h-6" />
          Discuter avec DeepSeek
        </button>
      </div>
      
      <div className="mt-20 w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-10">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<ChatBubbleIcon className="w-6 h-6" />}
            title="Chat Intelligent"
            description="Profitez de la puissance de DeepSeek R1 pour des raisonnements complexes et des réponses détaillées."
          />
          <FeatureCard 
            icon={<AcademicCapIcon className="w-6 h-6" />}
            title="Aide aux Étudiants"
            description="Faites-vous expliquer des concepts difficiles ou résoudre des problèmes mathématiques étape par étape."
          />
          <FeatureCard 
            icon={<CodeBracketIcon className="w-6 h-6" />}
            title="Expert en Code"
            description="Générez, optimisez et déboguez votre code dans n'importe quel langage de programmation."
          />
           <FeatureCard 
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Polyglotte"
            description="Traduisez vos textes et discutez naturellement dans plus de 50 langues différentes."
          />
            <FeatureCard 
            icon={<SparklesIcon className="w-6 h-6" />}
            title="Créativité Débridée"
            description="Rédaction d'emails, de rapports, de scripts ou de contenus créatifs de haute qualité."
          />
           <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m0 0h.01m-.01 0H12m0-3h.01M12 15h.01M12 12h.01M12 9h.01M12 6h.01M12 3h.01M9 21h.01M6 21h.01M3 21h.01M15 21h.01M18 21h.01M21 21h.01" /></svg>}
            title="Raisonnement Avancé"
            description="DeepSeek R1 analyse chaque nuance de votre demande pour fournir la réponse la plus pertinente."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
