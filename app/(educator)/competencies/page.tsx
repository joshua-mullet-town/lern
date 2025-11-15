import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES } from '@/types';
import { CompetencyConverter } from '@/lib/converters';
import { CompetencyCard } from '@/components/competency/CompetencyCard';
import { CreateCompetencyModal } from '@/components/competency/CreateCompetencyModal';
import { POCNotes } from '@/components/ui/poc-notes';

export default async function CompetenciesPage() {
  // Fetch competencies from Firestore
  const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(
    CompetencyConverter
  );
  const snapshot = await getDocs(competenciesRef);
  const competencies = snapshot.docs.map((doc) => doc.data());

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Competencies</h1>
            <POCNotes>
              <p>
                Create and manage the competencies (skills) that students will be rated on. Each competency uses a standardized 0-4 rubric for consistent evaluation across all raters.
              </p>
            </POCNotes>
          </div>
          <CreateCompetencyModal />
        </div>
      </div>

      {competencies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No competencies yet</p>
          <CreateCompetencyModal />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {competencies.map((competency) => (
            <CompetencyCard key={competency.id} competency={competency} />
          ))}
        </div>
      )}
    </div>
  );
}
