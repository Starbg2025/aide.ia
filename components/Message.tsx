
import React from 'react';
import { Message as MessageType } from '../types';
import { UserIcon, AssistantIcon, VolumeUpIcon } from './Icons';

interface MessageProps {
  message: MessageType;
  onSpeak?: (text: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onSpeak }) => {
  const { role, text, image } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-300`}>
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isUser ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
        {isUser ? <UserIcon className="w-5 h-5" /> : <AssistantIcon className="w-5 h-5 text-primary-500" />}
      </div>
      
      <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {image && (
          <img src={image} className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-full max-h-64 object-cover" alt="Image jointe" />
        )}
        
        <div className={`relative group px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-primary-600 text-white rounded-tr-none shadow-primary-500/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'}`}>
          {text === '...' ? (
            <div className="flex gap-1 py-1">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{text}</p>
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
