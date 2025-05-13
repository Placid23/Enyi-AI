
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
import { generateImage } from '@/ai/flows/generate-image-flow';


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
    if (!voiceOutputEnabled || !audioPlayerRef.current || !text.trim()) return;
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
      const conversationHistory = currentChat ? currentChat.messages.filter(m => m.id !== aiThinkingMessageId).slice(-10) : []; // Increased history for better context
      const userQueryContext = conversationHistory.map(m => `${m.sender}: ${m.text || (m.file ? `[file: ${m.file.name}]` : "[empty message]")}`).join('\n');

      const interpretation: InterpretUserQueryOutput = await interpretUserQuery({ 
        query, 
        context: userQueryContext
      });
      
      updateMessageInChat(activeChatId, aiThinkingMessageId, { intent: interpretation.intent, requiresContext: interpretation.requiresContext });
      
      let aiResponseText = '';
      let analysisResult: Message['analyzedInfo'] | undefined = undefined;
      let aiResponseFile: FileAttachment | undefined = undefined;

      const lowerCaseIntent = interpretation.intent.toLowerCase();
      const imageKeywords = ["generate image", "create image", "draw picture", "make picture", "generate a photo", "create a photo"];
      const isImageRequest = imageKeywords.some(keyword => lowerCaseIntent.includes(keyword));
      
      if (isImageRequest && !attachedFile) {
        let imagePrompt = query;
        const promptExtractionKeywords = ["generate image of", "create an image of", "draw a picture of", "make a picture of", "generate a photo of", "create a photo of", ...imageKeywords];
        for (const keyword of promptExtractionKeywords) {
            if (query.toLowerCase().startsWith(keyword)) {
                imagePrompt = query.substring(keyword.length).trim();
                break;
            }
        }
         // If initial stripping didn't work well, try with intent
        if (imagePrompt === query && interpretation.intent) {
            for (const keyword of promptExtractionKeywords) {
                if (interpretation.intent.toLowerCase().startsWith(keyword)) {
                    imagePrompt = interpretation.intent.substring(keyword.length).trim();
                    break;
                }
            }
        }
        if (!imagePrompt || imagePrompt === query) imagePrompt = "A vibrant and interesting image"; // Default prompt

        const { imageDataUri, revisedPrompt } = await generateImage({ prompt: imagePrompt });
        
        const imageName = imagePrompt.substring(0, 20).replace(/\s/g, '_').replace(/[^\w-]/g, '') + `_${Date.now()}.png`;
        aiResponseFile = {
            name: imageName,
            type: 'image/png', // Can be parsed from data URI if more accuracy needed
            size: imageDataUri.length, 
            dataUri: imageDataUri,
        };
        aiResponseText = revisedPrompt || `Here's the image you requested for: "${imagePrompt}"`;
        updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false, file: aiResponseFile });
      
      } else if (attachedFile) {
        const { answer } = await importAndProcessFile({ fileDataUri: attachedFile.dataUri, query: interpretation.intent || query });
        aiResponseText = answer;
        
        if (interpretation.intent.toLowerCase().includes("analyze") || interpretation.intent.toLowerCase().includes("summary") || interpretation.intent.toLowerCase().includes("extract")) {
             const { summary, keyInsights, confidenceLevel } = await analyzeInformationFlow({ information: answer, query: interpretation.intent });
             analysisResult = { summary, keyInsights, confidenceLevel };
        }
        updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false, analyzedInfo: analysisResult });

      } else if (interpretation.intent.toLowerCase().includes("research") || interpretation.intent.toLowerCase().includes("analyze")) {
        const { summary, keyInsights, confidenceLevel } = await analyzeInformationFlow({ information: query, query: interpretation.intent });
        aiResponseText = `${summary}\n\nKey Insights: ${keyInsights}`;
        analysisResult = { summary, keyInsights, confidenceLevel };
        updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false, analyzedInfo: analysisResult });
      } else {
        const knowledgeBase = conversationHistory.filter(m => m.sender === 'ai' && m.text).slice(-3).map(m => m.text).join('\n');
        const { response } = await generateHumanLikeResponse({ query: interpretation.intent || query, knowledgeBase, language: currentLanguage });
        aiResponseText = response;
        updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false });
      }
      
      if (voiceOutputEnabled && aiResponseText) {
        await playAudioResponse(aiResponseText);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
      updateMessageInChat(activeChatId, aiThinkingMessageId, { text: `Sorry, I encountered an error: ${errorMessage}`, isLoading: false, isError: true });
      toast({ title: 'Error', description: `Could not process your request: ${errorMessage}`, variant: 'destructive' });
       if (voiceOutputEnabled) {
        await playAudioResponse(`Sorry, I encountered an error: ${errorMessage}`);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Common type, adjust if needed
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          setIsLoading(true); 
          try {
            // Use languageHint for better transcription accuracy
            const { transcribedText } = await understandVoiceInput({ audioDataUri, languageHint: currentLanguage });
            await handleSendMessageCallback(transcribedText, currentFile || undefined);
          } catch (e) {
            console.error('Error transcribing voice:', e);
            if(activeChatId) { // Check activeChatId again before adding message
              addMessageToChat(activeChatId, {
                sender: 'ai',
                text: 'Sorry, I could not understand your voice.',
                isError: true,
                isLoading: false, // Ensure isLoading is set to false on error
              });
            }
            toast({ title: 'Voice Input Error', description: 'Could not transcribe audio.', variant: 'destructive' });
          } finally {
            setIsLoading(false);
          }
        };
        stream.getTracks().forEach(track => track.stop()); // Stop media stream tracks
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Recording Started', description: 'Speak now...' });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ title: 'Microphone Error', description: 'Could not access microphone. Please check permissions.', variant: 'destructive' });
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
    // Reset file input to allow selecting the same file again
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

    const currentChat = getActiveChat();
    if (!currentChat) {
        toast({ title: 'Error', description: 'Chat not found.', variant: 'destructive'});
        return;
    }

    const messageToUpdate = currentChat.messages.find(m => m.id === messageId);
    if (!messageToUpdate || messageToUpdate.sender !== 'ai') {
      toast({ title: 'Error', description: 'Can only provide feedback on AI messages.', variant: 'destructive' });
      return;
    }

    updateMessageInChat(activeChatId, messageId, { feedback: feedbackType, correction: correctionText });

    try {
      const messageIndex = currentChat.messages.findIndex(m => m.id === messageId);
      let userQueryContext = "No preceding user message found.";
      if (messageIndex > 0) {
        // Find the last user message before this AI message
        for (let i = messageIndex -1; i >=0; i--) {
          if (currentChat.messages[i].sender === 'user') {
            userQueryContext = currentChat.messages[i].text || (currentChat.messages[i].file ? `File: ${currentChat.messages[i].file?.name}` : "User initiated action");
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
      updateMessageInChat(activeChatId, messageId, { feedback: messageToUpdate.feedback, correction: messageToUpdate.correction }); // Revert to original if error
      toast({ title: 'Feedback Error', description: 'Could not submit feedback.', variant: 'destructive' });
    }
  }, [activeChatId, updateMessageInChat, toast, getActiveChat]);

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
    handleFeedback,
  };
}

