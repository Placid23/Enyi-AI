
'use client';

import AppHeader from '@/components/layout/app-header';
import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';
import AppSidebar from '@/components/layout/app-sidebar'; // Corrected import path
import { ChatProvider, useChat } from '@/context/chat-context';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; 
import { Loader2 } from 'lucide-react';
import React from 'react'; // Imported React for useState

function AetherAssistPageContent() {
  const [currentLanguage, setCurrentLanguage] = React.useState<string>('en'); // 'en', 'zh-CN', 'pcm'

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
  } = useChatHandler(currentLanguage); // Pass currentLanguage

  const { activeChatId, isLoadingChats } = useChat();

  return (
    <SidebarProvider defaultOpen={true}> 
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20 text-foreground overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <AppHeader currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
          <main className="flex-grow flex flex-col overflow-hidden container mx-auto max-w-5xl w-full py-4 px-2 sm:px-4">
            {isLoadingChats ? (
                 <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
            ) : activeChatId ? (
              <Card className="flex flex-col flex-grow shadow-2xl rounded-xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
                <ConversationView messages={messages} />
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
                <Card className="p-8 text-center shadow-2xl rounded-xl border-border/50 bg-card/80 backdrop-blur-sm">
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
