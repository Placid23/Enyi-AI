'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, FileAttachment } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { interpretUserQuery } from '@/ai/flows/interpret-user-query';
import type { InterpretUserQueryOutput } from '@/ai/flows/interpret-user-query';
import { generateHumanLikeResponse } from '@/ai/flows/generate-human-like-response';
import { understandVoiceInput } from '@/ai/flows/understand-voice-input';
import { speakResponse } from '@/ai/flows/speak-response';
import { importAndProcessFile } from '@/ai/flows/import-and-process-file';
import { analyzeInformation as analyzeInformationFlow } from '@/ai/flows/analyze-information';


export function useChatHandler() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileAttachment | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    audioPlayerRef.current = new Audio();
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  const addMessage = useCallback((sender: 'user' | 'ai', text?: string, file?: FileAttachment, isLoading?: boolean, isError?: boolean, analyzedInfo?: Message['analyzedInfo'], intent?: string, requiresContext?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      sender,
      text,
      file,
      timestamp: new Date(),
      isLoading,
      isError,
      analyzedInfo,
      intent,
      requiresContext,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  }, []);

  const playAudioResponse = useCallback(async (text: string) => {
    if (!voiceOutputEnabled || !audioPlayerRef.current) return;
    try {
      const { audioDataUri } = await speakResponse({ text });
      audioPlayerRef.current.src = audioDataUri;
      audioPlayerRef.current.play().catch(e => console.error("Error playing audio:", e));
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({ title: 'Voice Output Error', description: 'Could not generate speech.', variant: 'destructive' });
    }
  }, [voiceOutputEnabled, toast]);


  const handleSendMessage = useCallback(async (query: string, attachedFile?: FileAttachment) => {
    if (!query.trim() && !attachedFile) return;

    setIsLoading(true);
    const userMessageId = addMessage('user', query.trim() || (attachedFile ? "File attached" : ""), attachedFile);
    setInputValue('');
    setCurrentFile(null);

    const aiThinkingMessageId = addMessage('ai', undefined, undefined, true);

    try {
      // 1. Interpret Query
      const interpretation: InterpretUserQueryOutput = await interpretUserQuery({ query, context: messages.slice(-5).map(m => `${m.sender}: ${m.text || "file"}`).join('\n') });
      updateMessage(aiThinkingMessageId, { intent: interpretation.intent, requiresContext: interpretation.requiresContext });
      
      let aiResponseText = '';
      let analysisResult: Message['analyzedInfo'] | undefined = undefined;

      if (attachedFile) {
        // 2a. Handle File Input
        const { answer } = await importAndProcessFile({ fileDataUri: attachedFile.dataUri, query: interpretation.intent || query });
        aiResponseText = answer;
        
        // Optionally, perform deeper analysis on the file content or AI's answer about the file
        if (interpretation.intent.toLowerCase().includes("analyze") || interpretation.intent.toLowerCase().includes("summary")) {
             const { summary, keyInsights, confidenceLevel } = await analyzeInformationFlow({ information: answer, query: interpretation.intent });
             analysisResult = { summary, keyInsights, confidenceLevel };
        }

      } else if (interpretation.intent.toLowerCase().includes("research") || interpretation.intent.toLowerCase().includes("analyze")) {
        // 2b. Deep Research / Information Analysis
        const { summary, keyInsights, confidenceLevel } = await analyzeInformationFlow({ information: query, query: interpretation.intent });
        aiResponseText = `${summary}\n\nKey Insights: ${keyInsights}`;
        analysisResult = { summary, keyInsights, confidenceLevel };
      } else {
        // 2c. Generate Standard Response
        const knowledgeBase = messages.filter(m => m.sender === 'ai' && m.text).slice(-3).map(m => m.text).join('\n');
        const { response } = await generateHumanLikeResponse({ query: interpretation.intent, knowledgeBase });
        aiResponseText = response;
      }
      
      updateMessage(aiThinkingMessageId, { text: aiResponseText, isLoading: false, analyzedInfo: analysisResult });
      if (voiceOutputEnabled) {
        await playAudioResponse(aiResponseText);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      updateMessage(aiThinkingMessageId, { text: "Sorry, I encountered an error.", isLoading: false, isError: true });
      toast({ title: 'Error', description: 'Could not process your request.', variant: 'destructive' });
       if (voiceOutputEnabled) {
        await playAudioResponse("Sorry, I encountered an error.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, updateMessage, playAudioResponse, toast, voiceOutputEnabled, messages]);


  const handleVoiceInput = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          setIsLoading(true);
          const thinkingId = addMessage('ai', 'Listening...', undefined, true);
          try {
            const { transcribedText } = await understandVoiceInput({ audioDataUri });
            updateMessage(thinkingId, { text: `You said: "${transcribedText}"`, isLoading: false });
            await handleSendMessage(transcribedText, currentFile || undefined);
          } catch (e) {
            console.error('Error transcribing voice:', e);
            updateMessage(thinkingId, {text: 'Sorry, I could not understand your voice.', isLoading: false, isError: true });
            toast({ title: 'Voice Input Error', description: 'Could not transcribe audio.', variant: 'destructive' });
          } finally {
            setIsLoading(false);
          }
        };
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Recording Started', description: 'Speak now...' });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ title: 'Microphone Error', description: 'Could not access microphone.', variant: 'destructive' });
    }
  }, [isRecording, toast, handleSendMessage, currentFile, addMessage, updateMessage]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData: FileAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUri: e.target?.result as string,
        };
        setCurrentFile(fileData);
        toast({ title: 'File Ready', description: `${file.name} is ready to be sent with your next message.` });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);
  
  const triggerSend = () => {
    handleSendMessage(inputValue, currentFile || undefined);
  }

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isRecording,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    currentFile,
    setCurrentFile,
    handleSendMessage: triggerSend, // Expose the wrapper
    handleVoiceInput,
    handleFileChange,
  };
}
