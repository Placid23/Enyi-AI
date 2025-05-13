
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
  prompt: `You are an expert information analyst and critical thinker. Your task is to meticulously analyze complex information, break it down, and extract deep, non-obvious insights.
Focus on providing a nuanced understanding of the information, not just a surface-level summary.

  Information: {{{information}}}

  Query: {{{query}}}

  Provide the following:
  Summary: A concise, yet comprehensive summary of the analyzed information, specifically addressing the nuances related to the query.
  Key Insights: Articulate several key insights derived from the analysis. These should go beyond the obvious and highlight significant patterns, implications, or connections within the data relevant to the query.
  Confidence Level (0-1): Your confidence in the accuracy and completeness of your analysis based on the provided information. Be honest about any ambiguities or limitations.`,
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

