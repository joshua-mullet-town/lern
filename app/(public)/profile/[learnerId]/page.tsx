import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, Rating, Organization, Artifact } from '@/types';
import { UserConverter, RatingConverter, CompetencyConverter, OrganizationConverter, ArtifactConverter } from '@/lib/converters';
import { PublicProfileHeader } from '@/components/public/PublicProfileHeader';
import { CompetencyWithTrustBadges } from '@/components/public/CompetencyWithTrustBadges';
import { Card, CardContent } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { POCNotes } from '@/components/ui/poc-notes';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    learnerId: string;
  };
}

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

export default async function PublicProfilePage({ params }: PageProps) {
  const { learnerId } = await params;

  // Fetch learner
  const learnerRef = doc(db, COLLECTION_NAMES.users, learnerId).withConverter(UserConverter);
  const learnerSnap = await getDoc(learnerRef);

  if (!learnerSnap.exists()) {
    notFound();
  }

  const learner = learnerSnap.data();

  // Fetch organization
  const orgRef = doc(db, COLLECTION_NAMES.organizations, learner.org_id).withConverter(OrganizationConverter);
  const orgSnap = await getDoc(orgRef);
  const organization = orgSnap.exists() ? orgSnap.data() : undefined;

  // Fetch completed ratings for this learner
  const ratingsRef = collection(db, COLLECTION_NAMES.ratings).withConverter(RatingConverter);
  const ratingsQuery = query(
    ratingsRef,
    where('learner_id', '==', learnerId),
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
  const artifactsQuery = query(artifactsRef, where('learner_id', '==', learnerId));
  const artifactsSnap = await getDocs(artifactsQuery);
  const artifacts = artifactsSnap.docs.map((doc) => doc.data());

  // Group ratings by competency
  const groupedRatings = groupRatingsByCompetency(ratings, competencies);

  // Filter out hidden competencies
  const visibleRatings = groupedRatings.filter(({ competency }) => {
    const hiddenIds = learner.hidden_competency_ids || [];
    return !hiddenIds.includes(competency.id);
  });

  // Sort by custom display order if available
  const displayOrder = learner.competency_display_order || [];
  if (displayOrder.length > 0) {
    visibleRatings.sort((a, b) => {
      const indexA = displayOrder.indexOf(a.competency.id);
      const indexB = displayOrder.indexOf(b.competency.id);
      // If both are in the order, sort by position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only A is in the order, it comes first
      if (indexA !== -1) return -1;
      // If only B is in the order, it comes first
      if (indexB !== -1) return 1;
      // If neither is in the order, maintain current order
      return 0;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Logo in top left - Fixed position */}
      <Link
        href="/"
        className="fixed top-0 left-0 z-50 inline-flex items-center px-8 py-5 bg-white border-r-2 border-b-2 border-slate-200 rounded-br-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
      >
        <Image
          src="/lern-logo-black.png"
          alt="LERN"
          width={200}
          height={65}
          className="h-16 w-auto"
        />
      </Link>

      <div className="max-w-4xl mx-auto px-2 md:px-8 py-8 space-y-8">
        <PublicProfileHeader learner={learner} organization={organization} />

        <div>
          <h2 className="text-2xl font-semibold mb-2">Verified Competencies</h2>
          <div className="mb-6">
            <POCNotes>
              <p>
                This portfolio displays verified competency ratings from three sources: self-assessment, educator verification, and industry expert endorsement. Each competency uses a standardized 0-4 rubric with supporting work artifacts where available.
              </p>
            </POCNotes>
          </div>
          {visibleRatings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">No verified competencies yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {visibleRatings.map(({ competency, ratings, average }) => {
                // Filter artifacts for this competency
                const competencyArtifacts = artifacts.filter(a =>
                  a.competency_ids.includes(competency.id)
                );

                return (
                  <CompetencyWithTrustBadges
                    key={competency.id}
                    competency={competency}
                    ratings={ratings}
                    average={average}
                    artifacts={competencyArtifacts}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
