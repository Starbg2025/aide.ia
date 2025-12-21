
import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType, Conversation, VoiceSettings, VoiceName, AIModel } from '../types';
import { generateStreamingResponse, generateReasoningResponse } from '../services/geminiService';
import { speakText, stopSpeech } from '../services/voiceService';
import Message from './Message';
import ConversationSidebar from './ConversationSidebar';
import { PaperAirplaneIcon, MicrophoneIcon, MenuIcon, CogIcon, CodeBracketIcon, SparklesIcon, BrainIcon } from './Icons';

const VOICES: { name: VoiceName, label: string, desc: string }[] = [
  { name: 'Zephyr', label: 'Zephyr', desc: 'Féminin - Doux' },
  { name: 'Kore', label: 'Kore', desc: 'Féminin - Clair' },
  { name: 'Puck', label: 'Puck', desc: 'Masculin - Dynamique' },
  { name: 'Charon', label: 'Charon', desc: 'Masculin - Profond' },
  { name: 'Fenrir', label: 'Fenrir', desc: 'Masculin - Sérieux' },
];

const createNewConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'Nouvelle discussion',
  model: 'deepseek',
  messages: [
    { 
      id: 'init', 
      role: 'assistant', 
      text: "Bonjour ! Je suis AideIA. Posez-moi vos questions complexes, je suis là pour simplifier votre vie." 
    }
  ]
});

const ChatWindow: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('deepseek');
  
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('aideia-settings-v7');
    return saved ? JSON.parse(saved) : { enabled: true, voiceName: 'Zephyr', autoPlay: true, speed: 1.0 };
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('aideia-settings-v7', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('aideia-conversations-v7');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setConversations(parsed);
        const active = parsed[0];
        setActiveConversationId(active.id);
        setSelectedModel(active.model || 'deepseek');
        return;
      }
    }
    const nc = createNewConversation();
    setConversations([nc]);
    setActiveConversationId(nc.id);
  }, []);

  useEffect(() => {
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechAPI) {
      const recognition = new SpeechAPI();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => setInput(prev => prev ? `${prev} ${e.results[0][0].transcript}` : e.results[0][0].transcript);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('aideia-conversations-v7', JSON.stringify(conversations));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleNewChat = () => {
    const nc = createNewConversation();
    setConversations(prev => [nc, ...prev]);
    setActiveConversationId(nc.id);
    setSelectedModel('deepseek');
    stopSpeech();
  };

  const changeModel = (model: AIModel) => {
    setSelectedModel(model);
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId ? { ...c, model } : c
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;

    stopSpeech();
    const currentInput = input;
    const currentModel = selectedModel;
    const history = activeConversation?.messages || [];
    const userMsg: MessageType = { id: Date.now().toString(), role: 'user', text: currentInput };

    setConversations(prev => prev.map(c => 
      c.id === activeConversationId 
        ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length <= 1 ? currentInput.slice(0, 25) : c.title }
        : c
    ));

    setInput('');
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: MessageType = { id: assistantMsgId, role: 'assistant', text: '' };
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId ? { ...c, messages: [...c.messages, assistantMsg] } : c
    ));

    try {
      if (currentModel === 'gemini-3-flash') {
        const result = await generateReasoningResponse(currentInput, currentModel, history);
        
        setConversations(prev => prev.map(c => 
          c.id === activeConversationId 
            ? { 
                ...c, 
                messages: c.messages.map(m => m.id === assistantMsgId ? { 
                  ...m, 
                  text: result.content, 
                  reasoning_details: result.reasoning_details 
                } : m) 
              } 
            : c
        ));

        if (settings.enabled && settings.autoPlay && result.content) {
          speakText(result.content, settings.voiceName, settings.speed);
        }
      } else {
        let fullText = "";
        await generateStreamingResponse(currentInput, currentModel, history.concat(userMsg), (chunk) => {
          fullText += chunk;
          setConversations(prev => prev.map(c => 
            c.id === activeConversationId 
              ? { ...c, messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, text: fullText } : m) }
              : c
          ));
        });

        if (settings.enabled && settings.autoPlay && fullText) {
          speakText(fullText, settings.voiceName, settings.speed);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-160px)] max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className={`md:hidden fixed inset-0 bg-black/40 z-30 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => { 
          const conv = conversations.find(c => c.id === id);
          setActiveConversationId(id); 
          setSelectedModel(conv?.model || 'deepseek');
          setIsSidebarOpen(false); 
          stopSpeech(); 
        }}
        onDeleteChat={(id) => { setConversations(prev => prev.filter(c => c.id !== id)); stopSpeech(); }}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><MenuIcon className="w-6 h-6"/></button>
            <div className="flex flex-col">
              <h2 className="font-bold truncate text-sm md:text-base">{activeConversation?.title}</h2>
              <span className="text-[10px] uppercase tracking-wider text-primary-500 font-bold">
                {selectedModel === 'qwen-coder' ? 'Expert Coding' : selectedModel === 'gemini-3-flash' ? 'Raisonnement Avancé' : 'GLM-4.5 Air Intelligence'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="hidden lg:flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
               <button onClick={() => changeModel('deepseek')} className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedModel === 'deepseek' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>Général</button>
               <button onClick={() => changeModel('qwen-coder')} className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedModel === 'qwen-coder' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>Coding</button>
               <button onClick={() => changeModel('gemini-3-flash')} className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedModel === 'gemini-3-flash' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>Raisonnement</button>
             </div>
             <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full transition-all ${isSettingsOpen ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
               <CogIcon className="w-6 h-6"/>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeConversation?.messages.map(m => (
            <Message key={m.id} message={m} onSpeak={(text) => speakText(text, settings.voiceName, settings.speed)} />
          ))}
          {isLoading && activeConversation?.messages[activeConversation.messages.length - 1]?.text === "" && (
            <Message message={{ id: 'load', role: 'assistant', text: '...' }} />
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-3xl p-2">
            <div className="p-2 text-primary-500">
              {selectedModel === 'gemini-3-flash' ? <BrainIcon className="w-6 h-6"/> : <SparklesIcon className="w-6 h-6"/>}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-base py-3 px-2 resize-none max-h-32"
              rows={1}
            />
            <button type="button" onClick={() => recognitionRef.current?.start()} className={`p-3 rounded-2xl ${isListening ? 'bg-red-500 text-white' : 'text-gray-500'}`}>
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-50">
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatWindow;
