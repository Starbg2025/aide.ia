
import React, { useState } from 'react';
import { Message as MessageType } from '../types';
import { UserIcon, AssistantIcon, VolumeUpIcon, BrainIcon } from './Icons';

interface MessageProps {
  message: MessageType;
  onSpeak?: (text: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onSpeak }) => {
  const { role, text, reasoning_details } = message;
  const isUser = role === 'user';
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-300`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
        {isUser ? <UserIcon className="w-6 h-6" /> : <AssistantIcon className="w-6 h-6 text-primary-500" />}
      </div>
      
      <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Affichage du raisonnement si présent */}
        {!isUser && reasoning_details && (
          <div className="w-full mb-1">
            <button 
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors mb-1"
            >
              <BrainIcon className="w-3 h-3" />
              {showReasoning ? "Masquer le raisonnement" : "Voir le raisonnement"}
            </button>
            {showReasoning && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-l-2 border-primary-500 rounded-lg text-xs italic text-gray-500 dark:text-gray-400 mb-2 animate-in slide-in-from-top-1 duration-200">
                {typeof reasoning_details === 'string' ? reasoning_details : JSON.stringify(reasoning_details, null, 2)}
              </div>
            )}
          </div>
        )}

        <div className={`relative group px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-primary-600 text-white rounded-tr-none shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700'}`}>
          {text === '...' ? (
            <div className="flex gap-1 py-1">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{text}</div>
              {!isUser && text && (
                <button 
                  onClick={() => onSpeak?.(text)} 
                  className="absolute -right-10 top-0 p-2 text-gray-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Réécouter"
                >
                  <VolumeUpIcon className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
