import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { learnerId, displayOrder } = await request.json();

    if (!learnerId || !Array.isArray(displayOrder)) {
      return NextResponse.json(
        { error: 'learnerId and displayOrder (array) are required' },
        { status: 400 }
      );
    }

    const userRef = doc(db, COLLECTION_NAMES.users, learnerId);
    await updateDoc(userRef, {
      competency_display_order: displayOrder,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating display order:', error);
    return NextResponse.json(
      { error: 'Failed to update display order' },
      { status: 500 }
    );
  }
}
