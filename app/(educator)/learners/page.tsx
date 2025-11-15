import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES } from '@/types';
import { UserConverter } from '@/lib/converters';
import { LearnerCard } from '@/components/learner/LearnerCard';
import { CreateLearnerWizard } from '@/components/learner/CreateLearnerWizard';
import { POCNotes } from '@/components/ui/poc-notes';

// Hardcoded for POC
const ORG_ID = 'demo-org-456';

export default async function LearnersPage() {
  // Fetch learners from Firestore
  const usersRef = collection(db, COLLECTION_NAMES.users).withConverter(UserConverter);
  const learnersQuery = query(
    usersRef,
    where('org_id', '==', ORG_ID),
    where('roles', 'array-contains', 'learner')
  );
  const snapshot = await getDocs(learnersQuery);
  const learners = snapshot.docs.map((doc) => doc.data());

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learners</h1>
            <POCNotes>
              <p>
                View and manage all students in your organization. Create new LERN profiles upon enrollment to establish their "single source of truth" from Day 1. Upload a transcript and AI will automatically analyze it to suggest initial competency ratings. Each learner's profile tracks competencies, portfolio artifacts, and verified ratings from educators, peers, and industry experts—building a comprehensive record that goes beyond traditional transcripts.
              </p>
            </POCNotes>
          </div>
          <CreateLearnerWizard />
        </div>
      </div>

      {learners.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No learners yet</p>
          <CreateLearnerWizard />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {learners.map((learner) => (
            <LearnerCard key={learner.id} learner={learner} />
          ))}
        </div>
      )}
    </div>
  );
}
