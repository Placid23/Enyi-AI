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
  knowledgeBase: z.string().optional().describe('The recent conversation history to use as immediate context.'),
  retrievedContexts: z.array(z.string()).optional().describe('Broader context retrieved from a knowledge source (e.g., vector database) based on the query.'),
  language: z.string().optional().describe('The target language for the response (e.g., "en", "zh-CN", "pcm", "fr", "es", "de"). Default is English.'),
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
  prompt: `You are AetherAssist, an intelligent AI assistant. Your goal is to provide helpful, human-like responses.
{{#if language}}Your response MUST be in the language specified: {{language}}. For example, if 'zh-CN', respond in Chinese. If 'pcm', respond in Nigerian Pidgin. If 'fr', respond in French. If 'es', respond in Spanish. If 'de', respond in German. If 'en', respond in English.{{else}}Respond in English.{{/if}}

The user's current query/intent is: {{{query}}}

IMPORTANT: Do NOT explicitly restate or repeat the user's query in your response. Assume the user knows what they asked. Directly provide the answer or information.

{{#if knowledgeBase}}
Consider this RECENT CONVERSATION HISTORY for immediate context:
{{{knowledgeBase}}}
{{/if}}

{{#if retrievedContexts.length}}
Also consider this additional RETRIEVED CONTEXT which might be relevant for broader understanding or long-term memory:
{{#each retrievedContexts}}
- {{{this}}}
{{/each}}
{{/if}}

Based on the user's query, the conversation history (if any), and any retrieved context (if any), generate a natural, helpful, and relevant response in the specified language.
If the query is a greeting or simple social interaction, respond naturally. If it's a question, provide a direct answer. If it's a command, acknowledge or respond appropriately.
Prioritize information from the RETRIEVED CONTEXT if it directly addresses the query. Use RECENT CONVERSATION HISTORY to understand the flow of dialogue.
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
