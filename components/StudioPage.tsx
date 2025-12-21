
import React, { useState, useRef, useEffect } from 'react';
import { generateStudioCode } from '../services/geminiService';
import { CodeBracketIcon, SparklesIcon, PaperAirplaneIcon, PlusIcon, XCircleIcon } from './Icons';

const StudioPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('Tu es un UI Architect expert. Génère du code HTML complet avec Tailwind CSS. Réponds uniquement avec le code.');
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
        const match = generatedCode.match(/```html?([\s\S]*?)```/i);
        if (match && match[1]) cleanCode = match[1];
        else cleanCode = cleanCode.replace(/```html?/g, '').replace(/```/g, '');

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>body { margin: 0; font-family: sans-serif; }</style>
            </head>
            <body>${cleanCode}</body>
          </html>
        `);
        doc.close();
      }
    }
  }, [generatedCode, activeTab]);

  return (
    <div className="flex w-full h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
      <div className={`transition-all duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-400">Configuration Studio</h3>
            <button onClick={() => setSidebarOpen(false)}><XCircleIcon className="w-5 h-5"/></button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary-500 uppercase">Instructions Système</label>
            <textarea 
              value={systemInstruction}
              onChange={e => setSystemInstruction(e.target.value)}
              className="w-full h-32 text-xs p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs space-y-2">
            <div className="flex justify-between"><span>Moteur</span><span className="font-mono text-primary-500">DeepSeek R1</span></div>
            <div className="flex justify-between"><span>Raisonnement</span><span className="font-mono text-green-500">Activé</span></div>
            <div className="flex justify-between"><span>Accès</span><span className="font-mono text-blue-500">Gratuit</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"><PlusIcon className="w-5 h-5"/></button>}
            <h1 className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100"><SparklesIcon className="w-5 h-5 text-yellow-500" /> AideIA Studio</h1>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Prévisualisation</button>
            <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'code' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Code Source</button>
          </div>
        </header>

        <div className="flex-1 p-4 bg-gray-100 dark:bg-black/20">
          <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700">
            {activeTab === 'preview' ? (
              <iframe ref={iframeRef} className="w-full h-full border-none" title="Studio Preview" />
            ) : (
              <textarea readOnly value={generatedCode} className="w-full h-full p-6 font-mono text-sm text-blue-400 bg-gray-900 resize-none outline-none" />
            )}
            {isGenerating && !generatedCode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Génération par DeepSeek R1...</p>
              </div>
            )}
          </div>
        </div>

        <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto flex gap-2">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
              placeholder="Ex: Une application de gestion de contacts interactive..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 dark:text-gray-100"
              rows={1}
            />
            <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="px-6 bg-primary-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md">
              <PaperAirplaneIcon className="w-5 h-5" /> Générer
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudioPage;
