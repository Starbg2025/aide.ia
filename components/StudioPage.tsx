
import React, { useState, useRef, useEffect } from 'react';
import { generateStudioCode } from '../services/geminiService';
import { CodeBracketIcon, SparklesIcon, PaperAirplaneIcon, SunIcon, MoonIcon } from './Icons';

const StudioPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedCode('');
    setActiveTab('preview');

    try {
      await generateStudioCode(prompt, (chunk) => {
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
        // Extraire le code HTML du markdown si nécessaire
        let cleanCode = generatedCode;
        const codeBlockRegex = /```html?([\s\S]*?)```/i;
        const match = generatedCode.match(codeBlockRegex);
        if (match && match[1]) {
          cleanCode = match[1];
        }

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 0; font-family: sans-serif; }
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
    <div className="flex flex-col w-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
            AideIA Studio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Créez des sites et des applications mobiles en un instant.</p>
        </div>
        
        <form onSubmit={handleGenerate} className="flex-1 w-full max-w-2xl flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Une application de gestion de budget moderne..."
              className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 pr-12 text-sm sm:text-base"
              disabled={isGenerating}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               {isGenerating && (
                 <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
               )}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isGenerating || !prompt.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
            <span className="hidden sm:inline">Générer</span>
          </button>
        </form>
      </div>

      <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'preview' ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Visualisation App
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'code' ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Code Source
          </button>
        </div>

        <div className="flex-grow relative">
          {activeTab === 'code' ? (
            <textarea
              readOnly
              value={generatedCode}
              className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none outline-none"
              placeholder="Le code généré apparaîtra ici..."
            />
          ) : (
            <div className="w-full h-full bg-white relative">
              {!generatedCode && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <CodeBracketIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-xl font-medium">Prêt à créer ?</p>
                  <p className="max-w-xs mt-2">Décrivez votre application ci-dessus et AideIA Studio s'occupera du reste.</p>
                </div>
              )}
              {isGenerating && !generatedCode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="animate-pulse text-primary-600 font-bold">Architecte IA en action...</p>
                </div>
              )}
              <iframe 
                ref={iframeRef} 
                className={`w-full h-full border-none transition-opacity duration-300 ${!generatedCode ? 'opacity-0' : 'opacity-100'}`}
                title="App Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
