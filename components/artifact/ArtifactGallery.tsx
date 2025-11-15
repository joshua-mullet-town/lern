'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Artifact } from '@/types';
import { ArtifactConverter } from '@/lib/converters';
import { ArtifactThumbnail } from './ArtifactThumbnail';
import { Button } from '@/components/ui/button';
import { Eye, Plus } from 'lucide-react';

interface ArtifactGalleryProps {
  competencyId: string;
  learnerId: string;
  onViewAll?: () => void;
}

export function ArtifactGallery({ competencyId, learnerId, onViewAll }: ArtifactGalleryProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const artifactsRef = collection(db, COLLECTION_NAMES.artifacts).withConverter(ArtifactConverter);
    const q = query(
      artifactsRef,
      where('learner_id', '==', learnerId),
      where('competency_ids', 'array-contains', competencyId),
      orderBy('created_at', 'desc')
    );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allArtifacts = snapshot.docs.map(doc => doc.data());
      // Take only the 3 most recent
      setArtifacts(allArtifacts.slice(0, 3));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching artifacts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [competencyId, learnerId]);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading artifacts...</div>;
  }

  return (
    <div className="bg-slate-100 rounded-lg border border-slate-200 shadow-inner overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-200 border-b border-slate-300">
        <h4 className="text-sm font-semibold text-slate-700">Portfolio Evidence</h4>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-slate-700 hover:bg-slate-300"
          >
            {artifacts.length === 0 ? (
              <Plus className="w-4 h-4 mr-1" />
            ) : (
              <Eye className="w-4 h-4 mr-1" />
            )}
            {artifacts.length === 0 ? 'Add Artifact' : 'View All'}
          </Button>
        )}
      </div>

      <div className="p-4">
        {artifacts.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No artifacts uploaded yet. Click "Add Artifact" to upload.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {artifacts.map(artifact => (
              <div key={artifact.id} className="flex-shrink-0">
                <ArtifactThumbnail artifact={artifact} size="md" showName={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
