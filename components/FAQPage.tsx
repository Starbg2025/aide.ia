
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
                    <p>AideIA est un assistant virtuel intelligent combinant les meilleurs modèles mondiaux : <strong>DeepSeek R1</strong> pour la réflexion et <strong>Gemini 3 Flash</strong> pour la rapidité et la vision.</p>
                </FAQItem>

                <FAQItem question="Comment fonctionne l'analyse d'images ?">
                    <p>AideIA utilise désormais un double système :</p>
                    <ul>
                        <li><strong>OCR.space</strong> : Pour extraire le texte des documents, livres ou captures d'écran avec une précision chirurgicale.</li>
                        <li><strong>Gemini Vision</strong> : Pour décrire ce qu'il voit si l'image ne contient pas de texte.</li>
                    </ul>
                    <p>Le résultat est ensuite traité par <strong>DeepSeek R1</strong> pour vous donner la réponse la plus intelligente possible.</p>
                </FAQItem>

                <FAQItem question="Quels types de questions puis-je poser ?">
                    <p>Grâce à DeepSeek, AideIA excelle dans :</p>
                    <ul>
                        <li><strong>Raisonnement :</strong> Résolution de problèmes complexes étape par étape.</li>
                        <li><strong>Programmation :</strong> Aide experte en développement logiciel.</li>
                        <li><strong>Analyse de documents :</strong> Envoyez une photo d'un cours ou d'un contrat, et posez vos questions.</li>
                    </ul>
                </FAQItem>

                <FAQItem question="Mes données sont-elles sécurisées ?">
                    <p>Vos conversations sont sauvegardées uniquement dans votre navigateur (Stockage local). Les images sont traitées de manière éphémère pour l'analyse et ne sont pas stockées sur nos serveurs.</p>
                </FAQItem>
                
                 <FAQItem question="Qui a créé AideIA ?">
                    <p>Le site a été créé par Benit Madimba en 2025 pour offrir une interface simplifiée aux technologies d'IA les plus puissantes du moment.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
