
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
                <FAQItem question="Quels modèles sont disponibles ?">
                    <p>AideIA vous propose deux moteurs spécialisés :
                    <ul className="list-disc pl-5 mt-2">
                      <li><strong>DeepSeek R1 :</strong> Idéal pour le raisonnement général, la rédaction et les questions complexes.</li>
                      <li><strong>Qwen Coder :</strong> Spécialisé dans la programmation, capable de générer, corriger et expliquer du code dans de nombreux langages.</li>
                    </ul>
                    </p>
                </FAQItem>

                <FAQItem question="Comment changer de modèle ?">
                    <p>Dans la fenêtre de chat, vous trouverez un sélecteur en haut à droite (Général / Coding). Vous pouvez aussi changer de modèle via l'icône de réglages (roue dentée).</p>
                </FAQItem>

                <FAQItem question="Le mode vocal fonctionne-t-il avec le code ?">
                    <p>Oui, AideIA peut lire le code généré, bien que l'affichage visuel reste le meilleur moyen d'analyser de longs blocs de programmation.</p>
                </FAQItem>

                <FAQItem question="Est-ce gratuit ?">
                    <p>Oui, l'accès à DeepSeek R1 et Qwen Coder via AideIA est entièrement gratuit.</p>
                </FAQItem>
                
                 <FAQItem question="Qui a créé AideIA ?">
                    <p>Le projet a été conçu et développé par <strong>Benit Madimba</strong> en 2025.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
