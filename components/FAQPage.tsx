
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
                    <p>AideIA est un assistant virtuel intelligent combinant les meilleurs modèles mondiaux : <strong>Kimi K2</strong> pour la réflexion textuelle avancée et <strong>Gemini 3 Flash</strong> pour la rapidité et la vision.</p>
                </FAQItem>

                <FAQItem question="Comment fonctionne l'analyse d'images ?">
                    <p>AideIA utilise un double système :</p>
                    <ul>
                        <li><strong>OCR.space</strong> : Pour extraire le texte des documents ou captures d'écran.</li>
                        <li><strong>Gemini Vision</strong> : Pour décrire ce qu'il voit si l'image est purement visuelle.</li>
                    </ul>
                    <p>Le résultat est ensuite traité par <strong>Kimi K2</strong> pour vous donner une réponse contextuelle parfaite.</p>
                </FAQItem>

                <FAQItem question="Quels types de questions puis-je poser ?">
                    <p>Grâce à Kimi K2, AideIA excelle dans :</p>
                    <ul>
                        <li><strong>Raisonnement logique :</strong> Idéal pour les énigmes et les mathématiques.</li>
                        <li><strong>Rédaction :</strong> Création de contenus fluides et naturels.</li>
                        <li><strong>Analyse de documents :</strong> Posez des questions sur le texte extrait de vos photos.</li>
                    </ul>
                </FAQItem>

                <FAQItem question="Mes données sont-elles sécurisées ?">
                    <p>Vos conversations sont sauvegardées uniquement dans votre navigateur. Les images sont traitées de manière éphémère pour l'analyse et ne sont jamais stockées durablement.</p>
                </FAQItem>
                
                 <FAQItem question="Qui a créé AideIA ?">
                    <p>Le site a été créé par Benit Madimba en 2025 pour rendre l'IA de pointe accessible à tous en un clic.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
