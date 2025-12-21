
import React from 'react';
import { SparklesIcon, ChatBubbleIcon, AcademicCapIcon, CodeBracketIcon, LanguageIcon, MicrophoneIcon } from './Icons';

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
        <div className="inline-block bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full px-4 py-1 mb-4 font-semibold text-sm">
          Propulsé par DeepSeek R1
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          L’intelligence qui vous <span className="text-primary-600 dark:text-primary-400">simplifie la vie.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Découvrez AideIA, votre assistant intelligent utilisant la puissance de DeepSeek R1 pour résoudre vos problèmes les plus complexes avec un raisonnement avancé.
        </p>
        <button 
          onClick={onStartChat}
          className="bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 flex items-center gap-2 mx-auto"
        >
          <SparklesIcon className="w-6 h-6" />
          Commencer à discuter
        </button>
      </div>
      
      <div className="mt-20 w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-white">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<ChatBubbleIcon className="w-6 h-6" />}
            title="Raisonnement Profond"
            description="Utilise DeepSeek R1 pour analyser vos demandes sous tous les angles avant de répondre."
          />
          <FeatureCard 
            icon={<CodeBracketIcon className="w-6 h-6" />}
            title="Expert Coding"
            description="Génération de code robuste et explications détaillées pour tous les langages de programmation."
          />
          <FeatureCard 
            icon={<MicrophoneIcon className="w-6 h-6" />}
            title="Interface Vocale"
            description="Interagissez naturellement par la voix avec des synthèses vocales ultra-réalistes."
          />
          <FeatureCard 
            icon={<AcademicCapIcon className="w-6 h-6" />}
            title="Assistance Scolaire"
            description="Explications pédagogiques pour les mathématiques, les sciences et la littérature."
          />
          <FeatureCard 
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Traduction Contextuelle"
            description="Traduit vos textes en conservant les nuances culturelles et le ton approprié."
          />
          <FeatureCard 
            icon={<SparklesIcon className="w-6 h-6" />}
            title="Gratuit & Performant"
            description="Accédez au meilleur de l'IA gratuitement, sans compromis sur la qualité."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
