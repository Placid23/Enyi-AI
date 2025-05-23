// This is an autogenerated file from Firebase Studio.

'use server';

/**
 * @fileOverview An AI agent that interprets user queries to understand the intent and context.
 *
 * - interpretUserQuery - A function that handles the user query interpretation process.
 * - InterpretUserQueryInput - The input type for the interpretUserQuery function.
 * - InterpretUserQueryOutput - The return type for the interpretUserQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretUserQueryInputSchema = z.object({
  query: z.string().describe('The user query to interpret.'),
  context: z.string().optional().describe('Optional context for the query.'),
});
export type InterpretUserQueryInput = z.infer<typeof InterpretUserQueryInputSchema>;

const InterpretUserQueryOutputSchema = z.object({
  intent: z.string().describe('The intent of the user query.'),
  relevantContext: z.string().optional().describe('The relevant context for the query, if any.'),
  requiresContext: z.boolean().describe('Whether the query requires additional context.'),
});
export type InterpretUserQueryOutput = z.infer<typeof InterpretUserQueryOutputSchema>;

export async function interpretUserQuery(input: InterpretUserQueryInput): Promise<InterpretUserQueryOutput> {
  return interpretUserQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretUserQueryPrompt',
  input: {schema: InterpretUserQueryInputSchema},
  output: {schema: InterpretUserQueryOutputSchema},
  prompt: `You are a highly proficient AI assistant specializing in deep query analysis. Your task is to meticulously interpret user queries to understand their core intent, underlying assumptions, and contextual nuances.

  Your job is to:
  1. Determine the primary intent of the query. Be specific (e.g., "seeking factual information about X," "requesting a creative story about Y," "asking for a step-by-step explanation of Z," "expressing an opinion on A").
  2. Identify if the query implies a need for additional, broader context beyond the immediate conversation (e.g., historical facts, scientific data, definitions).
  3. If broader context is needed, specify what kind of information would be most relevant to fully address the query.

  Query: {{{query}}}
  {{#if context}}Conversation Context (use for disambiguation if needed): {{{context}}}{{/if}}

  Analyze the query (and conversation context, if provided) and provide the following information:
  - intent: A brief description of the user's intent.
  - relevantContext: If the query requires additional context, describe what context would be relevant. Otherwise, leave blank.
  - requiresContext: true if the query requires additional context, false otherwise.
  `,
});

const interpretUserQueryFlow = ai.defineFlow(
  {
    name: 'interpretUserQueryFlow',
    inputSchema: InterpretUserQueryInputSchema,
    outputSchema: InterpretUserQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

