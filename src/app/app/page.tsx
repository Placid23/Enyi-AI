
'use client';

import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';
import { useChat } from '@/context/chat-context';
import { Loader2, BrainCircuit } from 'lucide-react';
import React from 'react';
import ImageGeneratorDialog from '@/components/image-generator/image-generator-dialog';

function EnyiPageContent() {
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
    abortControllerRef,
    handleStopGenerating,
  } = useChatHandler();

  const { activeChatId, isLoadingChats } = useChat();

  const handleImageGeneratorClick = () => {
    setIsImageGeneratorDialogOpen(true);
  };

  return (
    <>
      <div className="flex-grow flex flex-col overflow-hidden w-full h-full">
        {isLoadingChats ? (
          <div className="flex-grow flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : activeChatId ? (
          <Card className="flex flex-col flex-grow w-full h-full shadow-xl rounded-none sm:rounded-xl overflow-hidden border-0 sm:border border-border/30 bg-card"> {/* Added w-full here */}
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
            />
          </Card>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 h-full">
            <Card className="p-8 sm:p-10 md:p-12 shadow-xl rounded-xl border-border/30 bg-card max-w-lg">
              <BrainCircuit className="h-16 w-16 sm:h-20 sm:w-20 text-primary mx-auto mb-6 opacity-80" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-4">Welcome to E ai</h2>
              <p className="text-muted-foreground sm:text-lg mb-1">
                Your intelligent assistant for seamless interaction.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">
                Enyi can understand files, generate images, converse in multiple languages, and more.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">
                Type a message below, or click the Enyi logo in the sidebar to start a new chat.
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
