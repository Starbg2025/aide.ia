
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
          Votre assistant personnel virtuel pour trouver des réponses, résoudre des problèmes et libérer votre créativité.
        </p>
        <button 
          onClick={onStartChat}
          className="bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 flex items-center gap-2 mx-auto"
        >
          <SparklesIcon className="w-6 h-6" />
          Discuter maintenant
        </button>
      </div>
      
      <div className="mt-20 w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-10">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<ChatBubbleIcon className="w-6 h-6" />}
            title="Chat Interactif Intelligent"
            description="Posez toutes vos questions, de la programmation à la poésie, et obtenez des réponses instantanées."
          />
          <FeatureCard 
            icon={<AcademicCapIcon className="w-6 h-6" />}
            title="Aide aux Étudiants"
            description="Faites-vous expliquer des cours, résoudre des exercices ou générer des résumés pour réviser."
          />
          <FeatureCard 
            icon={<CodeBracketIcon className="w-6 h-6" />}
            title="Création et Support Technique"
            description="Générez du code, des scripts, ou obtenez de l'aide pour vos projets informatiques et créatifs."
          />
           <FeatureCard 
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Assistant Multilingue"
            description="Traduisez instantanément et discutez dans plusieurs langues comme le français, l'anglais, et plus encore."
          />
            <FeatureCard 
            icon={<SparklesIcon className="w-6 h-6" />}
            title="Créativité sans limites"
            description="Générez des poèmes, des chansons, des histoires et des idées de projets pour booster votre imagination."
          />
           <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
            title="Analyse d'Images"
            description="Téléchargez une image et posez des questions à son sujet. L'IA la comprendra et y répondra."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
