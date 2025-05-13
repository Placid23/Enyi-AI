'use client';

import type { Message } from '@/types';
import MessageBubble from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react'; 

interface ConversationViewProps {
  messages: Message[];
  onFeedback: (messageId: string, feedbackType: 'positive' | 'negative', correctionText?: string) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ messages, onFeedback }) => {
  const scrollAreaRootRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea's root element

  useEffect(() => {
    if (scrollAreaRootRef.current) {
      // Find the viewport element within the ScrollArea root
      const viewportElement = scrollAreaRootRef.current.querySelector<HTMLDivElement>(
        '[data-radix-scroll-area-viewport]'
      );
      if (viewportElement) {
        // Scroll to the bottom of the viewport
        viewportElement.scrollTop = viewportElement.scrollHeight;
      }
    }
  }, [messages]); // Trigger effect when messages array changes

  return (
    <ScrollArea className="flex-grow w-full p-4 md:p-6" ref={scrollAreaRootRef}> 
      {/* The div below is a direct child of ScrollArea's Viewport. 
          It no longer needs a separate ref for scrolling. */}
      <div className="h-full"> 
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="h-16 w-16 text-primary opacity-60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome to E ai!
            </h2>
            <p className="text-muted-foreground max-w-md">
              Type a message, upload a file, or use voice input to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-4"> 
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} onFeedback={onFeedback} />)}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationView;
