'use client';

import AppHeader from '@/components/layout/app-header';
import ConversationView from '@/components/chat/conversation-view';
import QueryInput from '@/components/chat/query-input';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { Card } from '@/components/ui/card';

export default function AetherAssistPage() {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isRecording,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    currentFile,
    setCurrentFile,
    handleSendMessage,
    handleVoiceInput,
    handleFileChange,
  } = useChatHandler();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow flex flex-col overflow-hidden container mx-auto max-w-4xl w-full py-4">
        <Card className="flex flex-col flex-grow shadow-xl rounded-xl overflow-hidden">
          <ConversationView messages={messages} />
          <QueryInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onVoiceInput={handleVoiceInput}
            onFileChange={handleFileChange}
            isRecording={isRecording}
            isLoading={isLoading}
            currentFile={currentFile}
            clearFile={() => setCurrentFile(null)}
            voiceOutputEnabled={voiceOutputEnabled}
            toggleVoiceOutput={() => setVoiceOutputEnabled(prev => !prev)}
          />
        </Card>
      </main>
      <footer className="text-center py-2 text-xs text-muted-foreground">
        AetherAssist &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
