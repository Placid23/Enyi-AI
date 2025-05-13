'use client';

import AppHeader from '@/components/layout/app-header';
import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';
import AppSidebar from '@/components/layout/app-sidebar';
import { ChatProvider, useChat } from '@/context/chat-context';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; 
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FacialSentimentAnalyzer from '@/components/facial-sentiment/facial-sentiment-analyzer';

function AetherAssistPageContent() {
  const [currentLanguage, setCurrentLanguage] = React.useState<string>('en'); 
  const [isFacialSentimentDialogOpen, setIsFacialSentimentDialogOpen] = useState(false);

  const {
    messages,
    inputValue,
    setInputValue,
    isLoading: isSendingMessage, 
    isRecording,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    currentFile,
    setCurrentFile,
    handleSendMessage,
    handleVoiceInput,
    handleFileChange,
    handleFeedback, // Destructure handleFeedback
  } = useChatHandler(currentLanguage); 

  const { activeChatId, isLoadingChats } = useChat();

  return (
    <SidebarProvider defaultOpen={true}> 
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <AppHeader 
            currentLanguage={currentLanguage} 
            onLanguageChange={setCurrentLanguage}
            onFacialSentimentClick={() => setIsFacialSentimentDialogOpen(true)} 
          />
          <main className="flex-grow flex flex-col overflow-hidden container mx-auto max-w-5xl w-full py-4 px-2 sm:px-4">
            {isLoadingChats ? (
                 <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
            ) : activeChatId ? (
              <Card className="flex flex-col flex-grow shadow-xl rounded-xl overflow-hidden border border-border/30 bg-card backdrop-blur-md">
                <ConversationView messages={messages} onFeedback={handleFeedback} /> {/* Pass handleFeedback */}
                <QueryInput
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSendMessage={handleSendMessage}
                  onVoiceInput={handleVoiceInput}
                  onFileChange={handleFileChange}
                  isRecording={isRecording}
                  isLoading={isSendingMessage}
                  currentFile={currentFile}
                  clearFile={() => setCurrentFile(null)}
                  voiceOutputEnabled={voiceOutputEnabled}
                  toggleVoiceOutput={() => setVoiceOutputEnabled(prev => !prev)}
                />
              </Card>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <Card className="p-8 text-center shadow-xl rounded-xl border-border/30 bg-card backdrop-blur-md">
                  <h2 className="text-2xl font-semibold text-primary mb-4">Welcome to AetherAssist</h2>
                  <p className="text-muted-foreground">
                    Select a chat from the sidebar or start a new one to begin.
                  </p>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
      <Dialog open={isFacialSentimentDialogOpen} onOpenChange={setIsFacialSentimentDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Facial Sentiment Analysis</DialogTitle>
            <DialogDescription>
              Allow camera access, position your face in the view, and click "Analyze Sentiment".
            </DialogDescription>
          </DialogHeader>
          <FacialSentimentAnalyzer />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default function AetherAssistPage() {
  return (
    <ChatProvider>
      <AetherAssistPageContent />
    </ChatProvider>
  );
}
