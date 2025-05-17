
'use client';

import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Download, FileText, AlertCircle, Brain, Info, Loader2, Video, ThumbsUp, ThumbsDown, Edit3, Eye, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked'; // For rendering markdown

interface MessageBubbleProps {
  message: Message;
  onFeedback: (messageId: string, feedbackType: 'positive' | 'negative', correctionText?: string) => void;
  onRegenerate: (messageId: string) => void;
  canRegenerate: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onFeedback, onRegenerate, canRegenerate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionText, setCorrectionText] = useState(message.text || '');
  const { toast } = useToast();
  const [parsedHtml, setParsedHtml] = useState<string | TrustedHTML>('');
  const [parsedThinkingHtml, setParsedThinkingHtml] = useState<string | TrustedHTML>('');

  const isUser = message.sender === 'user';
  const isImageFile = message.file?.type.startsWith('image/');
  const isVideoFile = message.file?.type.startsWith('video/');

  useEffect(() => {
    if (message.text) {
      setParsedHtml(marked.parse(message.text) as string);
    } else if (message.streamedText) {
      setParsedHtml(marked.parse(message.streamedText) as string);
    } else {
      setParsedHtml('');
    }
  }, [message.text, message.streamedText]);

  useEffect(() => {
    if (message.thinkingProcess) {
      setParsedThinkingHtml(marked.parse(message.thinkingProcess) as string);
    } else {
      setParsedThinkingHtml('');
    }
  }, [message.thinkingProcess]);


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

  const toggleDetailsOrThoughts = () => {
    if (message.thinkingProcess) {
      setShowThinking(!showThinking);
      // If we show thinking, we might want to hide details, or vice-versa, or allow both
      // For now, let's allow both to be potentially visible if toggled,
      // but clicking the eye icon prioritizes thinking process if available.
      if (message.intent || message.requiresContext) {
         // setShowDetails(!showThinking ? !showDetails : false); // Example: Hide details if showing thinking
      }
    } else if (message.intent || message.requiresContext) {
      setShowDetails(!showDetails);
    }
  };

  const handleFeedbackClick = (feedbackType: 'positive' | 'negative') => {
    if (isCorrecting) setIsCorrecting(false);
    onFeedback(message.id, feedbackType);
  };

  const handleStartCorrection = () => {
    setCorrectionText(message.text || message.streamedText || '');
    setIsCorrecting(true);
  };

  const handleCancelCorrection = () => {
    setIsCorrecting(false);
    setCorrectionText(message.text || message.streamedText || '');
  };

  const handleSubmitCorrection = () => {
    if (!correctionText.trim()) {
      toast({
        title: "Correction Empty",
        description: "Please provide some text for the correction.",
        variant: "destructive",
      });
      return;
    }
    onFeedback(message.id, 'negative', correctionText);
    setIsCorrecting(false);
  };


  return (
    <div
      className={cn(
        'flex w-full items-end space-x-3 py-2',
        isUser ? 'justify-end pl-10 md:pl-20' : 'justify-start pr-10 md:pr-20'
      )}
    >
      {!isUser && (
        <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-sm shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <BrainCircuit size={24} strokeWidth={1.5} />
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          'max-w-[85%] rounded-2xl shadow-md',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-card text-card-foreground rounded-bl-lg border border-border/50'
        )}
      >
        <CardContent className="p-4 space-y-2.5 text-sm">
          {isCorrecting ? (
            <div className="space-y-2">
              <Textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="Enter your correction..."
                className="text-sm bg-background text-foreground"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancelCorrection}>Cancel</Button>
                <Button variant="outline" size="sm" onClick={handleSubmitCorrection} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Save Correction</Button>
              </div>
            </div>
          ) : (
            <>
              {(message.text || message.streamedText) && (
                 <div className="prose prose-sm max-w-none text-current" dangerouslySetInnerHTML={{ __html: parsedHtml as string}} />
              )}
            </>
          )}

          {message.file && (
            <div className={cn(
              "mt-2.5 p-3 border rounded-lg",
              isUser ? "border-primary-foreground/20 bg-primary/90" : "border-border bg-secondary/70 text-secondary-foreground"
            )}>
              {isImageFile ? (
                <Image
                  src={message.file.dataUri}
                  alt={message.file.name}
                  width={200}
                  height={200}
                  className="rounded-md object-cover max-h-64 w-auto shadow"
                  data-ai-hint="attachment preview"
                />
              ) : isVideoFile ? (
                <div className="flex flex-col items-center">
                  <video
                    controls
                    src={message.file.dataUri}
                    className="rounded-md max-h-64 w-auto shadow"
                    data-ai-hint="video attachment"
                    style={{maxWidth: '100%'}}
                  />
                  <p className="mt-2 font-medium text-xs">{message.file.name}</p>
                   <p className={cn("text-xs", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {message.file.type} - {formatFileSize(message.file.size)}
                    </p>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {message.file.type.startsWith('audio/') ? <Video className={cn("h-10 w-10", isUser ? "text-primary-foreground/90" : "text-accent")} /> : <FileText className={cn("h-10 w-10", isUser ? "text-primary-foreground/90" : "text-accent")} /> }
                  <div>
                    <p className="font-medium">{message.file.name}</p>
                    <p className={cn("text-xs", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {message.file.type} - {formatFileSize(message.file.size)}
                    </p>
                  </div>
                </div>
              )}
              <Button
                variant={isUser ? "ghost" : "outline"}
                size="sm"
                onClick={handleDownload}
                className={cn(
                  "mt-3 w-full text-xs py-1.5",
                  isUser ? "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" : "text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
              </Button>
            </div>
          )}

          {message.analyzedInfo && (
            <Card className={cn(
              "mt-3 shadow-inner",
              isUser ? "bg-primary/80 border-primary-foreground/20" : "bg-secondary border-border"
            )}>
              <CardHeader className="p-2.5">
                <CardTitle className="text-sm flex items-center font-semibold">
                  <Brain className="h-4 w-4 mr-2 text-accent" /> Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 text-xs space-y-1">
                <div><strong>Summary:</strong> {message.analyzedInfo.summary}</div>
                <div><strong>Key Insights:</strong> {message.analyzedInfo.keyInsights}</div>
              </CardContent>
              <CardFooter className="p-2.5 text-xs font-medium">
                Confidence: {(message.analyzedInfo.confidenceLevel * 100).toFixed(0)}%
              </CardFooter>
            </Card>
          )}

          {message.isError && (
             <div className={cn(
                "mt-2 text-xs p-2.5 rounded-lg flex items-center shadow",
                isUser ? "text-primary-foreground bg-destructive/80" : "text-destructive-foreground bg-destructive"
              )}>
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>An error occurred: {message.text || message.streamedText || 'Please try again.'}</span>
            </div>
          )}
          {message.isLoading && !message.streamedText && !message.text && (
            <div className={cn(
                "flex items-center space-x-2 text-xs mt-1",
                isUser ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Enyi is thinking...</span>
            </div>
          )}

        </CardContent>
        {!message.isLoading && !isUser && (
          <div className="px-3.5 pb-2 pt-1 flex items-center justify-between">
            <span
              className={cn(
                  "text-xs",
                  isUser ? "text-primary-foreground/70" : "text-muted-foreground",
                  (message.thinkingProcess || message.intent || message.requiresContext) ? "cursor-pointer hover:opacity-80" : ""
              )}
              onClick={toggleDetailsOrThoughts}
              role={(message.thinkingProcess || message.intent || message.requiresContext) ? "button" : undefined}
              tabIndex={(message.thinkingProcess || message.intent || message.requiresContext) ? 0 : undefined}
              onKeyDown={(e) => (message.thinkingProcess || message.intent || message.requiresContext) && (e.key === 'Enter' || e.key === ' ') && toggleDetailsOrThoughts()}
            >
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {(message.thinkingProcess || message.intent || message.requiresContext) && (
                 <Eye className={cn("inline-block h-3.5 w-3.5 ml-1 align-text-bottom", (showThinking || showDetails) ? "text-accent" : "opacity-70")} />
              )}
            </span>
            {!isCorrecting && (
              <div className="flex items-center space-x-1.5">
                <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-md p-0.5", message.feedback === 'positive' ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10')} onClick={() => handleFeedbackClick('positive')} aria-label="Good response">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-md p-0.5", message.feedback === 'negative' && !message.correction ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10')} onClick={() => handleFeedbackClick('negative')} aria-label="Bad response">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
                 <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-md p-0.5", message.correction ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10')} onClick={handleStartCorrection} aria-label="Correct response">
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                {canRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRegenerate(message.id)}
                    className="h-6 w-6 rounded-md p-0.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    aria-label="Regenerate response"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        {/* Show timestamp only for user messages in the footer to avoid double timestamp on AI messages */}
        {(isUser && !message.isLoading) && (
           <CardFooter
            className={cn(
              "px-3.5 pb-2 pt-1 text-xs flex items-center justify-end",
              "text-primary-foreground/70"
            )}
          >
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </CardFooter>
        )}

         {showThinking && message.thinkingProcess && !isUser && (
            <CardContent className="px-3.5 pb-3 pt-1 border-t text-xs prose prose-sm max-w-none"
              style={{borderColor: 'hsl(var(--border))'}}
              dangerouslySetInnerHTML={{ __html: parsedThinkingHtml as string }}
            />
        )}
         {showDetails && (message.intent || message.requiresContext) && !isUser && (
            <CardContent className="px-3.5 pb-3 pt-1 border-t text-xs"
              style={{borderColor: 'hsl(var(--border))'}}
            >
                {message.intent && <p className="italic text-muted-foreground"><strong>Intent:</strong> {message.intent}</p>}
                {message.requiresContext && <p className="italic text-muted-foreground">Query may require more context.</p>}
            </CardContent>
        )}
      </Card>
      {isUser && (
         <Avatar className="h-10 w-10 border-2 border-border shadow-sm shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User size={22} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;

