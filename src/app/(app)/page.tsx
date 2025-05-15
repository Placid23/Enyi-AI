
'use client';

import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';
import { useChat } from '@/context/chat-context';
import { Loader2 } from 'lucide-react';
import React from 'react'; 
import { useAppSettings } from '@/context/app-settings-context'; 
import ImageGeneratorDialog from '@/components/image-generator/image-generator-dialog'; 

function EnyiPageContent() {
  const { currentLanguage } = useAppSettings(); // Removed showThinkingProcess
  const [isImageGeneratorDialogOpen, setIsImageGeneratorDialogOpen] = React.useState(false);

  const {
    messages,
    inputValue,
    setInputValue,
    isGeneratingResponse, 
    isRecording,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    currentFile,
    setCurrentFile,
    handleSendMessage,
    handleVoiceInput,
    handleFileChange,
    handleFeedback,
    handleRegenerateLastResponse,
    lastUserMessageDetails,
    abortControllerRef, // Retain this for stop generating logic
    handleStopGenerating,
  } = useChatHandler(currentLanguage); 

  const { activeChatId, isLoadingChats } = useChat();
  
  const handleImageGeneratorClick = () => {
    setIsImageGeneratorDialogOpen(true);
  };

  return (
    <>
      <div className="flex-grow flex flex-col overflow-hidden w-full">
        {isLoadingChats ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : activeChatId ? (
          <Card className="flex flex-col flex-grow shadow-xl rounded-none sm:rounded-xl overflow-hidden border-0 sm:border border-border/30 bg-card backdrop-blur-md">
            <ConversationView 
              messages={messages} 
              onFeedback={handleFeedback} 
              onRegenerate={handleRegenerateLastResponse}
              canRegenerate={!!(lastUserMessageDetails && (lastUserMessageDetails.query || lastUserMessageDetails.file))}
            />
            <QueryInput
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              onVoiceInput={handleVoiceInput}
              onFileChange={handleFileChange}
              onImageGeneratorClick={handleImageGeneratorClick}
              isRecording={isRecording}
              isGeneratingResponse={isGeneratingResponse}
              currentFile={currentFile}
              clearFile={() => setCurrentFile(null)}
              voiceOutputEnabled={voiceOutputEnabled}
              toggleVoiceOutput={() => setVoiceOutputEnabled(prev => !prev)}
              onStopGenerating={handleStopGenerating}
              // Removed showThinkingProcessToggle and isThinkingProcessVisible props
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
