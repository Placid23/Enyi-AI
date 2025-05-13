
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
import { processUserFeedback } from '@/ai/flows/process-user-feedback';


export function useChatHandler(currentLanguage: string) {
  const { 
    activeChatId, 
    addMessageToChat, 
    updateMessageInChat, 
    getActiveChat,
  } = useChat(); 

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
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
      const { audioDataUri } = await speakResponse({ text, languageCode: currentLanguage });
      audioPlayerRef.current.src = audioDataUri;
      audioPlayerRef.current.play().catch(e => console.error("Error playing audio:", e));
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({ title: 'Voice Output Error', description: 'Could not generate speech.', variant: 'destructive' });
    }
  }, [voiceOutputEnabled, toast, currentLanguage]);


  const handleSendMessageCallback = useCallback(async (query: string, attachedFile?: FileAttachment) => {
    if (!activeChatId) {
      toast({ title: 'Error', description: 'No active chat selected.', variant: 'destructive' });
      return;
    }
    if (!query.trim() && !attachedFile) return;

    setIsLoading(true);
    
    const userMessageContent: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'user',
        text: query.trim() || (attachedFile ? "File attached" : ""),
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
      const conversationHistory = currentChat ? currentChat.messages.filter(m => m.id !== aiThinkingMessageId).slice(-5) : [];
      const userQueryContext = conversationHistory.map(m => `${m.sender}: ${m.text || (m.file ? `[file: ${m.file.name}]` : "[empty message]")}`).join('\n');


      const interpretation: InterpretUserQueryOutput = await interpretUserQuery({ 
        query, 
        context: userQueryContext
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
        const { response } = await generateHumanLikeResponse({ query: interpretation.intent || query, knowledgeBase, language: currentLanguage });
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
  }, [activeChatId, addMessageToChat, updateMessageInChat, playAudioResponse, toast, voiceOutputEnabled, getActiveChat, currentLanguage]);


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
          setIsLoading(true); 
          try {
            const { transcribedText } = await understandVoiceInput({ audioDataUri, languageHint: currentLanguage });
            await handleSendMessageCallback(transcribedText, currentFile || undefined);
          } catch (e) {
            console.error('Error transcribing voice:', e);
            if(activeChatId) {
              addMessageToChat(activeChatId, {
                sender: 'ai',
                text: 'Sorry, I could not understand your voice.',
                isError: true,
                isLoading: false,
              });
            }
            toast({ title: 'Voice Input Error', description: 'Could not transcribe audio.', variant: 'destructive' });
          } finally {
            setIsLoading(false);
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
  }, [isRecording, toast, handleSendMessageCallback, currentFile, activeChatId, addMessageToChat, currentLanguage]);

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
    event.target.value = '';
  }, [toast]);
  
  const triggerSend = () => {
    handleSendMessageCallback(inputValue, currentFile || undefined);
  };

  const handleFeedback = useCallback(async (messageId: string, feedbackType: 'positive' | 'negative', correctionText?: string) => {
    if (!activeChatId) {
      toast({ title: 'Error', description: 'No active chat selected for feedback.', variant: 'destructive' });
      return;
    }

    const messageToUpdate = messages.find(m => m.id === messageId);
    if (!messageToUpdate || messageToUpdate.sender !== 'ai') {
      toast({ title: 'Error', description: 'Can only provide feedback on AI messages.', variant: 'destructive' });
      return;
    }

    // Optimistically update UI
    updateMessageInChat(activeChatId, messageId, { feedback: feedbackType, correction: correctionText });

    try {
      const chat = getActiveChat();
      const messageIndex = chat?.messages.findIndex(m => m.id === messageId);
      let userQueryContext = "No preceding user message found.";
      if (chat && messageIndex && messageIndex > 0) {
        for (let i = messageIndex -1; i >=0; i--) {
          if (chat.messages[i].sender === 'user') {
            userQueryContext = chat.messages[i].text || (chat.messages[i].file ? `File: ${chat.messages[i].file?.name}` : "User initiated action");
            break;
          }
        }
      }


      const feedbackResponse = await processUserFeedback({
        messageId,
        chatId: activeChatId,
        feedbackType,
        correctionText,
        originalAiResponse: messageToUpdate.text,
        userQueryContext,
      });
      toast({ title: 'Feedback Received', description: feedbackResponse.message });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Revert optimistic update if API call fails
      updateMessageInChat(activeChatId, messageId, { feedback: undefined, correction: undefined });
      toast({ title: 'Feedback Error', description: 'Could not submit feedback.', variant: 'destructive' });
    }
  }, [activeChatId, messages, updateMessageInChat, toast, getActiveChat]);

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
    handleSendMessage: triggerSend,
    handleVoiceInput,
    handleFileChange,
    handleFeedback, // Export the new feedback handler
  };
}

