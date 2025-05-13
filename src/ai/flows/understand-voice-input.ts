'use server';
/**
 * @fileOverview Flow to understand voice input and convert it to text.
 *
 * - understandVoiceInput - A function that takes audio data and returns the transcribed text.
 * - UnderstandVoiceInputInput - The input type for the understandVoiceInput function.
 * - UnderstandVoiceInputOutput - The return type for the understandVoiceInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UnderstandVoiceInputInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type UnderstandVoiceInputInput = z.infer<typeof UnderstandVoiceInputInputSchema>;

const UnderstandVoiceInputOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio data.'),
});
export type UnderstandVoiceInputOutput = z.infer<typeof UnderstandVoiceInputOutputSchema>;

export async function understandVoiceInput(input: UnderstandVoiceInputInput): Promise<UnderstandVoiceInputOutput> {
  return understandVoiceInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'understandVoiceInputPrompt',
  input: {schema: UnderstandVoiceInputInputSchema},
  output: {schema: UnderstandVoiceInputOutputSchema},
  prompt: `Transcribe the following audio data to text:

Audio: {{media url=audioDataUri}}`,
});

const understandVoiceInputFlow = ai.defineFlow(
  {
    name: 'understandVoiceInputFlow',
    inputSchema: UnderstandVoiceInputInputSchema,
    outputSchema: UnderstandVoiceInputOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
