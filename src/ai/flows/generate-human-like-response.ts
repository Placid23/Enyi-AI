'use server';

/**
 * @fileOverview A flow to generate human-like responses based on interpreted queries and a knowledge base.
 *
 * - generateHumanLikeResponse - A function that generates human-like responses.
 * - GenerateHumanLikeResponseInput - The input type for the generateHumanLikeResponse function.
 * - GenerateHumanLikeResponseOutput - The return type for the generateHumanLikeResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHumanLikeResponseInputSchema = z.object({
  query: z.string().describe('The interpreted user query.'),
  knowledgeBase: z.string().optional().describe('The knowledge base to use for generating the response.'),
});
export type GenerateHumanLikeResponseInput = z.infer<typeof GenerateHumanLikeResponseInputSchema>;

const GenerateHumanLikeResponseOutputSchema = z.object({
  response: z.string().describe('The generated human-like response.'),
});
export type GenerateHumanLikeResponseOutput = z.infer<typeof GenerateHumanLikeResponseOutputSchema>;

export async function generateHumanLikeResponse(input: GenerateHumanLikeResponseInput): Promise<GenerateHumanLikeResponseOutput> {
  return generateHumanLikeResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHumanLikeResponsePrompt',
  input: {schema: GenerateHumanLikeResponseInputSchema},
  output: {schema: GenerateHumanLikeResponseOutputSchema},
  prompt: `You are an AI assistant designed to provide human-like responses to user queries.

  Query: {{{query}}}

  {{#if knowledgeBase}}
  Knowledge Base: {{{knowledgeBase}}}
  {{\/if}}

  Generate a response that is natural, helpful, and relevant to the query.
  `,
});

const generateHumanLikeResponseFlow = ai.defineFlow(
  {
    name: 'generateHumanLikeResponseFlow',
    inputSchema: GenerateHumanLikeResponseInputSchema,
    outputSchema: GenerateHumanLikeResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
