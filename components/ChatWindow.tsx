
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message as MessageType, Conversation, VoiceSettings, VoiceName } from '../types';
import { generateResponse } from '../services/geminiService';
import { speakText, stopSpeech } from '../services/voiceService';
import Message from './Message';
import ConversationSidebar from './ConversationSidebar';
import { PaperAirplaneIcon, MicrophoneIcon, MenuIcon, CogIcon, XCircleIcon, PaperClipIcon, VolumeUpIcon } from './Icons';

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
  messages: [
    { id: 'init', role: 'assistant', text: "Bonjour ! Je suis AideIA. Je suis maintenant propulsé par Kimi K2 pour vos textes et Gemini pour la vision. Comment puis-je vous simplifier la vie aujourd'hui ?" }
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('aideia-voice-v2');
    return saved ? JSON.parse(saved) : { enabled: true, voiceName: 'Zephyr', autoPlay: true, speed: 1.0 };
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('aideia-voice-v2', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    const saved = localStorage.getItem('aideia-conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setConversations(parsed);
        setActiveConversationId(parsed[0].id);
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
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${text}` : text);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('aideia-conversations', JSON.stringify(conversations));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNewChat = () => {
    const nc = createNewConversation();
    setConversations(prev => [nc, ...prev]);
    setActiveConversationId(nc.id);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    stopSpeech();
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeech();
      recognitionRef.current?.start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!input.trim() && !imageFile)) return;

    stopSpeech();
    const currentInput = input;
    const currentImage = imageFile;
    const currentPreview = imagePreview;

    const userMsg: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput,
      image: currentPreview || undefined
    };

    setConversations(prev => prev.map(c => 
      c.id === activeConversationId 
        ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length <= 1 ? (currentInput.slice(0, 25) || "Analyse image") : c.title }
        : c
    ));

    setInput('');
    setImageFile(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      const response = await generateResponse(currentInput, currentImage || undefined);
      const assistantMsg: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response,
      };

      setConversations(prev => prev.map(c => 
        c.id === activeConversationId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      ));

      if (voiceSettings.enabled && voiceSettings.autoPlay) {
        speakText(response, voiceSettings.voiceName, voiceSettings.speed);
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
        onSelectChat={(id) => { setActiveConversationId(id); setIsSidebarOpen(false); stopSpeech(); }}
        onDeleteChat={(id) => { setConversations(prev => prev.filter(c => c.id !== id)); stopSpeech(); }}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 bg-white dark:bg-gray-800">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-500"><MenuIcon className="w-6 h-6"/></button>
            <h2 className="font-bold truncate max-w-[200px]">{activeConversation?.title}</h2>
          </div>
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full transition-all ${isSettingsOpen ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <CogIcon className="w-6 h-6"/>
          </button>
        </header>

        {isSettingsOpen && (
          <div className="p-5 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-900/30 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-primary-600 uppercase mb-2">Choix de la voix</label>
                <select 
                  value={voiceSettings.voiceName}
                  onChange={(e) => setVoiceSettings(v => ({...v, voiceName: e.target.value as VoiceName}))}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm shadow-sm"
                >
                  {VOICES.map(v => <option key={v.name} value={v.name}>{v.label} ({v.desc})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-primary-600 uppercase mb-2">Vitesse de lecture ({voiceSettings.speed}x)</label>
                <input 
                  type="range" min="0.5" max="2" step="0.1" 
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings(v => ({...v, speed: parseFloat(e.target.value)}))}
                  className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Lent</span>
                  <span>Normal</span>
                  <span>Rapide</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-3 text-sm cursor-pointer font-semibold group">
                  <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${voiceSettings.autoPlay ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${voiceSettings.autoPlay ? 'translate-x-4' : ''}`} />
                  </div>
                  <input type="checkbox" checked={voiceSettings.autoPlay} onChange={(e) => setVoiceSettings(v => ({...v, autoPlay: e.target.checked}))} className="hidden" />
                  Lecture automatique
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {activeConversation?.messages.map(m => (
            <Message key={m.id} message={m} onSpeak={(text) => speakText(text, voiceSettings.voiceName, voiceSettings.speed)} />
          ))}
          {isLoading && <Message message={{ id: 'load', role: 'assistant', text: '...' }} />}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            {imagePreview && (
              <div className="absolute bottom-full left-0 mb-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="relative group">
                  <img src={imagePreview} className="w-32 h-32 object-cover rounded-2xl border-4 border-white dark:border-gray-700 shadow-2xl" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 hover:scale-110 transition-all">
                    <XCircleIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-3xl p-2 shadow-inner border border-transparent focus-within:border-primary-500/50 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-600 rounded-2xl transition-all shadow-sm">
                <PaperClipIcon className="w-6 h-6" />
              </button>
              
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                placeholder="Parlez-moi ou analysez une image..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-base py-3 px-2 resize-none max-h-32 scrollbar-hide"
                rows={1}
              />

              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-600'}`}
                title="Dictée vocale"
              >
                <MicrophoneIcon className="w-6 h-6" />
              </button>

              <button type="submit" disabled={isLoading || (!input.trim() && !imageFile)} className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:bg-gray-400 disabled:shadow-none transition-all shadow-lg hover:scale-105 active:scale-95">
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatWindow;
