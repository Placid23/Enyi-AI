'use server';
/**
 * @fileOverview A flow to process user feedback on AI-generated messages.
 *
 * - processUserFeedback - A function that handles the user feedback.
 * - ProcessUserFeedbackInput - The input type for the processUserFeedback function.
 * - ProcessUserFeedbackOutput - The return type for the processUserFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessUserFeedbackInputSchema = z.object({
  messageId: z.string().describe('The ID of the message receiving feedback.'),
  chatId: z.string().describe('The ID of the chat containing the message.'),
  feedbackType: z.enum(['positive', 'negative']).describe("The type of feedback: 'positive' or 'negative'."),
  correctionText: z.string().optional().describe('Optional text provided by the user to correct the AI response.'),
  originalAiResponse: z.string().optional().describe('The original AI response that is being corrected or commented on.'),
  userQueryContext: z.string().optional().describe('The user query or context that led to the AI response.'),
});
export type ProcessUserFeedbackInput = z.infer<typeof ProcessUserFeedbackInputSchema>;

const ProcessUserFeedbackOutputSchema = z.object({
  status: z.string().describe("The status of the feedback processing (e.g., 'received', 'processed')."),
  message: z.string().describe('A message confirming the feedback was received or an error message.'),
});
export type ProcessUserFeedbackOutput = z.infer<typeof ProcessUserFeedbackOutputSchema>;

export async function processUserFeedback(input: ProcessUserFeedbackInput): Promise<ProcessUserFeedbackOutput> {
  return processUserFeedbackFlow(input);
}

// This prompt is a placeholder. In a real system, this flow might:
// 1. Store the feedback in a database.
// 2. Queue the feedback for review by human moderators.
// 3. Use the feedback to fine-tune models (requires significant infrastructure).
// 4. Trigger alerts for problematic responses.
const prompt = ai.definePrompt({
  name: 'processUserFeedbackPrompt',
  input: { schema: ProcessUserFeedbackInputSchema },
  output: { schema: ProcessUserFeedbackOutputSchema },
  prompt: `A user has provided feedback on an AI-generated message.
Message ID: {{{messageId}}}
Chat ID: {{{chatId}}}
Feedback Type: {{{feedbackType}}}
{{#if correctionText}}
User Correction: {{{correctionText}}}
{{/if}}
{{#if originalAiResponse}}
Original AI Response: {{{originalAiResponse}}}
{{/if}}
{{#if userQueryContext}}
User Query Context: {{{userQueryContext}}}
{{/if}}

Acknowledge receipt of this feedback. If the feedback is negative with a correction, note that this information is valuable for improving future responses.
This system currently logs feedback for future analysis and potential model improvement.
Respond with a status of "received" and a confirmation message.
`,
});

const processUserFeedbackFlow = ai.defineFlow(
  {
    name: 'processUserFeedbackFlow',
    inputSchema: ProcessUserFeedbackInputSchema,
    outputSchema: ProcessUserFeedbackOutputSchema,
  },
  async (input) => {
    console.log('Received user feedback:', input);

    // In a real application, you would store this feedback in a database,
    // potentially associate it with the user, and use it for model improvement pipelines.
    // For now, we'll just simulate processing with a simple AI call or direct response.

    // Example of a simple acknowledgment without calling another LLM:
    if (input.feedbackType === 'positive') {
      return {
        status: 'received',
        message: 'Thank you for your positive feedback! We appreciate it.',
      };
    } else {
      if (input.correctionText) {
         return {
          status: 'received',
          message: 'Thank you for your feedback and correction. This will help us improve.',
        };
      }
      return {
        status: 'received',
        message: 'Thank you for your feedback. We will use it to improve our service.',
      };
    }

    // Alternatively, you could use the 'prompt' defined above to generate a response,
    // but for simple feedback logging, a direct return is more efficient.
    // const { output } = await prompt(input);
    // if (!output) {
    //   return {
    //     status: 'error',
    //     message: 'Failed to process feedback acknowledgment via AI.',
    //   };
    // }
    // return output;
  }
);
