'use client';

import type { Message } from '@/types';
import MessageBubble from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';

interface ConversationViewProps {
  messages: Message[];
}

const ConversationView: React.FC<ConversationViewProps> = ({ messages }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow w-full p-4" ref={scrollAreaRef}>
      <div ref={viewportRef} className="h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-heart mb-4">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
              <path d="M15.81 12.5A2.5 2.5 0 0 0 12.5 10a2.51 2.51 0 0 0-2.33 1.47L8.82 15c.61.42 1.33.72 2.1.91l1.44-2.16A2.42 2.42 0 0 0 12.5 13a2.5 2.5 0 0 0 2.5-2.5c0-.7-.2-1.3-.55-1.81"/>
            </svg>
            <p className="text-lg">Welcome to AetherAssist!</p>
            <p className="text-sm">Type your query or use voice input to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationView;
