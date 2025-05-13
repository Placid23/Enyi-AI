'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Not used directly, but Textarea is
import { Textarea } from '@/components/ui/textarea';
import { Mic, Paperclip, Send, Volume2, VolumeX, XCircle, Loader2 } from 'lucide-react';
import type { FileAttachment } from '@/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

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
    <div className="bg-card border-t border-border/70 p-3 md:p-4 shadow-top-lg"> {/* Stronger shadow */}
      {currentFile && (
        <div className="mb-2 flex items-center justify-between p-2.5 bg-secondary rounded-lg shadow-sm">
          <Badge variant="outline" className="text-sm border-primary/50 text-primary font-medium">
            <Paperclip className="h-4 w-4 mr-2" />
            {currentFile.name} ({(currentFile.size / 1024).toFixed(1)} KB)
          </Badge>
          <Button variant="ghost" size="icon" onClick={clearFile} className="text-muted-foreground hover:text-destructive h-7 w-7">
            <XCircle className="h-4.5 w-4.5" /> {/* Slightly larger X */}
          </Button>
        </div>
      )}
      <div className="flex items-end space-x-2">
        <Textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message or ask anything..."
          className="flex-grow resize-none rounded-xl shadow-inner focus:ring-2 focus:ring-primary border-border/80 min-h-[44px] max-h-[150px] text-base p-3" // Enhanced styling
          rows={1}
          disabled={isLoading || isRecording}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          aria-label="Attach file"
          className="text-muted-foreground hover:text-primary rounded-full h-11 w-11" // Rounded full, consistent size
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
          className={cn(
            "rounded-full h-11 w-11",
            isRecording ? "bg-destructive hover:bg-destructive/90" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoiceOutput}
          aria-label={voiceOutputEnabled ? "Disable voice output" : "Enable voice output"}
          className="text-muted-foreground hover:text-primary rounded-full h-11 w-11"
        >
          {voiceOutputEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button
          onClick={handleSend}
          disabled={isLoading || isRecording || (!inputValue.trim() && !currentFile)}
          className="bg-gradient-to-r from-accent via-accent/90 to-accent/80 hover:opacity-90 text-accent-foreground rounded-full h-11 w-11 p-0 flex items-center justify-center shadow-md" // Gradient, rounded-full
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default QueryInput;
