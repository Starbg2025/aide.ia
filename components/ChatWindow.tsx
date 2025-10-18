import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message as MessageType } from '../types';
import { generateResponse } from '../services/geminiService';
import Message from './Message';
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon, MicrophoneIcon } from './Icons';

// Add SpeechRecognition interfaces for TypeScript to avoid errors
// for a browser API that might not be in default TS DOM libs.
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

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('aideia-chat');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
          return;
        }
      }
      // Set initial message if nothing is saved or history is empty
      setMessages([
        { id: 'initial', role: 'assistant', text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }
      ]);
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
      // Fallback to initial message on error
      setMessages([
        { id: 'initial', role: 'assistant', text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }
      ]);
    }
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

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            alert("L'accès au microphone a été refusé. Vous pouvez le réactiver dans les paramètres de votre navigateur.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("L'API Web Speech n'est pas supportée par ce navigateur.");
    }
  }, []);


  useEffect(() => {
    try {
        // Don't save the initial message if it's the only one
        if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'initial')) {
            localStorage.setItem('aideia-chat', JSON.stringify(messages));
        }
    } catch (error) {
        console.error("Failed to save messages to localStorage", error);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

      if (file.size > MAX_FILE_SIZE) {
        alert("Le fichier est trop volumineux. Veuillez choisir une image de moins de 4 Mo.");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!input.trim() && !imageFile)) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      ...(imagePreview && { image: imagePreview }),
    };
    
    // Replace initial message if it's the first user message
    const newMessages = messages.length === 1 && messages[0].id === 'initial'
      ? [userMessage]
      : [...messages, userMessage];


    setMessages(newMessages);
    setInput('');
    removeImage();
    setIsLoading(true);

    try {
      const responseText = await generateResponse(input, imageFile ?? undefined);
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Désolé, une erreur est survenue. Veuillez réessayer.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleToggleListening = () => {
      if (!recognitionRef.current) {
          alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
          return;
      }
      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-200px)] max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map(msg => <Message key={msg.id} message={msg} />)}
          {isLoading && <Message message={{ id: 'loading', role: 'assistant', text: '...' }} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="relative">
          {imagePreview && (
             <div className="relative w-24 h-24 mb-2">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-red-500"
                >
                   <XCircleIcon className="w-5 h-5"/>
                </button>
             </div>
          )}
          <div className="relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question ici..."
              className="w-full pl-12 pr-28 py-3 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
              rows={1}
              style={{ minHeight: '52px' }}
              onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden"
            />
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Attach file"
            >
                <PaperClipIcon className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleToggleListening}
              className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
                isListening
                  ? 'text-white bg-red-500 animate-pulse'
                  : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label={isListening ? "Arrêter l'écoute" : "Commencer l'écoute"}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !imageFile)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-110"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;