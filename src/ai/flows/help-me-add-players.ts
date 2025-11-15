'use server';

/**
 * @fileOverview Generates realistic player names based on a user-provided prompt.
 *
 * - generatePlayerNames - A function that generates player names.
 * - GeneratePlayerNamesInput - The input type for the generatePlayerNames function.
 * - GeneratePlayerNamesOutput - The return type for the generatePlayerNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlayerNamesInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A description of the type of players the user wants to add to the tournament, which is used to generate realistic player names.'
    ),
  numberOfPlayers: z.number().describe('The number of player names to generate.'),
});
export type GeneratePlayerNamesInput = z.infer<typeof GeneratePlayerNamesInputSchema>;

const GeneratePlayerNamesOutputSchema = z.object({
  playerNames: z.array(z.string()).describe('An array of generated player names.'),
});
export type GeneratePlayerNamesOutput = z.infer<typeof GeneratePlayerNamesOutputSchema>;

export async function generatePlayerNames(
  input: GeneratePlayerNamesInput
): Promise<GeneratePlayerNamesOutput> {
  return generatePlayerNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlayerNamesPrompt',
  input: {schema: GeneratePlayerNamesInputSchema},
  output: {schema: GeneratePlayerNamesOutputSchema},
  prompt: `You are a tournament organizer. The user wants to add players to the tournament, and you need to generate realistic player names for them, based on their description.

Description: {{{prompt}}}
Number of Players: {{{numberOfPlayers}}}

Generate a list of {{numberOfPlayers}} player names that fit the description. Return them as a JSON array of strings.`,
});

const generatePlayerNamesFlow = ai.defineFlow(
  {
    name: 'generatePlayerNamesFlow',
    inputSchema: GeneratePlayerNamesInputSchema,
    outputSchema: GeneratePlayerNamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
