import React from 'react';
import { Conversation } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isSidebarOpen: boolean;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isSidebarOpen
}) => {
  return (
    <div className={`
      bg-gray-100 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col transition-transform duration-300 ease-in-out
      fixed z-40 inset-y-0 left-0 w-64 border-r border-gray-200 dark:border-gray-700
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:static md:translate-x-0 md:bg-gray-100 md:dark:bg-gray-900/50 md:backdrop-blur-none
    `}>
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nouvelle discussion
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          <ul>
            {conversations.map((conv) => (
              <li key={conv.id} className="relative group my-1">
                <button
                  onClick={() => onSelectChat(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors ${
                    conv.id === activeConversationId
                      ? 'bg-primary-100 dark:bg-primary-900/80 text-primary-700 dark:text-primary-200 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {conv.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(conv.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Supprimer la discussion"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ConversationSidebar;
