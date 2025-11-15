import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTION_NAMES } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { learnerId, hiddenCompetencyIds } = await request.json();

    if (!learnerId || !Array.isArray(hiddenCompetencyIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Update user document with new hidden competency IDs
    await adminDb.collection(COLLECTION_NAMES.users).doc(learnerId).update({
      hidden_competency_ids: hiddenCompetencyIds,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update visibility settings' },
      { status: 500 }
    );
  }
}
