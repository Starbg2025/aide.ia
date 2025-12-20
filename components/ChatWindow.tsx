
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message as MessageType, Conversation, VoiceSettings, VoiceName } from '../types';
import { generateResponse } from '../services/geminiService';
import { speakText, stopSpeech } from '../services/voiceService';
import Message from './Message';
import ConversationSidebar from './ConversationSidebar';
import { PaperAirplaneIcon, MicrophoneIcon, MenuIcon, CogIcon, XCircleIcon, PaperClipIcon, VolumeUpIcon } from './Icons';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

const VOICES: { name: VoiceName, label: string, desc: string }[] = [
  { name: 'Zephyr', label: 'Zephyr', desc: 'Doux & Calme' },
  { name: 'Kore', label: 'Kore', desc: 'Clair & Neutre' },
  { name: 'Puck', label: 'Puck', desc: 'Joyeux & Dynamique' },
  { name: 'Charon', label: 'Charon', desc: 'Profond & Mystérieux' },
  { name: 'Fenrir', label: 'Fenrir', desc: 'Sérieux & Autoritaire' },
];

const createNewConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'Nouvelle discussion',
  messages: [
    { id: 'init', role: 'assistant', text: "Bonjour ! Je suis AideIA. Je suis configuré en mode 'Ultra-Rapide'. Vous pouvez me parler, m'écouter ou m'envoyer des images." }
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
      recognition.lang = 'fr-FR';
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${text}` : text);
      };
      recognition.onend = () => setIsListening(false);
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
            <span className="hidden sm:inline-block px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full">ULTRA-RAPIDE</span>
          </div>
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <CogIcon className="w-6 h-6"/>
          </button>
        </header>

        {isSettingsOpen && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-900/30 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Choix de la voix</label>
                <select 
                  value={voiceSettings.voiceName}
                  onChange={(e) => setVoiceSettings(v => ({...v, voiceName: e.target.value as VoiceName}))}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm"
                >
                  {VOICES.map(v => <option key={v.name} value={v.name}>{v.label} ({v.desc})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Vitesse ({voiceSettings.speed}x)</label>
                <input 
                  type="range" min="0.5" max="2" step="0.1" 
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings(v => ({...v, speed: parseFloat(e.target.value)}))}
                  className="w-full accent-primary-500"
                />
              </div>
              <div className="flex items-center gap-4 pt-4 sm:pt-0">
                <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                  <input type="checkbox" checked={voiceSettings.autoPlay} onChange={(e) => setVoiceSettings(v => ({...v, autoPlay: e.target.checked}))} className="w-4 h-4 rounded text-primary-500" />
                  Lecture Auto
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConversation?.messages.map(m => (
            <Message key={m.id} message={m} onSpeak={(text) => speakText(text, voiceSettings.voiceName, voiceSettings.speed)} />
          ))}
          {isLoading && <Message message={{ id: 'load', role: 'assistant', text: '...' }} />}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            {imagePreview && (
              <div className="absolute bottom-full left-0 mb-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="relative group">
                  <img src={imagePreview} className="w-24 h-24 object-cover rounded-xl border-4 border-white dark:border-gray-700 shadow-xl" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                    <XCircleIcon className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl p-2 shadow-inner">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all">
                <PaperClipIcon className="w-6 h-6" />
              </button>
              
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                placeholder="Écrivez ou importez une image..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none max-h-32"
                rows={1}
              />

              <button
                type="button"
                onClick={() => { if (isListening) recognitionRef.current?.stop(); else { recognitionRef.current?.start(); setIsListening(true); } }}
                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-600'}`}
              >
                <MicrophoneIcon className="w-6 h-6" />
              </button>

              <button type="submit" disabled={isLoading || (!input.trim() && !imageFile)} className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-400 transition-all shadow-lg hover:scale-105 active:scale-95">
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
