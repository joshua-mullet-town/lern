import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, Rating } from '@/types';
import { UserConverter, RatingConverter, CompetencyConverter } from '@/lib/converters';
import { LearnerProfileHeader } from '@/components/learner/LearnerProfileHeader';
import { AddCompetencyRating } from '@/components/rating/AddCompetencyRating';
import { RequestRatingModal } from '@/components/rating/RequestRatingModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OverallProgressChart } from '@/components/learner/OverallProgressChart';
import { CompetencyProgressChart } from '@/components/learner/CompetencyProgressChart';
import { POCNotes } from '@/components/ui/poc-notes';
import { notFound } from 'next/navigation';

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

export default async function LearnerProfilePage({ params }: PageProps) {
  const { learnerId } = await params;

  // Fetch learner
  const learnerRef = doc(db, COLLECTION_NAMES.users, learnerId).withConverter(UserConverter);
  const learnerSnap = await getDoc(learnerRef);

  if (!learnerSnap.exists()) {
    notFound();
  }

  const learner = learnerSnap.data();

  // Fetch ratings for this learner
  const ratingsRef = collection(db, COLLECTION_NAMES.ratings).withConverter(RatingConverter);
  const ratingsQuery = query(ratingsRef, where('learner_id', '==', learnerId));
  const ratingsSnap = await getDocs(ratingsQuery);
  const ratings = ratingsSnap.docs.map((doc) => doc.data());

  // Fetch all competencies (to match with ratings)
  const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(CompetencyConverter);
  const competenciesSnap = await getDocs(competenciesRef);
  const competencies = competenciesSnap.docs.map((doc) => doc.data());

  // Separate completed ratings for charts
  const completedRatings = ratings.filter(r => r.status === 'completed');

  // Group ratings by competency
  const groupedRatings = groupRatingsByCompetency(completedRatings, competencies);

  return (
    <div className="space-y-8">
      <div>
        <LearnerProfileHeader learner={learner} />
        <POCNotes>
          <p>
            Submit ratings for this student's competencies using the 0-4 rubric. You can also request ratings from industry experts (Masters) to add third-party verification. Progress charts show how ratings change over time.
          </p>
        </POCNotes>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <RequestRatingModal learnerId={learnerId} />
          <AddCompetencyRating learnerId={learnerId} />
        </div>
      </div>

      {/* Overall Progress Chart */}
      {completedRatings.length > 0 && (
        <OverallProgressChart ratings={completedRatings} competencies={competencies} />
      )}

      {/* Competencies Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Competencies</h2>
        {groupedRatings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-500">No competencies rated yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groupedRatings.map(({ competency, ratings, average }) => (
              <Card key={competency.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex-1">{competency.title}</CardTitle>
                    <div className="ml-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg px-4 py-2 shadow-sm text-center">
                      <div className="text-xs font-medium text-blue-100 uppercase tracking-wide">Current Avg</div>
                      <div className="text-2xl font-bold text-white">{average.toFixed(1)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {ratings.map((rating) => (
                        <Badge key={rating.id} variant="secondary">
                          {rating.rater_type}: {rating.score}
                        </Badge>
                      ))}
                    </div>
                    <CompetencyProgressChart ratings={ratings} />
                    <AddCompetencyRating learnerId={learnerId} preselectedCompetencyId={competency.id}>
                      <Button variant="outline" size="sm" className="w-full">
                        Add Rating
                      </Button>
                    </AddCompetencyRating>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
