
import React, { useState } from 'react';

interface FAQItemProps {
    question: string;
    children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-4">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-semibold"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <div className="text-gray-600 dark:text-gray-300 prose prose-lg dark:prose-invert">
                    {children}
                </div>
            </div>
        </div>
    );
}

const FAQPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400">Aide & Questions Fréquentes</h1>
            
            <div className="space-y-4">
                <FAQItem question="Quel modèle utilise AideIA ?">
                    <p>AideIA est désormais propulsé exclusivement par <strong>DeepSeek R1</strong> via OpenRouter. Ce modèle est mondialement reconnu pour ses capacités de raisonnement logique exceptionnelles et sa polyvalence.</p>
                </FAQItem>

                <FAQItem question="Pourquoi DeepSeek R1 ?">
                    <p>Nous avons choisi DeepSeek R1 car il offre des performances de pointe en mathématiques, en programmation et en raisonnement complexe, tout en restant accessible gratuitement pour nos utilisateurs.</p>
                </FAQItem>

                <FAQItem question="Puis-je utiliser AideIA pour coder ?">
                    <p>Absolument. DeepSeek R1 excelle dans la génération de code, le débugging et l'explication de concepts algorithmiques complexes.</p>
                </FAQItem>

                <FAQItem question="Comment fonctionne la synthèse vocale ?">
                    <p>AideIA utilise les dernières technologies de Text-to-Speech pour lire les réponses de l'IA. Vous pouvez activer ou désactiver cette fonction dans les réglages du chat.</p>
                </FAQItem>
                
                 <FAQItem question="Qui est derrière AideIA ?">
                    <p>Le projet a été créé par <strong>Benit Madimba</strong> avec l'objectif de rendre l'IA de haut niveau accessible à tous simplement.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
