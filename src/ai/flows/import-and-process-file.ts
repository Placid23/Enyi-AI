'use server';
/**
 * @fileOverview Flow for importing and processing files.
 *
 * - importAndProcessFile - A function that handles the file import and processing.
 * - ImportAndProcessFileInput - The input type for the importAndProcessFile function.
 * - ImportAndProcessFileOutput - The return type for the importAndProcessFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportAndProcessFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file's data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The question to ask about the file data.'),
});
export type ImportAndProcessFileInput = z.infer<typeof ImportAndProcessFileInputSchema>;

const ImportAndProcessFileOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the file data.'),
});
export type ImportAndProcessFileOutput = z.infer<typeof ImportAndProcessFileOutputSchema>;

export async function importAndProcessFile(input: ImportAndProcessFileInput): Promise<ImportAndProcessFileOutput> {
  return importAndProcessFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importAndProcessFilePrompt',
  input: {schema: ImportAndProcessFileInputSchema},
  output: {schema: ImportAndProcessFileOutputSchema},
  prompt: `You are a helpful assistant that answers questions about the content of a file.\n\nHere is the file data:\n\n{{media url=fileDataUri}}\n\nHere is the question:\n\n{{{query}}}`,
});

const importAndProcessFileFlow = ai.defineFlow(
  {
    name: 'importAndProcessFileFlow',
    inputSchema: ImportAndProcessFileInputSchema,
    outputSchema: ImportAndProcessFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
