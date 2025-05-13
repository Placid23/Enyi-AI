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

    // The 'languageCode' parameter is included in the schema for completeness and potential future use
    // with models or configurations that explicitly use it.
    // The current error "Model does not support the requested response modalities: audio,text"
    // for 'googleai/gemini-2.0-flash' suggests changing the modalities.
    // We will request only 'AUDIO'.
    const generationResult = await ai.generate({ 
      model: 'googleai/gemini-2.0-flash', 
      prompt: textToSpeak, 
      config: {
        responseModalities: ['AUDIO'], // Changed from ['AUDIO', 'TEXT']
        // If the specific model/plugin supported an explicit language parameter for audio generation,
        // it would be configured here, potentially using `languageCode`.
        // e.g., ...(languageCode && { ttsLanguage: languageCode })
      },
    });

    const media = generationResult.media;
    // responseText will likely be undefined if 'TEXT' is not in responseModalities.
    const responseText = generationResult.text; 

    const audioOutputUrl = media?.url;

    if (!audioOutputUrl) {
      console.error(
        `Text-to-Speech Error: No audio URL found in generation result. Input text was: "${textToSpeak}". Language code hint: "${languageCode}". Full result:`,
        JSON.stringify({media, responseText}, null, 2)
      );
      // The flow's contract is to return an audioDataUri. If it cannot, it should throw an error.
      throw new Error(
        'Failed to generate audio data for speech output. The AI model did not return the expected media content, or the configured model is not capable of text-to-speech.'
      );
    }
    
    return {audioDataUri: audioOutputUrl};
  }
);

