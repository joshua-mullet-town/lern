import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, Rating, Artifact } from '@/types';
import { UserConverter, RatingConverter, CompetencyConverter, ArtifactConverter } from '@/lib/converters';
import { PortfolioManager } from '@/components/learner/PortfolioManager';

export const dynamic = 'force-dynamic';

// Hardcoded for POC
const LEARNER_ID = 'test-learner-main';

// Helper to group ratings by competency and calculate average
function groupRatingsByCompetency(ratings: Rating[], competencies: Competency[]) {
  const competencyMap = new Map(competencies.map(c => [c.id, c]));
  const grouped = new Map<string, { competency: Competency; ratings: Rating[]; average: number }>();

  for (const rating of ratings) {
    if (rating.status !== 'completed' || rating.score === undefined) continue;

    const competency = competencyMap.get(rating.competency_id);
    if (!competency) continue;

    if (!grouped.has(rating.competency_id)) {
      grouped.set(rating.competency_id, {
        competency,
        ratings: [],
        average: 0,
      });
    }

    grouped.get(rating.competency_id)!.ratings.push(rating);
  }

  // Calculate averages
  for (const [, data] of grouped) {
    const sum = data.ratings.reduce((acc, r) => acc + (r.score || 0), 0);
    data.average = sum / data.ratings.length;
  }

  return Array.from(grouped.values());
}

export default async function PortfolioPage() {
  // Fetch learner
  const learnerRef = doc(db, COLLECTION_NAMES.users, LEARNER_ID).withConverter(UserConverter);
  const learnerSnap = await getDoc(learnerRef);
  const learner = learnerSnap.data();

  if (!learner) {
    return <div>Learner not found</div>;
  }

  // Fetch completed ratings for this learner
  const ratingsRef = collection(db, COLLECTION_NAMES.ratings).withConverter(RatingConverter);
  const ratingsQuery = query(
    ratingsRef,
    where('learner_id', '==', LEARNER_ID),
    where('status', '==', 'completed')
  );
  const ratingsSnap = await getDocs(ratingsQuery);
  const ratings = ratingsSnap.docs.map((doc) => doc.data());

  // Fetch all competencies
  const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(CompetencyConverter);
  const competenciesSnap = await getDocs(competenciesRef);
  const competencies = competenciesSnap.docs.map((doc) => doc.data());

  // Fetch artifacts for this learner
  const artifactsRef = collection(db, COLLECTION_NAMES.artifacts).withConverter(ArtifactConverter);
  const artifactsQuery = query(artifactsRef, where('learner_id', '==', LEARNER_ID));
  const artifactsSnap = await getDocs(artifactsQuery);
  const artifacts = artifactsSnap.docs.map((doc) => doc.data());

  // Group ratings by competency
  const groupedCompetencies = groupRatingsByCompetency(ratings, competencies);

  return (
    <PortfolioManager
      learnerId={LEARNER_ID}
      learner={learner}
      competencies={groupedCompetencies}
      artifacts={artifacts}
    />
  );
}
