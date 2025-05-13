'use client';

import type { Message } from '@/types';
import MessageBubble from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react'; 

interface ConversationViewProps {
  messages: Message[];
  onFeedback: (messageId: string, feedbackType: 'positive' | 'negative', correctionText?: string) => void; // Added onFeedback prop
}

const ConversationView: React.FC<ConversationViewProps> = ({ messages, onFeedback }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow w-full p-4 md:p-6" ref={scrollAreaRef}> 
      <div ref={viewportRef} className="h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="h-16 w-16 text-primary opacity-60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome to AetherAssist!
            </h2>
            <p className="text-muted-foreground max-w-md">
              Type a message, upload a file, or use voice input to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-4"> 
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} onFeedback={onFeedback} />)} {/* Pass onFeedback */}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationView;
