'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Artifact, Competency } from '@/types';
import { ArtifactConverter } from '@/lib/converters';
import { toast } from 'sonner';
import { ArtifactThumbnail } from './ArtifactThumbnail';
import { ArtifactUpload } from './ArtifactUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArtifactModalProps {
  competency: Competency;
  learnerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArtifactModal({ competency, learnerId, open, onOpenChange }: ArtifactModalProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultTab, setDefaultTab] = useState<'gallery' | 'upload'>('gallery');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Real-time listener for artifacts
    const artifactsRef = collection(db, COLLECTION_NAMES.artifacts).withConverter(ArtifactConverter);
    const q = query(
      artifactsRef,
      where('learner_id', '==', learnerId),
      where('competency_ids', 'array-contains', competency.id),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allArtifacts = snapshot.docs.map(doc => doc.data());
      setArtifacts(allArtifacts);
      setLoading(false);

      // Auto-switch to upload tab if gallery is empty
      if (allArtifacts.length === 0) {
        setDefaultTab('upload');
      } else {
        setDefaultTab('gallery');
      }
    });

    return () => unsubscribe();
  }, [competency.id, learnerId, open]);

  const handleDelete = async (artifactId: string) => {
    if (!confirm('Are you sure you want to delete this artifact?')) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, COLLECTION_NAMES.artifacts, artifactId));
      toast.success('Artifact deleted');
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast.error('Failed to delete artifact');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{competency.title} - Portfolio</DialogTitle>
        </DialogHeader>

        <Tabs value={defaultTab} onValueChange={(val) => setDefaultTab(val as 'gallery' | 'upload')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Gallery ({artifacts.length})</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4 mt-4">
            {loading ? (
              <p className="text-center text-slate-500 py-8">Loading artifacts...</p>
            ) : artifacts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-500 mb-2">No artifacts yet</p>
                <p className="text-sm text-slate-400">Upload portfolio evidence to showcase your work</p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200 shadow-inner">
                <div className="overflow-x-auto -mx-2 px-2">
                  <div className="flex gap-6 py-2" style={{ minWidth: 'max-content' }}>
                    {artifacts.map(artifact => (
                      <div key={artifact.id} className="flex-shrink-0">
                        <ArtifactThumbnail
                          artifact={artifact}
                          size="lg"
                          showDelete={true}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <ArtifactUpload
                  learnerId={learnerId}
                  competencyId={competency.id}
                  onUploadComplete={() => {
                    // Artifact list will update automatically via real-time listener
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
