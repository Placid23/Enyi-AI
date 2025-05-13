'use server';
/**
 * @fileOverview An AI agent that generates images based on a text prompt.
 *
 * - generateImage - A function that handles image generation.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image, as a data URI that must include a MIME type (e.g., image/png) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  revisedPrompt: z.string().optional().describe('The prompt that was actually used by the model, if revised, or a descriptive text.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
      },
    });

    if (!media?.url) {
      console.error('Image generation failed: No media URL returned from the model. Input prompt:', input.prompt, 'Full response:', {media, text});
      throw new Error('Image generation failed: The AI model did not return an image. This might be due to the prompt or model limitations.');
    }

    return {
      imageDataUri: media.url,
      revisedPrompt: text || `Generated image for: ${input.prompt}`, // The model might return a revised prompt or related text
    };
  }
);
