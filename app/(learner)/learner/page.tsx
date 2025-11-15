'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, Rating } from '@/types';
import { RatingConverter, CompetencyConverter } from '@/lib/converters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { StartAssessmentButton } from '@/components/learner/StartAssessmentButton';
import { OverallProgressChart } from '@/components/learner/OverallProgressChart';
import { CompetencyProgressChart } from '@/components/learner/CompetencyProgressChart';
import { ArtifactGallery } from '@/components/artifact/ArtifactGallery';
import { ArtifactModal } from '@/components/artifact/ArtifactModal';
import { POCNotes } from '@/components/ui/poc-notes';

// Hardcoded for POC - Test Learner (main testing profile)
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

export default function LearnerDashboard() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all competencies (one-time)
      const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(CompetencyConverter);
      const competenciesSnap = await getDocs(competenciesRef);
      const competenciesData = competenciesSnap.docs.map((doc) => doc.data());
      setCompetencies(competenciesData);
      setLoading(false);
    };

    fetchData();

    // Set up real-time listener for ratings
    const ratingsRef = collection(db, COLLECTION_NAMES.ratings).withConverter(RatingConverter);
    const ratingsQuery = query(ratingsRef, where('learner_id', '==', LEARNER_ID));
    const unsubscribe = onSnapshot(ratingsQuery, (snapshot) => {
      const ratingsData = snapshot.docs.map((doc) => doc.data());
      setRatings(ratingsData);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">My Competencies</h1>
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  // Separate pending and completed ratings
  const pendingRatings = ratings.filter(r => r.status === 'pending' && r.rater_type === 'self');
  const completedRatings = ratings.filter(r => r.status === 'completed');

  // Attach competency details to pending ratings
  const pendingWithCompetencies = pendingRatings.map(rating => ({
    ...rating,
    competency: competencies.find(c => c.id === rating.competency_id),
  }));

  // Group completed ratings by competency
  const groupedRatings = groupRatingsByCompetency(completedRatings, competencies);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Competencies</h1>
        <POCNotes>
          <p>
            View your competency ratings from multiple sources: self-assessments, educator ratings, and industry expert verifications. Complete pending self-assessments and track your progress over time using the charts below.
          </p>
        </POCNotes>
      </div>

      {/* Pending Rating Requests */}
      {pendingRatings.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-900">Pending Self-Assessments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">
              You have {pendingRatings.length} pending self-assessment{pendingRatings.length !== 1 ? 's' : ''} to complete.
            </p>
            <StartAssessmentButton ratings={pendingWithCompetencies} />
          </CardContent>
        </Card>
      )}

      {/* Overall Progress Chart */}
      {completedRatings.length > 0 && (
        <OverallProgressChart ratings={completedRatings} competencies={competencies} />
      )}

      {/* Competencies Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Rated Competencies</h2>
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
                    <div className="ml-4 bg-slate-900 rounded-lg border-2 border-slate-700 shadow-sm overflow-hidden">
                      <div className="px-6 py-2 bg-slate-800 text-center">
                        <div className="text-xs font-medium text-white uppercase tracking-wide">Current Avg</div>
                      </div>
                      <div className="px-6 py-3 text-center">
                        <div className="text-2xl font-bold text-white">{average.toFixed(1)}</div>
                      </div>
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
                    <ArtifactGallery
                      competencyId={competency.id}
                      learnerId={LEARNER_ID}
                      onViewAll={() => {
                        setSelectedCompetency(competency);
                        setModalOpen(true);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Artifact Modal */}
      {selectedCompetency && (
        <ArtifactModal
          competency={selectedCompetency}
          learnerId={LEARNER_ID}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
