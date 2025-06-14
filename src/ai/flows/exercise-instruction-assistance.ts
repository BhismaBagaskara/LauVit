'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing exercise instructions and technique guidance using AI.
 *
 * - getExerciseInstructions - A function that takes an exercise name and returns AI-generated instructions.
 * - ExerciseInstructionsInput - The input type for the getExerciseInstructions function.
 * - ExerciseInstructionsOutput - The return type for the getExerciseInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExerciseInstructionsInputSchema = z.object({
  exerciseName: z.string().describe('The name of the exercise for which instructions are requested.'),
});

export type ExerciseInstructionsInput = z.infer<typeof ExerciseInstructionsInputSchema>;

const ExerciseInstructionsOutputSchema = z.object({
  instructions: z.string().describe('AI-generated instructions and technique guidance for the specified exercise.'),
});

export type ExerciseInstructionsOutput = z.infer<typeof ExerciseInstructionsOutputSchema>;

export async function getExerciseInstructions(input: ExerciseInstructionsInput): Promise<ExerciseInstructionsOutput> {
  return exerciseInstructionsFlow(input);
}

const exerciseInstructionsPrompt = ai.definePrompt({
  name: 'exerciseInstructionsPrompt',
  input: {schema: ExerciseInstructionsInputSchema},
  output: {schema: ExerciseInstructionsOutputSchema},
  prompt: `You are a certified personal trainer. A user has requested instructions for the following exercise: {{{exerciseName}}}. Provide detailed instructions and technique guidance to ensure they perform the exercise correctly and safely. Focus on form and injury prevention.`,
});

const exerciseInstructionsFlow = ai.defineFlow(
  {
    name: 'exerciseInstructionsFlow',
    inputSchema: ExerciseInstructionsInputSchema,
    outputSchema: ExerciseInstructionsOutputSchema,
  },
  async input => {
    const {output} = await exerciseInstructionsPrompt(input);
    return output!;
  }
);
