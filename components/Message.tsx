
import React from 'react';
import { Message as MessageType } from '../types';
import { UserIcon, AssistantIcon } from './Icons';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { role, text, image } = message;
  const isUser = role === 'user';

  const containerClasses = `flex gap-3 max-w-xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`;
  const bubbleClasses = `px-4 py-3 rounded-2xl ${isUser ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`;
  const avatar = isUser ? 
    <UserIcon className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 p-1"/> : 
    <AssistantIcon className="w-8 h-8 rounded-full bg-primary-500 text-white p-1"/>;

  return (
    <div className={containerClasses}>
      <div className="w-8 h-8 flex-shrink-0 mt-1">{avatar}</div>
      <div className={`${bubbleClasses} flex flex-col gap-2`}>
        {image && <img src={image} alt="User upload" className="rounded-lg max-w-xs" />}
        {text === '...' ? (
            <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-current rounded-full animate-bounce"></span>
            </div>
        ) : (
            <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
