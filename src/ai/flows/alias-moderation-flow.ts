'use server';
/**
 * @fileOverview This file defines a Genkit flow for moderating custom URL aliases.
 * It detects offensive, trademarked, or reserved keywords in a given alias.
 *
 * - moderateCustomAlias - A function that handles the alias moderation process.
 * - CustomAliasModerationInput - The input type for the moderateCustomAlias function.
 * - CustomAliasModerationOutput - The return type for the moderateCustomAlias function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomAliasModerationInputSchema = z.object({
  alias: z.string().min(1).describe('The custom alias string to be moderated.'),
  reservedKeywords: z.array(z.string()).optional().describe('An optional list of reserved keywords to check against.'),
});
export type CustomAliasModerationInput = z.infer<typeof CustomAliasModerationInputSchema>;

const CustomAliasModerationOutputSchema = z.object({
  isModerated: z.boolean().describe('True if the alias is flagged for moderation, false otherwise.'),
  reason: z.string().describe('The reason for moderation if the alias is flagged, otherwise "OK".'),
});
export type CustomAliasModerationOutput = z.infer<typeof CustomAliasModerationOutputSchema>;

export async function moderateCustomAlias(
  input: CustomAliasModerationInput
): Promise<CustomAliasModerationOutput> {
  return customAliasModerationFlow(input);
}

const customAliasModerationPrompt = ai.definePrompt({
  name: 'customAliasModerationPrompt',
  input: {schema: CustomAliasModerationInputSchema},
  output: {schema: CustomAliasModerationOutputSchema},
  prompt: `You are an AI assistant specialized in moderating custom URL aliases for a URL shortener service. Your task is to evaluate a given alias and determine if it should be moderated based on the following criteria:
1.  **Offensiveness**: The alias should not contain any vulgar, hateful, sexually explicit, or generally inappropriate language.
2.  **Trademark/Brand Infringement**: The alias should not infringe on common trademarks, well-known brand names, or copyrighted terms. Do not perform external lookups, use your general knowledge.
3.  **Reserved Keywords**: The alias should not be present in the provided list of reserved keywords.

If the alias violates any of these rules, set 'isModerated' to true and provide a concise 'reason'. If the alias is acceptable, set 'isModerated' to false and the 'reason' to "OK".

Here is the custom alias to evaluate: "{{{alias}}}"

{{#if reservedKeywords.length}}
Here is a list of reserved keywords to check against:
{{#each reservedKeywords}}
- "{{{this}}}"
{{/each}}
{{/if}}

Please provide your response in JSON format.`,
});

const customAliasModerationFlow = ai.defineFlow(
  {
    name: 'customAliasModerationFlow',
    inputSchema: CustomAliasModerationInputSchema,
    outputSchema: CustomAliasModerationOutputSchema,
  },
  async (input) => {
    const {output} = await customAliasModerationPrompt(input);
    return output!;
  }
);
