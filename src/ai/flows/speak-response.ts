
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
  languageCode: z.string().optional().describe('BCP-47 language code for the speech, e.g., "en-US", "cmn-CN", "pcm", "fr-FR", "es-ES", "de-DE". Helps ensure correct pronunciation and voice if the model supports it.'),
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
    const {text: textToSpeak, languageCode} = input; 

    // This flow now uses googleai/gemini-2.0-flash-exp model.
    // The error "Model does not support the requested response modalities: text,audio"
    // indicates that requesting both 'TEXT' and 'AUDIO' is not supported for this model.
    // We will request only 'AUDIO' as the primary goal is text-to-speech.
    // The 'languageCode' parameter is included in the schema for completeness and potential future use
    // with models or configurations that explicitly use it.
    const generationResult = await ai.generate({ 
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: textToSpeak, 
      config: {
        responseModalities: ['AUDIO'], // Requesting ONLY audio
        // Potentially, if the model supports it, language/voice config would go here:
        // ...(languageCode && { ttsOptions: { languageCode: languageCode } }) // This is hypothetical
      },
    });

    const media = generationResult.media;
    // If only 'AUDIO' is requested, 'generationResult.text' is not expected to be populated.

    const audioOutputUrl = media?.url;

    if (!audioOutputUrl) {
      console.error(
        `Text-to-Speech Error: No audio URL found in generation result. Input text was: "${textToSpeak}". Language code hint: "${languageCode}". Full result:`,
        JSON.stringify(generationResult, null, 2) // Log the full generationResult
      );
      // The flow's contract is to return an audioDataUri. If it cannot, it should throw an error.
      throw new Error(
        'Failed to generate audio data for speech output. The AI model did not return the expected media content, or the configured model is not capable of text-to-speech.'
      );
    }
    
    // Return the audio data URI.
    return {audioDataUri: audioOutputUrl};
  }
);

