'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Rating, Competency, RatingScore, User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface RatingFlowProps {
  ratings: (Rating & { competency?: Competency; learner?: User })[];
  open: boolean;
  onClose: () => void;
  raterType: 'self' | 'master';
}

export function RatingFlow({ ratings, open, onClose, raterType }: RatingFlowProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialRatings, setInitialRatings] = useState(ratings); // Capture initial ratings to prevent live updates from breaking flow
  const [formData, setFormData] = useState({
    score: '' as '' | RatingScore,
    comment: '',
  });

  // Capture initial ratings ONLY when modal first opens - ignore live updates during flow
  React.useEffect(() => {
    if (open) {
      setInitialRatings(ratings);
      setCurrentIndex(0);
      setFormData({ score: '', comment: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only depend on 'open', NOT 'ratings' - prevents live updates from changing count mid-flow

  const currentRating = initialRatings[currentIndex];
  const progress = (currentIndex / initialRatings.length) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the rating
      const ratingRef = doc(db, COLLECTION_NAMES.ratings, currentRating.id);
      const updateData: Record<string, unknown> = {
        score: Number(formData.score),
        status: 'completed',
        updated_at: Timestamp.now(),
      };

      // Only add comment if it has a value
      if (formData.comment && formData.comment.trim()) {
        updateData.comment = formData.comment;
      }

      await updateDoc(ratingRef, updateData);

      toast.success(raterType === 'self' ? 'Self-assessment saved' : 'Rating saved');

      // Reset form
      setFormData({ score: '', comment: '' });

      // Move to next rating or close
      const nextIndex = currentIndex + 1;
      if (nextIndex < initialRatings.length) {
        setCurrentIndex(nextIndex);
      } else {
        // All done!
        toast.success(raterType === 'self' ? 'All self-assessments completed!' : 'All ratings completed!');
        setCurrentIndex(0);
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving self-assessment:', error);
      toast.error('Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setFormData({ score: '', comment: '' });
    const nextIndex = currentIndex + 1;
    if (nextIndex < initialRatings.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(0);
      onClose();
      router.refresh();
    }
  };

  if (!currentRating) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setCurrentIndex(0);
        setFormData({ score: '', comment: '' });
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {raterType === 'self' ? 'Self-Assessment' : 'Rating Request'} ({currentIndex + 1} of {initialRatings.length})
          </DialogTitle>
          <DialogDescription>
            {raterType === 'self' ? 'Rate yourself on this competency' : 'Provide your rating for this learner'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Progress value={progress} className="h-2" />

          {raterType === 'master' && currentRating.learner && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Rating: <span className="font-semibold">{currentRating.learner.display_name}</span>
              </p>
            </div>
          )}

          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{currentRating.competency?.title}</h3>
            <p className="text-sm text-slate-600">{currentRating.competency?.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Your Rating</Label>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { value: 0, label: 'No evidence', bgDefault: 'bg-red-100', bgSelected: 'bg-red-200' },
                  { value: 1, label: 'Beginning', bgDefault: 'bg-orange-100', bgSelected: 'bg-orange-200' },
                  { value: 2, label: 'Developing', bgDefault: 'bg-yellow-100', bgSelected: 'bg-yellow-200' },
                  { value: 3, label: 'Proficient', bgDefault: 'bg-lime-100', bgSelected: 'bg-lime-200' },
                  { value: 4, label: 'Expert', bgDefault: 'bg-green-100', bgSelected: 'bg-green-200' },
                ].map(({ value, label, bgDefault, bgSelected }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, score: value as RatingScore })}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center
                      ${
                        formData.score === value
                          ? `border-blue-500 shadow-md ${bgSelected}`
                          : `border-slate-300 hover:border-slate-400 ${bgDefault}`
                      }
                    `}
                  >
                    <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
                    <div className="text-xs text-slate-600 h-8 flex items-center text-center">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Add notes about your rating..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleSkip} disabled={loading}>
                Skip
              </Button>
              <Button type="submit" disabled={loading || !formData.score}>
                {loading ? 'Saving...' : currentIndex < initialRatings.length - 1 ? 'Next' : 'Complete'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
