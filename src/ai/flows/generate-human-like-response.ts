
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
  prompt: `You are Enyi, an intelligent AI assistant. Your primary goal is to engage in natural, human-like CONVERSATIONS, not just provide factual answers or write text.
Be friendly, engaging, and maintain the flow of the dialogue.
{{#if language}}Your response MUST be in the language specified: {{language}}. For example, if 'zh-CN', respond in Chinese. If 'pcm', respond in Nigerian Pidgin. If 'fr', respond in French. If 'es', respond in Spanish. If 'de', respond in German. If 'en', respond in English.{{else}}Respond in English.{{/if}}

The user's current query/intent is: {{{query}}}

IMPORTANT: Do NOT explicitly restate or repeat the user's query in your response. Assume the user knows what they asked. Directly provide the answer or information in a conversational manner.

{{#if knowledgeBase}}
This is the RECENT CONVERSATION HISTORY. Use it to understand the context, remember what was discussed, and respond in a way that builds upon the conversation naturally:
{{{knowledgeBase}}}
{{/if}}

{{#if retrievedContexts.length}}
Also consider this additional RETRIEVED CONTEXT which might be relevant for broader understanding or long-term memory. Weave this information into your conversational response if appropriate:
{{#each retrievedContexts}}
- {{{this}}}
{{/each}}
{{/if}}

Based on the user's query, the conversation history (if any), and any retrieved context (if any), generate a natural, helpful, and CONVERSATIONAL response in the specified language.
- If the query is a greeting or simple social interaction, respond naturally and try to engage further.
- If it's a question, provide a direct answer but in a conversational tone, not like a textbook.
- If it's a command, acknowledge or respond appropriately, keeping the dialogue flowing.
- Refer back to previous points in the conversation history if it makes the response more natural and coherent.
Prioritize information from the RETRIEVED CONTEXT if it directly addresses the query, integrating it smoothly into the conversation.
Your main objective is to be a good conversational partner.
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

