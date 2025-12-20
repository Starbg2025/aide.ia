
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
                <FAQItem question="C'est quoi AideIA ?">
                    <p>AideIA est un assistant virtuel propulsé par le modèle <strong>DeepSeek R1</strong>, conçu pour vous aider dans vos tâches quotidiennes, vos études et votre travail grâce à une intelligence de pointe.</p>
                </FAQItem>

                <FAQItem question="Quels types de questions puis-je poser ?">
                    <p>Grâce à DeepSeek, AideIA excelle dans :</p>
                    <ul>
                        <li><strong>Raisonnement :</strong> Résolution de problèmes complexes étape par étape.</li>
                        <li><strong>Programmation :</strong> Aide experte en développement logiciel.</li>
                        <li><strong>Rédaction :</strong> Création de contenus professionnels ou créatifs.</li>
                        <li><strong>Éducation :</strong> Explications pédagogiques sur n'importe quel sujet.</li>
                    </ul>
                </FAQItem>

                <FAQItem question="Mes conversations sont-elles sauvegardées ?">
                    <p>Oui, vos conversations sont sauvegardées localement dans votre navigateur. Elles ne quittent pas votre appareil, sauf pour être traitées anonymement par l'IA lors de vos envois.</p>
                </FAQItem>

                <FAQItem question="Est-ce gratuit ?">
                    <p>Oui, AideIA utilise actuellement le modèle gratuit de DeepSeek via OpenRouter pour vous offrir un service performant sans frais.</p>
                </FAQItem>
                
                 <FAQItem question="Qui a créé AideIA ?">
                    <p>Le site a été créé et conçu par Benit Madimba en 2025 pour simplifier l'accès à l'IA de nouvelle génération.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
