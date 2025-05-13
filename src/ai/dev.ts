import { config } from 'dotenv';
config();

import '@/ai/flows/import-and-process-file.ts';
import '@/ai/flows/speak-response.ts';
import '@/ai/flows/generate-human-like-response.ts';
import '@/ai/flows/understand-voice-input.ts';
import '@/ai/flows/interpret-user-query.ts';
import '@/ai/flows/analyze-information.ts';
import '@/ai/flows/analyze-facial-sentiment.ts'; // Added new flow
