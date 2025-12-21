
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
          Découvrez AideIA, votre assistant intelligent utilisant la puissance de DeepSeek pour répondre à toutes vos questions complexes en un instant.
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
            title="Réponses en Temps Réel"
            description="Grâce au streaming, voyez les réponses de l'IA s'afficher au fur et à mesure de leur génération."
          />
          <FeatureCard 
            icon={<CodeBracketIcon className="w-6 h-6" />}
            title="Expert Coding"
            description="DeepSeek R1 est l'un des meilleurs modèles pour générer et débugger du code informatique."
          />
          <FeatureCard 
            icon={<MicrophoneIcon className="w-6 h-6" />}
            title="Contrôle Vocal"
            description="Parlez à AideIA et écoutez ses réponses avec des voix naturelles de haute qualité."
          />
          <FeatureCard 
            icon={<AcademicCapIcon className="w-6 h-6" />}
            title="Raisonnement Logique"
            description="Posez des questions de mathématiques ou de logique complexes et obtenez des explications claires."
          />
          <FeatureCard 
            icon={<LanguageIcon className="w-6 h-6" />}
            title="Traduction Avancée"
            description="Une maîtrise exceptionnelle de plus de 100 langues pour toutes vos traductions."
          />
          <FeatureCard 
            icon={<SparklesIcon className="w-6 h-6" />}
            title="Gratuit & Illimité"
            description="Accédez à la pointe de l'IA sans frais cachés, pour tous vos besoins quotidiens."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
