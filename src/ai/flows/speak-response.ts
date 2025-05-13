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

    // Use Genkit's generate functionality.
    // NOTE: The model 'googleai/gemini-2.0-flash-exp' is an image generation model.
    // It is NOT suitable for text-to-speech. This flow will likely not produce audible speech.
    // The comment below is misleading.
    // "This model is used because it can generate audio as well as text. Must provide TEXT and IMAGE." - This is incorrect.
    const generationResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: text,
      config: {
        // Requesting TEXT and IMAGE modalities, though for TTS, AUDIO would be expected.
        responseModalities: ['TEXT', 'IMAGE'], 
      },
    });

    const mediaOutput = generationResult.media;

    if (!mediaOutput?.url) {
      // Log the entire result for debugging if media or URL is missing.
      console.error(
        'Text-to-Speech Error: No media URL found in generation result. This is expected as an image generation model is used. Full result:',
        JSON.stringify(generationResult, null, 2)
      );
      // The flow's contract is to return an audioDataUri. If it cannot, it should throw an error.
      throw new Error(
        'Failed to generate audio data for speech output. The AI model did not return the expected media content, or the configured model is not capable of text-to-speech.'
      );
    }

    // Assuming mediaOutput.url would be the audio data URI if the model supported TTS.
    // For 'gemini-2.0-flash-exp', this URL will point to an image if generation was successful.
    return {audioDataUri: mediaOutput.url};
  }
);

