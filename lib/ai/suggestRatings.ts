import OpenAI from 'openai';
import { Competency, RatingScore } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SuggestedRating {
  competency_id: string;
  score: RatingScore;
  comment: string;
}

/**
 * Analyzes a transcript and suggests ratings for competencies using OpenAI
 */
export async function suggestRatingsFromTranscript(
  transcriptText: string,
  competencies: Competency[]
): Promise<SuggestedRating[]> {
  const competencyList = competencies
    .map((c) => `- ID: "${c.id}" | Title: ${c.title} | Description: ${c.description}`)
    .join('\n');

  const systemPrompt = `You are an expert educator analyzing student transcripts to assess competencies.

Given a student transcript and a list of competencies, suggest a rating (0-4) and brief comment for each relevant competency.

Rating Scale:
- 0: No evidence
- 1: Beginning (minimal evidence, early development)
- 2: Developing (some evidence, growing competency)
- 3: Proficient (strong evidence, solid competency)
- 4: Expert (exceptional evidence, mastery level)

IMPORTANT:
1. Only suggest ratings for competencies where you find clear evidence in the transcript.
2. You MUST use the exact competency ID provided in the list (the value after "ID:"). Do not make up IDs.
3. If there's no evidence for a competency, do not include it in your response.
4. DO NOT mention the student's name in your comments. Keep comments generic and focused on the evidence of skills demonstrated.

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {
      "competency_id": "the-exact-id-from-the-list",
      "score": 3,
      "comment": "Brief explanation of evidence found"
    }
  ]
}

Example: If the competency list shows 'ID: "abc123"', you must use "abc123" as the competency_id.`;

  const userPrompt = `TRANSCRIPT:
${transcriptText}

COMPETENCIES TO ASSESS:
${competencyList}

Analyze the transcript and suggest ratings with supporting comments.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed.suggestions || [];
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to analyze transcript. Please try again.');
  }
}
