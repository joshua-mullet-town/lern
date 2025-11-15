import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES } from '@/types';
import { CompetencyConverter } from '@/lib/converters';
import { suggestRatingsFromTranscript } from '@/lib/ai/suggestRatings';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const transcriptText = await file.text();

    // Fetch all competencies
    const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(
      CompetencyConverter
    );
    const snapshot = await getDocs(competenciesRef);
    const competencies = snapshot.docs.map((doc) => doc.data());

    // Get AI suggestions
    const suggestions = await suggestRatingsFromTranscript(transcriptText, competencies);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript' },
      { status: 500 }
    );
  }
}
