'use client';

import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Download, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isImageFile = message.file?.type.startsWith('image/');

  const handleDownload = () => {
    if (message.file) {
      const link = document.createElement('a');
      link.href = message.file.dataUri;
      link.download = message.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className={cn(
        'flex w-full items-start space-x-3 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-10 w-10 border border-primary/20">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={24} />
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          'max-w-[75%] rounded-xl shadow-md',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        <CardContent className="p-3 space-y-2">
          {message.text && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          )}
          {message.file && (
            <div className="mt-2 p-3 border border-border rounded-lg bg-background/50 text-foreground">
              {isImageFile ? (
                <Image
                  src={message.file.dataUri}
                  alt={message.file.name}
                  width={200}
                  height={200}
                  className="rounded-md object-cover max-h-64"
                  data-ai-hint="attachment preview"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{message.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {message.file.type} - {formatFileSize(message.file.size)}
                    </p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="mt-2 w-full text-accent border-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          )}

          {message.analyzedInfo && (
            <Card className="mt-2 bg-secondary/30">
              <CardHeader className="p-2">
                <CardTitle className="text-sm flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-accent" /> Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 text-xs">
                <p><strong>Summary:</strong> {message.analyzedInfo.summary}</p>
                <p><strong>Key Insights:</strong> {message.analyzedInfo.keyInsights}</p>
              </CardContent>
              <CardFooter className="p-2 text-xs">
                <p>Confidence: {(message.analyzedInfo.confidenceLevel * 100).toFixed(0)}%</p>
              </CardFooter>
            </Card>
          )}

          {message.isError && (
             <div className="mt-2 text-destructive-foreground bg-destructive/80 p-2 rounded-md flex items-center text-xs">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>An error occurred. Please try again.</span>
            </div>
          )}
          {message.isLoading && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AetherAssist is thinking...</span>
            </div>
          )}

        </CardContent>
        {!message.isLoading && (
          <CardFooter className={cn("px-3 pb-2 pt-0 text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {message.intent && ` (Intent: ${message.intent})`}
            {message.requiresContext && <span className="ml-1 italic">(Needs context)</span>}
          </CardFooter>
        )}
      </Card>
      {isUser && (
         <Avatar className="h-10 w-10 border border-accent/30">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User size={24} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
