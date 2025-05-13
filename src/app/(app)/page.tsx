
'use client';

import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';
import { useChat } from '@/context/chat-context';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useAppSettings } from '@/context/app-settings-context'; // Import useAppSettings

function EnyiPageContent() {
  const { currentLanguage } = useAppSettings(); // Get currentLanguage from the new context

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
    handleFeedback,
  } = useChatHandler(currentLanguage); // Pass currentLanguage from context

  const { activeChatId, isLoadingChats } = useChat();
  
  // Removed incorrect local AppContext definition:
  // const AppContext = React.createContext<{ currentLanguage: string } | null>(null); 

  return (
    <div className="flex-grow flex flex-col overflow-hidden container mx-auto max-w-5xl w-full py-4 px-2 sm:px-4">
      {isLoadingChats ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : activeChatId ? (
        <Card className="flex flex-col flex-grow shadow-xl rounded-xl overflow-hidden border border-border/30 bg-card backdrop-blur-md">
          <ConversationView messages={messages} onFeedback={handleFeedback} />
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
            <h2 className="text-2xl font-semibold text-primary mb-4">Welcome to E ai</h2>
            <p className="text-muted-foreground">
              Select a chat from the sidebar or start a new one.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function EnyiChatPage() {
  // AppSettingsProvider is now in (app)/layout.tsx, so EnyiPageContent
  // can use useAppSettings() correctly.
  return <EnyiPageContent />;
}
