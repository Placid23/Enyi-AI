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
import { retrieveContextWithEmbeddings } from '@/ai/flows/retrieve-context-with-embeddings';


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
      // Use gemini-2.0-flash-exp for speech generation as per previous fixes
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
      const conversationHistory = currentChat ? currentChat.messages.filter(m => m.id !== aiThinkingMessageId).slice(-10) : []; 
      const userQueryContext = conversationHistory.map(m => `${m.sender}: ${m.text || (m.file ? `[file: ${m.file.name}]` : "[empty message]")}`).join('\n');

      const interpretation: InterpretUserQueryOutput = await interpretUserQuery({ 
        query, 
        context: userQueryContext
      });
      
      updateMessageInChat(activeChatId, aiThinkingMessageId, { intent: interpretation.intent, requiresContext: interpretation.requiresContext });
      
      let aiResponseText = '';
      let analysisResult: Message['analyzedInfo'] | undefined = undefined;
      let aiResponseFile: FileAttachment | undefined = undefined;

      // Retrieve broader context using embeddings (simulated)
      const { relevantContexts } = await retrieveContextWithEmbeddings({ queryText: interpretation.intent || query });

      const lowerCaseQuery = query.toLowerCase();
      const interpretedIntentLower = interpretation.intent?.toLowerCase() || "";
      let isImageRequest = false;
      let imagePrompt = "";

      const specificImageKeywords = [
          "generate image of", "create image of", "draw picture of", "make picture of", 
          "generate photo of", "create photo of", "show me an image of", "imagine a picture of",
          "generate an image of", "create an image of"
      ];
      const generalImageKeywords = [
          "generate image", "create image", "draw picture", "make picture", 
          "generate photo", "create photo", "image of", "picture of", "photo of"
      ];
      
      const combinedQueryAndIntent = `${query} ${interpretation.intent || ''}`.toLowerCase();

      for (const keyword of specificImageKeywords) {
          const keywordIndex = combinedQueryAndIntent.indexOf(keyword);
          if (keywordIndex !== -1) {
              isImageRequest = true;
              // Prioritize extracting prompt from original query first, then from intent
              const queryKeywordIndex = lowerCaseQuery.indexOf(keyword);
              if (queryKeywordIndex !== -1) {
                  imagePrompt = query.substring(queryKeywordIndex + keyword.length).trim();
              } else {
                  const intentKeywordIndex = interpretedIntentLower.indexOf(keyword);
                  imagePrompt = interpretation.intent!.substring(intentKeywordIndex + keyword.length).trim();
              }
              break;
          }
      }

      if (!isImageRequest) {
          for (const keyword of generalImageKeywords) {
               if (combinedQueryAndIntent.includes(keyword)) {
                  isImageRequest = true;
                  imagePrompt = query.toLowerCase().replace(keyword, "").trim();
                   if (!imagePrompt || imagePrompt.length < 3) {
                       imagePrompt = (interpretation.intent || "").toLowerCase().replace(keyword, "").trim();
                   }
                  // Remove common leading/trailing punctuation that might result from simple replace
                  imagePrompt = imagePrompt.replace(/^["“'(,.)]+|["”'),.]+$|[,.]$/g, '').trim();
                  break;
              }
          }
      }
      
      if (isImageRequest && (!imagePrompt || imagePrompt.length < 3)) { 
          // If image request detected but prompt is weak, try to use the whole intent (minus keywords)
          let tempIntentPrompt = interpretation.intent || "";
          for (const keyword of [...specificImageKeywords, ...generalImageKeywords]) {
              const keywordIndex = tempIntentPrompt.toLowerCase().indexOf(keyword);
              if (keywordIndex !== -1) {
                  // Try to take text after the keyword
                  let extracted = tempIntentPrompt.substring(keywordIndex + keyword.length).trim();
                  if (extracted.length >=3) {
                     tempIntentPrompt = extracted;
                     break;
                  }
                  // Or before the keyword if nothing after
                   extracted = tempIntentPrompt.substring(0, keywordIndex).trim();
                   if (extracted.length >=3) {
                     tempIntentPrompt = extracted;
                     break;
                   }
                  
              }
          }
          if (tempIntentPrompt.length >= 3 && tempIntentPrompt !== interpretation.intent) { // Check if it changed
            imagePrompt = tempIntentPrompt.replace(/^["“'(,.)]+|["”'),.]+$|[,.]$/g, '').trim();
          } else if (interpretation.intent && interpretation.intent.length >=3) {
             imagePrompt = interpretation.intent.replace(/^["“'(,.)]+|["”'),.]+$|[,.]$/g, '').trim();
          }
      }
      
      if (isImageRequest && (!imagePrompt || imagePrompt.length < 3)) {
          imagePrompt = "A vibrant and interesting abstract design"; // Fallback default prompt
      }
      
      console.log("Image generation debug info:", { 
        originalQuery: query, 
        isImageRequest, 
        extractedImagePrompt: imagePrompt, 
        interpretedIntent: interpretation.intent 
      });

      if (isImageRequest && !attachedFile) {
        console.log(`Attempting to generate image with prompt: "${imagePrompt}"`);
        try {
            const { imageDataUri, revisedPrompt } = await generateImage({ prompt: imagePrompt });
            
            const imageName = imagePrompt.substring(0, 30).replace(/[^a-zA-Z0-9_]/g, '_').replace(/_{2,}/g, '_') + `_${Date.now()}.png`;
            aiResponseFile = {
                name: imageName,
                type: 'image/png',
                size: imageDataUri.length, 
                dataUri: imageDataUri,
            };
            aiResponseText = revisedPrompt || `I've generated an image for "${imagePrompt}":`;
            updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false, file: aiResponseFile });
        
        } catch (imgError: any) {
            console.error('Image generation failed in useChatHandler:', imgError);
            aiResponseText = `I tried to generate an image for "${imagePrompt}", but something went wrong. Error: ${imgError.message || 'Unknown image generation error'}`;
            updateMessageInChat(activeChatId, aiThinkingMessageId, { text: aiResponseText, isLoading: false, isError: true });
        }
      
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
        const { response } = await generateHumanLikeResponse({ 
            query: interpretation.intent || query, 
            knowledgeBase, 
            retrievedContexts, 
            language: currentLanguage 
        });
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
      updateMessageInChat(activeChatId, messageId, { feedback: messageToUpdate.feedback, correction: messageToUpdate.correction }); 
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
