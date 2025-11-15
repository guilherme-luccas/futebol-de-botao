'use server';

/**
 * @fileOverview Generates a match schedule for a button football tournament.
 *
 * - generateMatchSchedule - A function that generates the match schedule.
 * - GenerateMatchScheduleInput - The input type for the generateMatchSchedule function.
 * - GenerateMatchScheduleOutput - The return type for the generateMatchSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMatchScheduleInputSchema = z.object({
  playerNames: z.array(z.string()).describe('Array of player names.'),
  numFields: z.number().describe('Number of available football fields.'),
});
export type GenerateMatchScheduleInput = z.infer<typeof GenerateMatchScheduleInputSchema>;

const GenerateMatchScheduleOutputSchema = z.object({
  schedule: z.array(
    z.object({
      round: z.number().describe('The round number.'),
      matches: z.array(
        z.object({
          field: z.number().describe('The field number.'),
          player1: z.string().describe('Player 1 name.'),
          player2: z.string().describe('Player 2 name.'),
          bye: z.boolean().optional().describe('True if it is a bye round'),
        })
      ),
    })
  ).describe('The generated match schedule.'),
});
export type GenerateMatchScheduleOutput = z.infer<typeof GenerateMatchScheduleOutputSchema>;

export async function generateMatchSchedule(input: GenerateMatchScheduleInput): Promise<GenerateMatchScheduleOutput> {
  return generateMatchScheduleFlow(input);
}

const generateMatchSchedulePrompt = ai.definePrompt({
  name: 'generateMatchSchedulePrompt',
  input: {schema: GenerateMatchScheduleInputSchema},
  output: {schema: GenerateMatchScheduleOutputSchema},
  prompt: `You are a tournament organizer for button football.

Given the following players:

{{#each playerNames}}
- {{this}}
{{/each}}

And the number of available fields: {{numFields}}

Generate a match schedule such that everyone plays against each other. Optimize the schedule to minimize wasted field capacity. If there is an odd number of players in a round, assign a 'bye' to a player.

Return the schedule in JSON format.
`,
});

const generateMatchScheduleFlow = ai.defineFlow(
  {
    name: 'generateMatchScheduleFlow',
    inputSchema: GenerateMatchScheduleInputSchema,
    outputSchema: GenerateMatchScheduleOutputSchema,
  },
  async input => {
    const {output} = await generateMatchSchedulePrompt(input);
    return output!;
  }
);
