'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, CompetencyType, DEFAULT_RUBRIC } from '@/types';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

// Hardcoded for POC (will come from auth later)
const EDUCATOR_ID = 'demo-educator-123';
const ORG_ID = 'demo-org-456';

export function CreateCompetencyModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'hard' as CompetencyType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAMES.competencies), {
        org_id: ORG_ID,
        created_by: EDUCATOR_ID,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        // Rubric removed - use DEFAULT_RUBRIC in code when displaying ratings
        created_at: Timestamp.now(),
      });

      console.log('✅ Competency created with ID:', docRef.id);

      // Reset form and close modal
      setFormData({ title: '', description: '', type: 'hard' });
      setOpen(false);

      // Refresh the page to show new competency
      console.log('Refreshing page...');
      router.refresh();

      // Force a hard reload after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('❌ Error creating competency:', error);
      alert('Failed to create competency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Competency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Competency</DialogTitle>
          <DialogDescription>
            Define a skill or competency that learners can be assessed on.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Python Programming"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this competency involves..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as CompetencyType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select skill type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hard">Hard Skill</SelectItem>
                <SelectItem value="soft">Soft Skill</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Competency'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
