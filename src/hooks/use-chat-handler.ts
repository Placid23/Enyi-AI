
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, FileAttachment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/context/chat-context'; 

import { interpretUserQuery } from '@/ai/flows/interpret-user-query';
import type { InterpretUserQueryOutput } from '@/ai/flows/interpret-user-query';
import { generateHumanLikeResponse } from '@/ai/flows/generate-human-like-response';
import { understandVoiceInput } from '@/ai/flows/understand-voice-input';
import { speakResponse } from '@/ai/flows/speak-response';
import { importAndProcessFile } from '@/ai/flows/import-and-process-file';
import { analyzeInformation as analyzeInformationFlow } from '@/ai/flows/analyze-information';


export function useChatHandler() {
  const { 
    activeChatId, 
    addMessageToChat, 
    updateMessageInChat, 
    getActiveChat,
  } = useChat(); 

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Local loading state for input processing
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileAttachment | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  const messages = getActiveChat()?.messages || [];

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
    if (!activeChatId) {
      toast({ title: 'Error', description: 'No active chat selected.', variant: 'destructive' });
      return;
    }
    if (!query.trim() && !attachedFile) return;

    setIsLoading(true);
    
    const userMessageContent: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'user',
        text: query.trim() || (attachedFile ? "File attached" : ""), // Display "File attached" if query is empty but file exists
        file: attachedFile,
    };
    addMessageToChat(activeChatId, userMessageContent);
    
    setInputValue('');
    setCurrentFile(null);

    const aiThinkingMessageContent: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'ai',
        isLoading: true,
    };
    const aiThinkingMessageId = addMessageToChat(activeChatId, aiThinkingMessageContent);

    try {
      const currentChat = getActiveChat();
      // Get messages before the AI thinking message was added
      const conversationHistory = currentChat ? currentChat.messages.filter(m => m.id !== aiThinkingMessageId).slice(-5) : [];


      const interpretation: InterpretUserQueryOutput = await interpretUserQuery({ 
        query, 
        context: conversationHistory.map(m => `${m.sender}: ${m.text || "file"}`).join('\n') 
      });
      
      updateMessageInChat(activeChatId, aiThinkingMessageId, { intent: interpretation.intent, requiresContext: interpretation.requiresContext });
      
      let aiResponseText = '';
      let analysisResult: Message['analyzedInfo'] | undefined = undefined;

      if (attachedFile) {
        const { answer } = await importAndProcessFile({ fileDataUri: attachedFile.dataUri, query: interpretation.intent || query });
        aiResponseText = answer;
        
        if (interpretation.intent.toLowerCase().includes("analyze") || interpretation.intent.toLowerCase().includes("summary")) {
             const { summary, keyInsights, confidenceLevel } = await analyzeInformationFlow({ information: answer, query: interpretation.intent });
             analysisResult = { summary, keyInsights, confidenceLevel };
        }

      } else if (interpretation.intent.toLowerCase().includes("research") || interpretation.intent.toLowerCase().includes("analyze")) {
        const { summary, keyInsights, confidenceLevel } = await analyzeInformationFlow({ information: query, query: interpretation.intent });
        aiResponseText = `${summary}\n\nKey Insights: ${keyInsights}`;
        analysisResult = { summary, keyInsights, confidenceLevel };
      } else {
        const knowledgeBase = conversationHistory.filter(m => m.sender === 'ai' && m.text).slice(-3).map(m => m.text).join('\n');
        const { response } = await generateHumanLikeResponse({ query: interpretation.intent, knowledgeBase });
        aiResponseText = response;
      }
      
      updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false, analyzedInfo: analysisResult });
      if (voiceOutputEnabled) {
        await playAudioResponse(aiResponseText);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      updateMessageInChat(activeChatId, aiThinkingMessageId, { text: "Sorry, I encountered an error.", isLoading: false, isError: true });
      toast({ title: 'Error', description: 'Could not process your request.', variant: 'destructive' });
       if (voiceOutputEnabled) {
        await playAudioResponse("Sorry, I encountered an error.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, addMessageToChat, updateMessageInChat, playAudioResponse, toast, voiceOutputEnabled, getActiveChat]);


  const handleVoiceInput = useCallback(async () => {
    if (!activeChatId) {
        toast({ title: 'Error', description: 'No active chat selected for voice input.', variant: 'destructive' });
        return;
    }

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
          setIsLoading(true); // Local loading state for voice processing
          const thinkingId = addMessageToChat(activeChatId, {sender: 'ai', text: 'Listening...', isLoading: true});
          try {
            const { transcribedText } = await understandVoiceInput({ audioDataUri });
            updateMessageInChat(activeChatId, thinkingId, { text: `You said: "${transcribedText}"`, isLoading: false });
            // Now, send this transcribed text as a new message.
            await handleSendMessage(transcribedText, currentFile || undefined);
          } catch (e) {
            console.error('Error transcribing voice:', e);
            updateMessageInChat(activeChatId, thinkingId, {text: 'Sorry, I could not understand your voice.', isLoading: false, isError: true });
            toast({ title: 'Voice Input Error', description: 'Could not transcribe audio.', variant: 'destructive' });
          } finally {
            setIsLoading(false); // End local loading state for voice processing
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Recording Started', description: 'Speak now...' });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ title: 'Microphone Error', description: 'Could not access microphone.', variant: 'destructive' });
    }
  }, [isRecording, toast, handleSendMessage, currentFile, activeChatId, addMessageToChat, updateMessageInChat]);

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
    // Clear the input value to allow re-selecting the same file if needed
    event.target.value = '';
  }, [toast]);
  
  const triggerSend = () => {
    handleSendMessage(inputValue, currentFile || undefined);
  }

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading, // This is the local isLoading for send/voice operation
    isRecording,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    currentFile,
    setCurrentFile,
    handleSendMessage: triggerSend,
    handleVoiceInput,
    handleFileChange,
  };
}
