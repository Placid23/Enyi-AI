
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Paperclip, Send, Volume2, VolumeX, XCircle, Loader2, ImageIcon } from 'lucide-react';
import type { FileAttachment } from '@/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onVoiceInput: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageGeneratorClick: () => void;
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
  onImageGeneratorClick,
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
    <div className="bg-card border-t border-border/50 p-3 md:p-4 shadow-top-md">
      {currentFile && (
        <div className="mb-2.5 flex items-center justify-between p-2.5 bg-secondary/70 rounded-lg shadow-sm">
          <Badge variant="outline" className="text-sm border-primary/60 text-primary font-medium py-1 px-3">
            <Paperclip className="h-4 w-4 mr-2 opacity-80" />
            {currentFile.name} ({(currentFile.size / 1024).toFixed(1)} KB)
          </Badge>
          <Button variant="ghost" size="icon" onClick={clearFile} className="text-muted-foreground hover:text-destructive h-7 w-7 rounded-full">
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      )}
      <div className="flex items-end space-x-2"> {/* Reduced space from space-x-2.5 */}
        <Textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message or ask anything..."
          className="flex-grow resize-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary border-border/60 min-h-[44px] max-h-[150px] text-base p-3" // Adjusted min-height and padding
          rows={1}
          disabled={isLoading || isRecording}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          aria-label="Attach file"
          className="text-muted-foreground hover:text-primary rounded-full h-10 w-10"  // Standardized size
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*,video/*,application/pdf,.txt,.csv,.md,.json,.xml" 
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onImageGeneratorClick}
          disabled={isLoading || isRecording}
          aria-label="Generate Image"
          className="text-muted-foreground hover:text-primary rounded-full h-10 w-10" // Standardized size
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          onClick={onVoiceInput}
          disabled={isLoading}
          aria-label={isRecording ? "Stop recording" : "Start voice input"}
          className={cn(
            "rounded-full h-10 w-10", // Standardized size
            isRecording ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoiceOutput}
          aria-label={voiceOutputEnabled ? "Disable voice output" : "Enable voice output"}
          className="text-muted-foreground hover:text-primary rounded-full h-10 w-10" // Standardized size
        >
          {voiceOutputEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button
          onClick={handleSend}
          disabled={isLoading || isRecording || (!inputValue.trim() && !currentFile)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 w-10 p-0 flex items-center justify-center shadow-md" // Standardized size
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default QueryInput;
