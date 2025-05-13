
import { config } from 'dotenv';
config();

import '@/ai/flows/import-and-process-file.ts';
import '@/ai/flows/speak-response.ts';
import '@/ai/flows/generate-human-like-response.ts';
import '@/ai/flows/understand-voice-input.ts';
import '@/ai/flows/interpret-user-query.ts';
import '@/ai/flows/analyze-information.ts';
import '@/ai/flows/analyze-facial-sentiment.ts'; 
import '@/ai/flows/process-user-feedback.ts'; 
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/retrieve-context-with-embeddings.ts'; // Added new flow for context retrieval

