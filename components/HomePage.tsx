
import React from 'react';
// Added MicrophoneIcon to imports
import { SparklesIcon, ChatBubbleIcon, AcademicCapIcon, CodeBracketIcon, LanguageIcon, PaperClipIcon, MicrophoneIcon } from './Icons';

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
        <div className="inline-block bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full px-4 py-1 mb-4 font-semibold text-sm">
          Nouveau : Analyse d'Images & Mode Ultra-Rapide
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          L’intelligence qui vous <span className="text-primary-600 dark:text-primary-400">simplifie la vie.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Découvrez AideIA, votre assistant multimodal capable de comprendre vos textes et vos images avec une rapidité exceptionnelle.
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
        <h2 className="text-3xl font-bold mb-10">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<ChatBubbleIcon className="w-6 h-6" />}
            title="Réponses Instantanées"
            description="Le moteur Flash 3 garantit des réponses quasi immédiates, optimisant votre productivité."
          />
          <FeatureCard 
            icon={<PaperClipIcon className="w-6 h-6" />}
            title="Analyse d'Images"
            description="Importez vos photos, captures d'écran ou schémas pour obtenir une analyse détaillée."
          />
          <FeatureCard 
            icon={<MicrophoneIcon className="w-6 h-6" />}
            title="Contrôle Vocal"
            description="Parlez à AideIA et écoutez ses réponses avec des voix naturelles de haute qualité."
          />
          <FeatureCard 
            icon={<AcademicCapIcon className="w-6 h-6" />}
            title="Aide Multimodale"
            description="Résolvez des problèmes complexes en combinant explications textuelles et visuelles."
          />
          <FeatureCard 
            icon={<CodeBracketIcon className="w-6 h-6" />}
            title="Expert Coding"
            description="Générez et débuggez votre code plus vite que jamais grâce à l'optimisation Flash."
          />
          <FeatureCard 
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Polyglotte"
            description="Traduisez des documents ou des images contenant du texte dans plus de 100 langues."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
