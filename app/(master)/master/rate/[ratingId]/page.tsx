import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES } from '@/types';
import { RatingConverter, CompetencyConverter, UserConverter } from '@/lib/converters';
import { MasterRatingForm } from '@/components/rating/MasterRatingForm';
import { notFound } from 'next/navigation';
import { POCNotes } from '@/components/ui/poc-notes';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ ratingId: string }>;
}

export default async function RateCompetencyPage({ params }: PageProps) {
  const { ratingId } = await params;

  // Fetch rating
  const ratingRef = doc(db, COLLECTION_NAMES.ratings, ratingId).withConverter(RatingConverter);
  const ratingSnap = await getDoc(ratingRef);

  if (!ratingSnap.exists()) {
    notFound();
  }

  const rating = ratingSnap.data();

  // Fetch competency
  const competencyRef = doc(db, COLLECTION_NAMES.competencies, rating.competency_id).withConverter(CompetencyConverter);
  const competencySnap = await getDoc(competencyRef);

  if (!competencySnap.exists()) {
    notFound();
  }

  const competency = competencySnap.data();

  // Fetch learner
  const learnerRef = doc(db, COLLECTION_NAMES.users, rating.learner_id).withConverter(UserConverter);
  const learnerSnap = await getDoc(learnerRef);

  if (!learnerSnap.exists()) {
    notFound();
  }

  const learner = learnerSnap.data();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Submit Rating</h1>
        <POCNotes>
          <p className="text-slate-600 mt-2 max-w-3xl">
            Use the 0-4 rubric below to rate this student's demonstrated competency in a workplace setting. Your external verification provides the critical "trust signal" that makes this student's skills legible and credible to all future employers. This is the most valuable endorsement in the LERN system.
          </p>
        </POCNotes>
      </div>

      <MasterRatingForm rating={rating} competency={competency} learner={learner} />
    </div>
  );
}
