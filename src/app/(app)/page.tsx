
'use client';

import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';
import { useChat } from '@/context/chat-context';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react'; // Added useState
import { useAppSettings } from '@/context/app-settings-context'; 
import ImageGeneratorDialog from '@/components/image-generator/image-generator-dialog'; // Import the dialog

function EnyiPageContent() {
  const { currentLanguage } = useAppSettings(); 
  const [isImageGeneratorDialogOpen, setIsImageGeneratorDialogOpen] = useState(false); // State for dialog

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
  } = useChatHandler(currentLanguage); 

  const { activeChatId, isLoadingChats } = useChat();
  
  const handleImageGeneratorClick = () => {
    setIsImageGeneratorDialogOpen(true); // Open the dialog
  };

  return (
    <>
      <div className="flex-grow flex flex-col overflow-hidden w-full">
        {isLoadingChats ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : activeChatId ? (
          <Card className="flex flex-col flex-grow shadow-xl rounded-none sm:rounded-xl overflow-hidden border-0 sm:border border-border/30 bg-card backdrop-blur-md h-full">
            <ConversationView messages={messages} onFeedback={handleFeedback} />
            <QueryInput
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              onVoiceInput={handleVoiceInput}
              onFileChange={handleFileChange}
              onImageGeneratorClick={handleImageGeneratorClick} // Pass the handler
              isRecording={isRecording}
              isLoading={isSendingMessage}
              currentFile={currentFile}
              clearFile={() => setCurrentFile(null)}
              voiceOutputEnabled={voiceOutputEnabled}
              toggleVoiceOutput={() => setVoiceOutputEnabled(prev => !prev)}
            />
          </Card>
        ) : (
          <div className="flex-grow flex items-center justify-center p-4">
            <Card className="p-8 text-center shadow-xl rounded-xl border-border/30 bg-card backdrop-blur-md">
              <h2 className="text-2xl font-semibold text-primary mb-4">Welcome to E ai</h2>
              <p className="text-muted-foreground">
                Select a chat from the sidebar or start a new one.
              </p>
            </Card>
          </div>
        )}
      </div>
      <ImageGeneratorDialog 
        isOpen={isImageGeneratorDialogOpen}
        onOpenChange={setIsImageGeneratorDialogOpen}
      />
    </>
  );
}

export default function EnyiChatPage() {
  return <EnyiPageContent />;
}
