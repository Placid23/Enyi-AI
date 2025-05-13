'use server';

/**
 * @fileOverview Implements the text-to-speech functionality using Genkit and the Google Cloud Text-to-Speech API.
 *
 * - speakResponse - A function that converts text to speech and returns the audio data as a data URI.
 * - SpeakResponseInput - The input type for the speakResponse function.
 * - SpeakResponseOutput - The return type for the speakResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpeakResponseInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type SpeakResponseInput = z.infer<typeof SpeakResponseInputSchema>;

const SpeakResponseOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type SpeakResponseOutput = z.infer<typeof SpeakResponseOutputSchema>;

export async function speakResponse(input: SpeakResponseInput): Promise<SpeakResponseOutput> {
  return speakResponseFlow(input);
}

const speakResponseFlow = ai.defineFlow(
  {
    name: 'speakResponseFlow',
    inputSchema: SpeakResponseInputSchema,
    outputSchema: SpeakResponseOutputSchema,
  },
  async input => {
    const {text} = input;

    // Use Genkit's generate functionality to call the Google Cloud Text-to-Speech API.
    //This model is used because it can generate audio as well as text. Must provide TEXT and IMAGE. 
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: text,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Return the audio data URI.
    return {audioDataUri: media.url!};
  }
);

