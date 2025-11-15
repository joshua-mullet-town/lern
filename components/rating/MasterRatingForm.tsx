'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Rating, Competency, User, RatingScore } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MasterRatingFormProps {
  rating: Rating;
  competency: Competency;
  learner: User;
}

export function MasterRatingForm({ rating, competency, learner }: MasterRatingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    score: '' as '' | RatingScore,
    comment: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ratingRef = doc(db, COLLECTION_NAMES.ratings, rating.id);
      await updateDoc(ratingRef, {
        score: Number(formData.score),
        comment: formData.comment || undefined,
        status: 'completed',
        updated_at: Timestamp.now(),
      });

      toast.success('Rating submitted successfully');
      router.push('/master');
      router.refresh();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Competency</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Learner Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Learner:</p>
            <p className="font-semibold text-lg">{learner.display_name}</p>
          </div>

          {/* Competency Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{competency.title}</h3>
            <p className="text-sm text-slate-600">{competency.description}</p>
          </div>

          {/* Rating Scale */}
          <div className="space-y-2">
            <Label htmlFor="score">Your Rating (0-4) *</Label>
            <Select
              value={formData.score === '' ? '' : String(formData.score)}
              onValueChange={(value) =>
                setFormData({ ...formData, score: Number(value) as RatingScore })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - No evidence</SelectItem>
                <SelectItem value="1">1 - Beginning</SelectItem>
                <SelectItem value="2">2 - Developing</SelectItem>
                <SelectItem value="3">3 - Proficient</SelectItem>
                <SelectItem value="4">4 - Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Provide context for your rating..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/master')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.score}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
