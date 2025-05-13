'use server';

/**
 * @fileOverview A flow that analyzes complex information to provide better results.
 *
 * - analyzeInformation - A function that handles the information analysis process.
 * - AnalyzeInformationInput - The input type for the analyzeInformation function.
 * - AnalyzeInformationOutput - The return type for the analyzeInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInformationInputSchema = z.object({
  information: z
    .string()
    .describe('The complex information to be analyzed.'),
  query: z.string().describe('The specific question or topic to focus the analysis on.'),
});
export type AnalyzeInformationInput = z.infer<typeof AnalyzeInformationInputSchema>;

const AnalyzeInformationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the analyzed information, focused on the query.'),
  keyInsights: z.string().describe('Key insights derived from the analysis.'),
  confidenceLevel: z
    .number()
    .describe('A number between 0 and 1 indicating the confidence level in the analysis.'),
});
export type AnalyzeInformationOutput = z.infer<typeof AnalyzeInformationOutputSchema>;

export async function analyzeInformation(input: AnalyzeInformationInput): Promise<AnalyzeInformationOutput> {
  return analyzeInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInformationPrompt',
  input: {schema: AnalyzeInformationInputSchema},
  output: {schema: AnalyzeInformationOutputSchema},
  prompt: `You are an expert information analyst. Your task is to analyze complex information and provide a concise summary, key insights, and a confidence level for your analysis.

  Information: {{{information}}}

  Query: {{{query}}}

  Summary:
  Key Insights:
  Confidence Level (0-1):`,
});

const analyzeInformationFlow = ai.defineFlow(
  {
    name: 'analyzeInformationFlow',
    inputSchema: AnalyzeInformationInputSchema,
    outputSchema: AnalyzeInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
