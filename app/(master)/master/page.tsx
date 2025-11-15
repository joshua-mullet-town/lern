'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Rating, Competency, User } from '@/types';
import { RatingConverter, CompetencyConverter, UserConverter } from '@/lib/converters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { StartRatingButton } from '@/components/rating/StartRatingButton';
import { Spinner } from '@/components/ui/spinner';
import { POCNotes } from '@/components/ui/poc-notes';

// Hardcoded for POC
const EMPLOYER_ID = 'test-employer-main';

interface RatingWithDetails extends Rating {
  competency?: Competency;
  learner?: User;
}

export default function MasterDashboard() {
  const [pendingRatings, setPendingRatings] = useState<RatingWithDetails[]>([]);
  const [completedRatings, setCompletedRatings] = useState<RatingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for pending ratings
    const ratingsRef = collection(db, COLLECTION_NAMES.ratings).withConverter(RatingConverter);
    const pendingQuery = query(
      ratingsRef,
      where('rater_id', '==', EMPLOYER_ID),
      where('rater_type', '==', 'master'),
      where('status', '==', 'pending')
    );

    const unsubscribePending = onSnapshot(pendingQuery, async (snapshot) => {
      const pending = snapshot.docs.map((doc) => doc.data());

      // Fetch details for pending ratings
      const pendingWithDetails = await Promise.all(
        pending.map(async (rating) => {
          const competencyRef = doc(db, COLLECTION_NAMES.competencies, rating.competency_id).withConverter(CompetencyConverter);
          const competencySnap = await getDoc(competencyRef);
          const competency = competencySnap.exists() ? competencySnap.data() : undefined;

          const learnerRef = doc(db, COLLECTION_NAMES.users, rating.learner_id).withConverter(UserConverter);
          const learnerSnap = await getDoc(learnerRef);
          const learner = learnerSnap.exists() ? learnerSnap.data() : undefined;

          return { ...rating, competency, learner };
        })
      );

      setPendingRatings(pendingWithDetails);
      setLoading(false);
    });

    // Real-time listener for completed ratings
    const completedQuery = query(
      ratingsRef,
      where('rater_id', '==', EMPLOYER_ID),
      where('rater_type', '==', 'master'),
      where('status', '==', 'completed')
    );

    const unsubscribeCompleted = onSnapshot(completedQuery, async (snapshot) => {
      const completed = snapshot.docs.map((doc) => doc.data());

      // Fetch details for completed ratings
      const completedWithDetails = await Promise.all(
        completed.map(async (rating) => {
          const competencyRef = doc(db, COLLECTION_NAMES.competencies, rating.competency_id).withConverter(CompetencyConverter);
          const competencySnap = await getDoc(competencyRef);
          const competency = competencySnap.exists() ? competencySnap.data() : undefined;

          const learnerRef = doc(db, COLLECTION_NAMES.users, rating.learner_id).withConverter(UserConverter);
          const learnerSnap = await getDoc(learnerRef);
          const learner = learnerSnap.exists() ? learnerSnap.data() : undefined;

          return { ...rating, competency, learner };
        })
      );

      // Sort by date (most recent first)
      const sorted = completedWithDetails.sort((a, b) => {
        const aDate = a.updated_at || a.created_at;
        const bDate = b.updated_at || b.created_at;

        // Convert to Date if needed
        const aTime = aDate instanceof Date ? aDate.getTime() : (aDate as { toDate: () => Date }).toDate().getTime();
        const bTime = bDate instanceof Date ? bDate.getTime() : (bDate as { toDate: () => Date }).toDate().getTime();

        return bTime - aTime;
      });

      setCompletedRatings(sorted);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribePending();
      unsubscribeCompleted();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Rating Requests</h1>
        <div className="flex items-center justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Rating Requests</h1>
        <POCNotes>
          <p className="text-slate-600 mt-2 max-w-3xl">
            As an industry expert (Master), your verifications are the most valuable endorsements in the LERN system. Review rating requests from educators and use the same 0-4 rubric to formally verify students' workplace competencies. Your third-party endorsement creates the critical "triple-rating" that employers trust—transforming student claims into verified credentials.
          </p>
        </POCNotes>
      </div>

      {/* Pending Rating Requests */}
      {pendingRatings.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-900">Pending Rating Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">
              You have {pendingRatings.length} pending rating request{pendingRatings.length !== 1 ? 's' : ''} to complete.
            </p>
            <StartRatingButton ratings={pendingRatings} />
          </CardContent>
        </Card>
      )}

      {/* Completed Ratings History */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Rating History</h2>
        {completedRatings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-500">No completed ratings yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-slate-200">
              {completedRatings.map((rating) => {
                const date = rating.updated_at || rating.created_at;
                const dateObj = date instanceof Date ? date : (date as { toDate: () => Date }).toDate();

                return (
                  <div key={rating.id} className="py-4 first:pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {rating.learner?.display_name || 'Unknown Learner'}
                          </h3>
                          <span className="text-sm text-slate-500">•</span>
                          <span className="text-sm text-slate-600">
                            {rating.competency?.title || 'Unknown Competency'}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-slate-600 mt-1">{rating.comment}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-400">
                            {dateObj.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="bg-blue-500 text-white rounded-lg px-3 py-1.5 text-center min-w-[3rem]">
                          <div className="text-xs font-medium uppercase tracking-wide">Score</div>
                          <div className="text-xl font-bold">{rating.score}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
