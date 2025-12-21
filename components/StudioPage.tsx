
import React, { useState, useRef, useEffect } from 'react';
import { generateStudioCode } from '../services/geminiService';
import { CodeBracketIcon, SparklesIcon, PaperAirplaneIcon, CogIcon, PlusIcon, XCircleIcon } from './Icons';

const StudioPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('Tu es un UI Architect expert. Génère du code HTML/Tailwind propre, moderne et interactif. Réponds uniquement par le code HTML complet.');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedCode('');
    setActiveTab('preview');

    try {
      await generateStudioCode(prompt, systemInstruction, (chunk) => {
        setGeneratedCode(prev => prev + chunk);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'preview' && iframeRef.current && generatedCode) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        let cleanCode = generatedCode;
        // Supprimer le markdown si présent
        const codeBlockRegex = /```html?([\s\S]*?)```/i;
        const match = generatedCode.match(codeBlockRegex);
        if (match && match[1]) {
          cleanCode = match[1];
        } else {
            // Nettoyage agressif si l'IA envoie du texte avant le code
            cleanCode = cleanCode.replace(/```html?/g, '').replace(/```/g, '');
        }

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
              <style>
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; overflow-x: hidden; }
              </style>
            </head>
            <body>
              ${cleanCode}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [generatedCode, activeTab]);

  return (
    <div className="flex w-full h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
      <div className={`transition-all duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden opacity-0'}`}>
        <div className="p-4 flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Paramètres</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><XCircleIcon className="w-5 h-5"/></button>
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-2">Instructions système</label>
            <textarea 
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full h-32 text-xs p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center text-xs">
              <span>Modèle Studio</span>
              <span className="font-mono text-primary-500">Gemini 3 Flash</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Mode</span>
              <span className="font-mono">Raisonnement Actif</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><PlusIcon className="w-5 h-5"/></button>
            )}
            <h1 className="font-bold flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
              Studio Editor
            </h1>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
            >
              Prévisualisation
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'code' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
            >
              Code
            </button>
          </div>
        </header>

        <div className="flex-1 relative bg-gray-100 dark:bg-black/20 p-4 overflow-hidden">
          {activeTab === 'preview' ? (
            <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200">
              {!generatedCode && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <SparklesIcon className="w-16 h-16 opacity-10 mb-4" />
                  <p>En attente d'une commande...</p>
                </div>
              )}
              {isGenerating && !generatedCode && (
                 <div className="h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
              )}
              <iframe 
                ref={iframeRef} 
                className="w-full h-full border-none"
                title="Studio Preview"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <textarea
                readOnly
                value={generatedCode}
                className="w-full h-full p-6 font-mono text-sm text-blue-300 bg-transparent resize-none outline-none"
                placeholder="// Le code source apparaîtra ici..."
              />
            </div>
          )}
        </div>

        <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
              placeholder="Décrivez votre application (ex: Une page d'accueil pour un restaurant de sushi)..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              rows={1}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              Générer
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudioPage;
