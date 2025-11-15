import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES } from '@/types';
import { CompetencyConverter } from '@/lib/converters';

export async function GET() {
  try {
    const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(
      CompetencyConverter
    );
    const snapshot = await getDocs(competenciesRef);
    const competencies = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(competencies);
  } catch (error) {
    console.error('Error fetching competencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competencies' },
      { status: 500 }
    );
  }
}
