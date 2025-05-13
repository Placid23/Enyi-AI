
'use client';

import type { Message } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
  lastUpdatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  isLoadingChats: boolean;
  setActiveChatId: (chatId: string | null) => void;
  createNewChat: () => Promise<string>;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  addMessageToChat: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessageInChat: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  getActiveChat: () => Chat | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHATS_STORAGE_KEY = 'enyi-chats';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  useEffect(() => {
    let loadedChats: Chat[] = [];
    let initialActiveChatId: string | null = null;
    try {
      const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
      if (storedChats) {
        const parsedChats: Chat[] = JSON.parse(storedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          lastUpdatedAt: new Date(chat.lastUpdatedAt || chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        loadedChats = parsedChats;
        if (parsedChats.length > 0) {
            const sortedChats = [...parsedChats].sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
            initialActiveChatId = sortedChats[0].id;
        }
      }
    } catch (error) {
      console.error("Failed to load chats from localStorage", error);
    }
    
    setChats(loadedChats);
    setActiveChatIdState(initialActiveChatId); 
    setIsLoadingChats(false);
  }, []);


  useEffect(() => {
    if (!isLoadingChats) {
      try {
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
      } catch (error)
      {
        console.error("Failed to save chats to localStorage", error);
      }
    }
  }, [chats, isLoadingChats]);
  
  const createNewChat = useCallback(async (): Promise<string> => {
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      createdAt: new Date(),
      messages: [],
      lastUpdatedAt: new Date(),
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatIdState(newChatId);
    return newChatId;
  }, []);

  // Automatically create a new chat if none is active after loading
  useEffect(() => {
    if (!isLoadingChats && activeChatId === null) {
      createNewChat();
    }
  }, [isLoadingChats, activeChatId, createNewChat]);


  const setActiveChatId = useCallback((chatId: string | null) => {
    setActiveChatIdState(chatId);
  }, []);


  const deleteChat = useCallback((chatId: string) => {
    setChats((prevChats) => {
      const remainingChats = prevChats.filter((chat) => chat.id !== chatId);
      if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
          const sortedRemaining = [...remainingChats].sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
          setActiveChatIdState(sortedRemaining[0].id);
        } else {
          // If all chats are deleted, create a new one
          createNewChat();
        }
      }
      return remainingChats;
    });
  }, [activeChatId, createNewChat]);

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title, lastUpdatedAt: new Date() } : chat
      )
    );
  }, []);

  const addMessageToChat = useCallback((chatId: string, messageContent: Omit<Message, 'id' | 'timestamp'>): string => {
    const messageId = uuidv4();
    const newMessage: Message = {
      ...messageContent,
      id: messageId,
      timestamp: new Date(),
    };

    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, newMessage], lastUpdatedAt: new Date() }
          : chat
      );

      // Auto-update chat title with first user message if it's "New Chat"
      const currentChat = updatedChats.find(c => c.id === chatId);
      if (currentChat && messageContent.sender === 'user' && messageContent.text) {
          if (currentChat.title === 'New Chat' && currentChat.messages.filter(m => m.sender === 'user' && m.text).length === 1) { 
              const newTitle = messageContent.text.substring(0, 30) + (messageContent.text.length > 30 ? "..." : "");
              return updatedChats.map(c => c.id === chatId ? {...c, title: newTitle} : c);
          }
      }
      return updatedChats;
    });
    return messageId;
  }, []);

  const updateMessageInChat = useCallback(
    (chatId: string, messageId: string, updates: Partial<Message>) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                lastUpdatedAt: new Date(),
              }
            : chat
        )
      );
    },
    []
  );

  const getActiveChat = useCallback((): Chat | undefined => {
    return chats.find((chat) => chat.id === activeChatId);
  }, [chats, activeChatId]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        isLoadingChats,
        setActiveChatId,
        createNewChat,
        deleteChat,
        updateChatTitle,
        addMessageToChat,
        updateMessageInChat,
        getActiveChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

