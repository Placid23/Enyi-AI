'use client';

import type { Message } from '@/types';
import MessageBubble from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react'; // Changed icon

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
    <ScrollArea className="flex-grow w-full p-4 md:p-6" ref={scrollAreaRef}> {/* Added responsive padding */}
      <div ref={viewportRef} className="h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles className="h-16 w-16 text-primary opacity-70 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Hello! How can I assist you today?
            </h2>
            <p className="text-muted-foreground max-w-md">
              Ask me anything, upload a file for analysis, or use voice commands to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4"> {/* Added space between messages */}
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationView;
