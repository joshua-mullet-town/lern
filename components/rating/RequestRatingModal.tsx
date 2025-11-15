'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, User } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

// Hardcoded for POC
const EDUCATOR_ID = 'demo-educator-123';
const ORG_ID = 'demo-org-456';

interface RequestRatingModalProps {
  learnerId: string;
}

export function RequestRatingModal({ learnerId }: RequestRatingModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [employers, setEmployers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    competency_id: '',
    request_self: false,
    request_employer: false,
    employer_id: '',
  });

  // Fetch competencies and employers when modal opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        // Fetch competencies
        const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(
          CompetencyConverter
        );
        const compsSnap = await getDocs(competenciesRef);
        setCompetencies(compsSnap.docs.map((doc) => doc.data()));

        // Fetch employers (users with 'master' role)
        const usersRef = collection(db, COLLECTION_NAMES.users).withConverter(UserConverter);
        const employersQuery = query(
          usersRef,
          where('org_id', '==', ORG_ID),
          where('roles', 'array-contains', 'master')
        );
        const employersSnap = await getDocs(employersQuery);
        setEmployers(employersSnap.docs.map((doc) => doc.data()));
      };
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create rating requests based on checkboxes
      const promises = [];

      if (formData.request_self) {
        // Create pending self-assessment rating
        promises.push(
          addDoc(collection(db, COLLECTION_NAMES.ratings), {
            learner_id: learnerId,
            competency_id: formData.competency_id,
            rater_id: learnerId, // Learner rates themselves
            rater_type: 'self',
            status: 'pending',
            created_at: Timestamp.now(),
          })
        );
      }

      if (formData.request_employer && formData.employer_id) {
        // Create pending employer rating
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
      let message = 'Rating request';
      if (formData.request_self && formData.request_employer) {
        message += 's sent to learner and employer';
      } else if (formData.request_self) {
        message += ' sent to learner';
      } else if (formData.request_employer) {
        message += ' sent to employer';
      }
      toast.success(message);

      // Reset form and close modal
      setFormData({
        competency_id: '',
        request_self: false,
        request_employer: false,
        employer_id: '',
      });
      setOpen(false);

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error creating rating request:', error);
      toast.error('Failed to create rating request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardList className="w-4 h-4 mr-2" />
          Request Rating
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Competency Rating</DialogTitle>
          <DialogDescription>
            Request a self-assessment from the learner and/or a rating from an employer.
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

          <div className="space-y-3 border-t pt-4">
            <Label>Request Ratings From:</Label>

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
                  id="request_employer"
                  checked={formData.request_employer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, request_employer: checked === true })
                  }
                />
                <label
                  htmlFor="request_employer"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Request rating from employer
                </label>
              </div>

              {formData.request_employer && (
                <Select
                  value={formData.employer_id}
                  onValueChange={(value) => setFormData({ ...formData, employer_id: value })}
                  required={formData.request_employer}
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

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.competency_id ||
                (!formData.request_self && !formData.request_employer) ||
                (formData.request_employer && !formData.employer_id)
              }
            >
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
