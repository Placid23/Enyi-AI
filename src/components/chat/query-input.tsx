'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Paperclip, Send, Volume2, VolumeX, XCircle } from 'lucide-react';
import type { FileAttachment } from '@/types';
import { Badge } from '../ui/badge';

interface QueryInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onVoiceInput: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isRecording: boolean;
  isLoading: boolean;
  currentFile: FileAttachment | null;
  clearFile: () => void;
  voiceOutputEnabled: boolean;
  toggleVoiceOutput: () => void;
}

const QueryInput: React.FC<QueryInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  onVoiceInput,
  onFileChange,
  isRecording,
  isLoading,
  currentFile,
  clearFile,
  voiceOutputEnabled,
  toggleVoiceOutput,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim() || currentFile) {
      onSendMessage();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card border-t p-4 shadow-top-md">
      {currentFile && (
        <div className="mb-2 flex items-center justify-between p-2 bg-secondary rounded-md">
          <Badge variant="outline" className="text-sm">
            <Paperclip className="h-4 w-4 mr-2" />
            {currentFile.name} ({(currentFile.size / 1024).toFixed(1)} KB)
          </Badge>
          <Button variant="ghost" size="icon" onClick={clearFile} className="text-muted-foreground hover:text-destructive">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-end space-x-2">
        <Textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message or query..."
          className="flex-grow resize-none rounded-lg shadow-inner focus:ring-2 focus:ring-accent min-h-[40px] max-h-[120px]"
          rows={1}
          disabled={isLoading || isRecording}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          aria-label="Attach file"
          className="text-muted-foreground hover:text-accent"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*,application/pdf,.txt,.csv,.md,.json,.xml" 
        />
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          onClick={onVoiceInput}
          disabled={isLoading}
          aria-label={isRecording ? "Stop recording" : "Start voice input"}
          className={isRecording ? "" : "text-muted-foreground hover:text-accent"}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoiceOutput}
          aria-label={voiceOutputEnabled ? "Disable voice output" : "Enable voice output"}
          className="text-muted-foreground hover:text-accent"
        >
          {voiceOutputEnabled ? <Volume2 className="h-5 w-5 text-accent" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button
          onClick={handleSend}
          disabled={isLoading || isRecording || (!inputValue.trim() && !currentFile)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default QueryInput;
