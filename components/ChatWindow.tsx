
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message as MessageType, Conversation } from '../types';
import { generateResponse } from '../services/geminiService';
import Message from './Message';
import ConversationSidebar from './ConversationSidebar';
import { PaperAirplaneIcon, MicrophoneIcon, MenuIcon } from './Icons';

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
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const createNewConversation = (): Conversation => ({
  id: Date.now().toString() + Math.random().toString(36).substring(2),
  title: 'Nouvelle discussion',
  messages: [
    { id: 'initial', role: 'assistant', text: "Bonjour ! Je suis AideIA, propulsé par DeepSeek R1. Comment puis-je vous aider aujourd'hui ?" }
  ]
});


const ChatWindow: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('aideia-conversations');
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        if (Array.isArray(parsedConversations) && parsedConversations.length > 0) {
          setConversations(parsedConversations);
          setActiveConversationId(parsedConversations[0].id);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load conversations", error);
    }
    const newConversation = createNewConversation();
    setConversations([newConversation]);
    setActiveConversationId(newConversation.id);
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prevInput => prevInput ? `${prevInput.trim()} ${transcript}` : transcript);
      };
      recognition.onerror = () => setIsListening(false);
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

  const handleNewChat = useCallback(() => {
    const newConversation = createNewConversation();
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setInput('');
    setIsSidebarOpen(false);
  }, []);
  
  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    if (window.confirm("Supprimer cette discussion ?")) {
      setConversations(prev => {
        const remaining = prev.filter(c => c.id !== id);
        if (remaining.length === 0) {
          const newConv = createNewConversation();
          setActiveConversationId(newConv.id);
          return [newConv];
        }
        if (activeConversationId === id) setActiveConversationId(remaining[0].id);
        return remaining;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !input.trim() || !activeConversationId) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };
    
    const isFirstUserMessage = activeConversation?.messages.length === 1 && activeConversation.messages[0].id === 'initial';
    const newTitle = isFirstUserMessage ? input.trim().substring(0, 35) : activeConversation?.title;

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        return { 
          ...conv, 
          title: newTitle, 
          messages: isFirstUserMessage ? [userMessage] : [...conv.messages, userMessage] 
        };
      }
      return conv;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateResponse(input);
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
      };
      setConversations(prev => prev.map(conv => {
          if (conv.id === activeConversationId) {
              return { ...conv, messages: [...conv.messages, assistantMessage] };
          }
          return conv;
      }));
    } catch (error) {
      console.error(error);
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Désolé, une erreur est survenue.",
      };
      setConversations(prev => prev.map(conv => {
          if (conv.id === activeConversationId) {
              return { ...conv, messages: [...conv.messages, errorMessage] };
          }
          return conv;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className={`md:hidden fixed inset-0 bg-black/30 z-30 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
        <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            isSidebarOpen={isSidebarOpen}
        />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-1 mr-3 text-gray-500 dark:text-gray-400">
                  <MenuIcon className="w-6 h-6"/>
              </button>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[150px] md:max-w-xs">
                  {activeConversation?.title || 'Conversation'}
              </h2>
            </div>
            <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
              DeepSeek R1
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col gap-4">
            {(activeConversation?.messages || []).map(msg => <Message key={msg.id} message={msg} />)}
            {isLoading && <Message message={{ id: 'loading', role: 'assistant', text: '...' }} />}
            <div ref={messagesEndRef} />
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
                <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                placeholder="Posez votre question à AideIA..."
                className="w-full pl-4 pr-24 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
                rows={1}
                style={{ minHeight: '52px' }}
                />
                <button
                type="button"
                onClick={() => {
                  if (isListening) recognitionRef.current?.stop();
                  else { recognitionRef.current?.start(); setIsListening(true); }
                }}
                className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${isListening ? 'text-white bg-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                <MicrophoneIcon className="w-6 h-6" />
                </button>
                <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all transform hover:scale-110"
                >
                <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
