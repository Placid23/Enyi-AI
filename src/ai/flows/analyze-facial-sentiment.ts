'use server';
/**
 * @fileOverview An AI agent that analyzes facial sentiment from an image.
 *
 * - analyzeFacialSentiment - A function that handles the facial sentiment analysis.
 * - AnalyzeFacialSentimentInput - The input type for the analyzeFacialSentiment function.
 * - AnalyzeFacialSentimentOutput - The return type for the analyzeFacialSentiment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeFacialSentimentInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFacialSentimentInput = z.infer<typeof AnalyzeFacialSentimentInputSchema>;

const AnalyzeFacialSentimentOutputSchema = z.object({
  sentiment: z.string().describe('The primary sentiment detected in the facial expression (e.g., happy, sad, neutral, surprised, angry, disgusted, fearful).'),
  confidence: z.number().min(0).max(1).describe('The confidence score for the detected sentiment, between 0 and 1.'),
});
export type AnalyzeFacialSentimentOutput = z.infer<typeof AnalyzeFacialSentimentOutputSchema>;

export async function analyzeFacialSentiment(input: AnalyzeFacialSentimentInput): Promise<AnalyzeFacialSentimentOutput> {
  return analyzeFacialSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFacialSentimentPrompt',
  input: { schema: AnalyzeFacialSentimentInputSchema },
  output: { schema: AnalyzeFacialSentimentOutputSchema },
  prompt: `You are an expert in analyzing facial expressions.
Analyze the facial expression in the provided image and determine the primary sentiment.
Possible sentiments are: happy, sad, neutral, surprised, angry, disgusted, fearful.
Provide the detected sentiment and your confidence level (a number between 0 and 1).

Image: {{media url=imageDataUri}}`,
});

const analyzeFacialSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeFacialSentimentFlow',
    inputSchema: AnalyzeFacialSentimentInputSchema,
    outputSchema: AnalyzeFacialSentimentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get sentiment analysis from AI model.');
    }
    return output;
  }
);
