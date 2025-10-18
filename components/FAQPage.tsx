
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
                <FAQItem question="Comment utiliser AideIA ?">
                    <p>C'est très simple ! Rendez-vous sur la page "Chat IA", écrivez votre question dans la zone de texte en bas, et appuyez sur "Envoyer". L'assistant vous répondra instantanément.</p>
                </FAQItem>

                <FAQItem question="Quels types de questions puis-je poser ?">
                    <p>Vous pouvez poser presque n'importe quelle question ! Voici quelques exemples :</p>
                    <ul>
                        <li><strong>Éducatif :</strong> "Explique-moi la photosynthèse."</li>
                        <li><strong>Programmation :</strong> "Écris une fonction Python pour trier une liste."</li>
                        <li><strong>Créatif :</strong> "Donne-moi une idée de poème sur la lune."</li>
                        <li><strong>Traduction :</strong> "Comment dit-on 'bonjour' en lingala ?"</li>
                        <li><strong>Conseils :</strong> "Quels sont les avantages du mode sombre ?"</li>
                    </ul>
                </FAQItem>
                
                <FAQItem question="Comment analyser une image ?">
                     <p>Cliquez sur l'icône trombone (📎) à côté de la zone de texte, sélectionnez une image sur votre appareil. Une fois l'image chargée, vous pouvez ajouter une question la concernant (par exemple, "Qu'est-ce que c'est ?") ou simplement l'envoyer pour que l'IA la décrive.</p>
                </FAQItem>

                <FAQItem question="Mes conversations sont-elles sauvegardées ?">
                    <p>Oui, vos conversations sont sauvegardées automatiquement dans votre navigateur. Si vous fermez l'onglet et revenez plus tard, vous pourrez reprendre là où vous vous étiez arrêté. Notez que cela ne fonctionne que sur le même appareil et le même navigateur.</p>
                </FAQItem>

                <FAQItem question="Est-ce que mes données personnelles sont protégées ?">
                    <p>Absolument. La protection de votre vie privée est notre priorité. Nous ne stockons aucune information personnelle identifiable et vos conversations sont anonymes. N'hésitez pas à consulter notre politique de confidentialité (lien fictif pour l'exemple).</p>
                </FAQItem>
                
                 <FAQItem question="Qui est le créateur de cette IA ?">
                    <p>AideIA a été créé par Benit Madimba en 2025. C'est un projet visant à rendre l'intelligence artificielle accessible et utile pour tous.</p>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;
