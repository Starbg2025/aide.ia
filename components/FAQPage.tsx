
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
                <FAQItem question="Quels modèles utilisez-vous ?">
                    <p>AideIA a évolué ! Nous n'utilisons plus Gemini pour la réflexion. Vous avez désormais le choix entre :</p>
                    <ul>
                        <li><strong>Kimi K2 (Moonshot)</strong> : Ultra-fluide, parfait pour la rédaction et les discussions quotidiennes.</li>
                        <li><strong>DeepSeek R1</strong> : Un modèle de raisonnement pur, idéal pour les problèmes complexes et le code.</li>
                    </ul>
                </FAQItem>

                <FAQItem question="Comment fonctionne l'analyse d'image sans Gemini ?">
                    <p>Nous utilisons la technologie **OCR.space** pour lire le texte contenu dans vos images. Ce texte est ensuite analysé par Kimi ou DeepSeek pour répondre à vos questions. Notez que nous nous concentrons désormais sur les images contenant du texte.</p>
                </FAQItem>

                <FAQItem question="Comment changer de modèle ?">
                    <p>Allez dans les **paramètres** (icône roue dentée) en haut à droite du chat. Vous pourrez basculer entre Kimi et DeepSeek instantanément.</p>
                </FAQItem>

                <FAQItem question="Est-ce gratuit ?">
                    <p>Oui, AideIA utilise les versions gratuites de ces modèles via OpenRouter pour vous offrir un service performant sans frais.</p>
                </FAQItem>
                
                 <FAQItem question="Qui est derrière AideIA ?">
                    <p>Le projet est toujours maintenu par **Benit Madimba**, avec l'objectif de vous fournir les meilleures IA du marché dans une interface simple et élégante.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
