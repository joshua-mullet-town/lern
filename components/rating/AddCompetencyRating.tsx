'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, RatingScore, User } from '@/types';
import { CompetencyConverter, UserConverter } from '@/lib/converters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Hardcoded for POC
const EDUCATOR_ID = 'demo-educator-123';
const ORG_ID = 'demo-org-456';

interface AddCompetencyRatingProps {
  learnerId: string;
  preselectedCompetencyId?: string;
  children?: React.ReactNode;
}

export function AddCompetencyRating({ learnerId, preselectedCompetencyId, children }: AddCompetencyRatingProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [employers, setEmployers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    competency_id: preselectedCompetencyId || '',
    score: '' as '' | RatingScore,
    comment: '',
    request_self: false,
    request_employer: false,
    employer_id: '',
  });

  // Fetch competencies and employers when modal opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        // Fetch competencies
        if (competencies.length === 0) {
          const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(
            CompetencyConverter
          );
          const snapshot = await getDocs(competenciesRef);
          setCompetencies(snapshot.docs.map((doc) => doc.data()));
        }

        // Fetch employers
        if (employers.length === 0) {
          const usersRef = collection(db, COLLECTION_NAMES.users).withConverter(UserConverter);
          const employersQuery = query(
            usersRef,
            where('org_id', '==', ORG_ID),
            where('roles', 'array-contains', 'master')
          );
          const employersSnap = await getDocs(employersQuery);
          setEmployers(employersSnap.docs.map((doc) => doc.data()));
        }
      };
      fetchData();
    }
  }, [open, competencies.length, employers.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = [];

      // Create the completed mentor rating
      const mentorRating: Record<string, unknown> = {
        learner_id: learnerId,
        competency_id: formData.competency_id,
        rater_id: EDUCATOR_ID,
        rater_type: 'mentor' as const,
        score: Number(formData.score) as RatingScore,
        status: 'completed' as const,
        created_at: Timestamp.now(),
      };
      if (formData.comment.trim()) {
        mentorRating.comment = formData.comment;
      }
      promises.push(addDoc(collection(db, COLLECTION_NAMES.ratings), mentorRating));

      // If requested, create pending self-assessment rating
      if (formData.request_self) {
        promises.push(
          addDoc(collection(db, COLLECTION_NAMES.ratings), {
            learner_id: learnerId,
            competency_id: formData.competency_id,
            rater_id: learnerId,
            rater_type: 'self',
            status: 'pending',
            created_at: Timestamp.now(),
          })
        );
      }

      // If requested, create pending employer rating
      if (formData.request_employer && formData.employer_id) {
        promises.push(
          addDoc(collection(db, COLLECTION_NAMES.ratings), {
            learner_id: learnerId,
            competency_id: formData.competency_id,
            rater_id: formData.employer_id,
            rater_type: 'master',
            status: 'pending',
            created_at: Timestamp.now(),
          })
        );
      }

      await Promise.all(promises);

      // Show success toast
      let message = 'Competency rating added';
      if (formData.request_self && formData.request_employer) {
        message += ' and rating requests sent to learner and employer';
      } else if (formData.request_self) {
        message += ' and rating request sent to learner';
      } else if (formData.request_employer) {
        message += ' and rating request sent to employer';
      }
      toast.success(message);

      // Reset form and close modal
      setFormData({
        competency_id: preselectedCompetencyId || '',
        score: '',
        comment: '',
        request_self: false,
        request_employer: false,
        employer_id: '',
      });
      setOpen(false);

      // Refresh the page to show new rating
      router.refresh();
    } catch (error) {
      console.error('Error adding competency rating:', error);
      toast.error('Failed to add rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Competency Rating
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Competency Rating</DialogTitle>
          <DialogDescription>
            Assign a competency to this learner with an initial mentor rating.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="competency">Competency</Label>
            <Select
              value={formData.competency_id}
              onValueChange={(value) => setFormData({ ...formData, competency_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a competency" />
              </SelectTrigger>
              <SelectContent>
                {competencies.map((competency) => (
                  <SelectItem key={competency.id} value={competency.id}>
                    {competency.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Initial Rating (0-4)</Label>
            <Select
              value={formData.score.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, score: Number(value) as RatingScore })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
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

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add notes about this rating..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label>Also Request Ratings From:</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="request_self"
                checked={formData.request_self}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, request_self: checked === true })
                }
              />
              <label
                htmlFor="request_self"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Request self-assessment from learner
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="request_employer_add"
                  checked={formData.request_employer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, request_employer: checked === true })
                  }
                />
                <label
                  htmlFor="request_employer_add"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Request rating from employer
                </label>
              </div>

              {formData.request_employer && (
                <Select
                  value={formData.employer_id}
                  onValueChange={(value) => setFormData({ ...formData, employer_id: value })}
                >
                  <SelectTrigger className="ml-6">
                    <SelectValue placeholder="Select employer" />
                  </SelectTrigger>
                  <SelectContent>
                    {employers.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">
                        No employers in organization
                      </div>
                    ) : (
                      employers.map((employer) => (
                        <SelectItem key={employer.id} value={employer.id}>
                          {employer.display_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (formData.request_employer && !formData.employer_id)
              }
            >
              {loading ? 'Adding...' : 'Add Rating'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
