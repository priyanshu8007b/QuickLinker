'use server';
/**
 * @fileOverview A Genkit flow that generates AI-powered insights and summaries for shortened link performance analytics.
 *
 * - linkPerformanceInsight - A function that fetches performance insights for a given link.
 * - LinkPerformanceInsightInput - The input type for the linkPerformanceInsight function.
 * - LinkPerformanceInsightOutput - The return type for the linkPerformanceInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LinkPerformanceInsightInputSchema = z.object({
  linkTitle: z.string().describe('The title or name of the shortened link.'),
  shortCode: z.string().describe('The short code of the link.'),
  originalUrl: z.string().url().describe('The original long URL.'),
  totalClicks: z.number().int().min(0).describe('The total number of clicks for the link.'),
  dailyClicks: z.array(
    z.object({
      date: z.string().describe('The date in YYYY-MM-DD format.'),
      clicks: z.number().int().min(0).describe('Number of clicks on this date.'),
    })
  ).describe('An array of daily click counts.'),
  referrers: z.array(
    z.object({
      name: z.string().describe('The name of the referrer (e.g., "Google", "Twitter").'),
      count: z.number().int().min(0).describe('Number of clicks from this referrer.'),
    })
  ).describe('An array of top referrers and their click counts.'),
  deviceTypes: z.array(
    z.object({
      name: z.string().describe('The type of device (e.g., "Mobile", "Desktop").'),
      count: z.number().int().min(0).describe('Number of clicks from this device type.'),
    })
  ).describe('An array of device types and their click counts.'),
});
export type LinkPerformanceInsightInput = z.infer<typeof LinkPerformanceInsightInputSchema>;

const LinkPerformanceInsightOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the link\'s performance.'),
  keyInsights: z.array(z.string()).describe('A list of key takeaways or trends.'),
  recommendations: z.array(z.string()).describe('Actionable recommendations based on the insights.'),
});
export type LinkPerformanceInsightOutput = z.infer<typeof LinkPerformanceInsightOutputSchema>;

export async function linkPerformanceInsight(input: LinkPerformanceInsightInput): Promise<LinkPerformanceInsightOutput> {
  return linkPerformanceInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'linkPerformanceInsightPrompt',
  input: {schema: LinkPerformanceInsightInputSchema},
  output: {schema: LinkPerformanceInsightOutputSchema},
  prompt: `You are an expert analytics assistant specializing in URL shortener performance. Your goal is to provide concise and actionable insights from the provided link analytics data. Analyze the data and generate a comprehensive summary, key insights, and actionable recommendations.

Link Title: {{{linkTitle}}}
Short Code: {{{shortCode}}}
Original URL: {{{originalUrl}}}
Total Clicks: {{{totalClicks}}}

Daily Clicks:
{{#each dailyClicks}}
  - Date: {{{date}}}, Clicks: {{{clicks}}}
{{/each}}

Referrers:
{{#each referrers}}
  - Source: {{{name}}}, Clicks: {{{count}}}
{{/each}}

Device Types:
{{#each deviceTypes}}
  - Type: {{{name}}}, Clicks: {{{count}}}
{{/each}}

Based on the above data, provide:
1. A comprehensive summary of the link's performance.
2. Key insights and trends observed.
3. Actionable recommendations to improve or leverage the link's performance.
`,
});

const linkPerformanceInsightFlow = ai.defineFlow(
  {
    name: 'linkPerformanceInsightFlow',
    inputSchema: LinkPerformanceInsightInputSchema,
    outputSchema: LinkPerformanceInsightOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
