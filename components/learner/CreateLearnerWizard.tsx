'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, RatingScore } from '@/types';
import { SuggestedRating } from '@/lib/ai/suggestRatings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Upload, Loader2 } from 'lucide-react';

// Hardcoded for POC
const ORG_ID = 'demo-org-456';
const EDUCATOR_ID = 'demo-educator-123';

type Step = 'info' | 'upload' | 'review';

interface LearnerInfo {
  display_name: string;
  email: string;
}

interface RatingReview extends SuggestedRating {
  competency?: Competency;
}

export function CreateLearnerWizard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [learnerInfo, setLearnerInfo] = useState<LearnerInfo>({
    display_name: '',
    email: '',
  });

  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [ratings, setRatings] = useState<RatingReview[]>([]);
  const [allCompetencies, setAllCompetencies] = useState<Competency[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTranscriptFile(file);
    setAnalyzing(true);

    try {
      // Upload and analyze transcript
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze transcript');

      const data = await response.json();

      // Fetch all competencies to display in review (only if not already fetched)
      if (allCompetencies.length === 0) {
        const competenciesRes = await fetch(`/api/competencies`);
        const comps: Competency[] = await competenciesRes.json();
        setAllCompetencies(comps);
      }

      // Map suggestions to competencies
      const ratingReviews: RatingReview[] = data.suggestions.map((s: SuggestedRating) => ({
        ...s,
        competency: allCompetencies.find(c => c.id === s.competency_id),
      }));

      setRatings(ratingReviews);
      setStep('review');
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      alert('Failed to analyze transcript. Please try again.');
      setTranscriptFile(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClearTranscript = () => {
    setTranscriptFile(null);
    setRatings([]);
  };

  const handleSkipUpload = () => {
    setStep('review');
  };

  const handleAddRating = () => {
    // Add new rating at the TOP
    setRatings([
      {
        competency_id: '',
        score: 0,
        comment: '',
      },
      ...ratings,
    ]);

    // Scroll to top of the ratings container after a brief delay
    setTimeout(() => {
      const container = document.querySelector('[data-ratings-container]');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleUpdateRating = (index: number, field: keyof RatingReview, value: any) => {
    const updated = [...ratings];
    updated[index] = { ...updated[index], [field]: value };

    // If updating competency_id, find and attach the competency object
    if (field === 'competency_id') {
      updated[index].competency = allCompetencies.find(c => c.id === value);
    }

    setRatings(updated);
  };

  const handleRemoveRating = (index: number) => {
    setRatings(ratings.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create learner
      const learnerRef = await addDoc(collection(db, COLLECTION_NAMES.users), {
        org_id: ORG_ID,
        display_name: learnerInfo.display_name,
        email: learnerInfo.email,
        roles: ['learner'],
        created_at: Timestamp.now(),
      });

      // Create batch for ratings
      const batch = writeBatch(db);

      ratings.forEach((rating) => {
        if (!rating.competency_id || rating.score === undefined) return;

        const ratingRef = doc(collection(db, COLLECTION_NAMES.ratings));
        batch.set(ratingRef, {
          learner_id: learnerRef.id,
          competency_id: rating.competency_id,
          rater_id: EDUCATOR_ID,
          rater_type: 'mentor',
          score: rating.score,
          status: 'completed',
          comment: rating.comment || undefined,
          created_at: Timestamp.now(),
        });
      });

      await batch.commit();

      // Reset and close
      setLearnerInfo({ display_name: '', email: '' });
      setTranscriptFile(null);
      setRatings([]);
      setStep('info');
      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error('Error creating learner:', error);
      alert('Failed to create learner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Name</Label>
              <Input
                id="display_name"
                placeholder="e.g., John Doe"
                value={learnerInfo.display_name}
                onChange={(e) =>
                  setLearnerInfo({ ...learnerInfo, display_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={learnerInfo.email}
                onChange={(e) => setLearnerInfo({ ...learnerInfo, email: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setStep('upload')}
                disabled={!learnerInfo.display_name || !learnerInfo.email}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transcript">Upload Transcript (Optional)</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-slate-400 transition-colors">
                {analyzing ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-slate-600">Analyzing transcript...</p>
                  </div>
                ) : transcriptFile ? (
                  <div className="text-center space-y-3">
                    <Upload className="w-8 h-8 mx-auto text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{transcriptFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Transcript uploaded</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleClearTranscript}
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-2">
                      Upload a transcript to auto-suggest competency ratings
                    </p>
                    <Input
                      id="transcript"
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileChange}
                      disabled={analyzing}
                      className="max-w-xs"
                    />
                    <a
                      href="/sample-transcript.txt"
                      download
                      className="text-xs text-blue-600 hover:underline mt-2"
                    >
                      Download sample transcript
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep('info')}>
                Back
              </Button>
              <Button type="button" variant="secondary" onClick={handleSkipUpload}>
                Skip Upload
              </Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Review Competency Ratings</h3>
              <Button type="button" size="sm" variant="outline" onClick={handleAddRating}>
                <Plus className="w-4 h-4 mr-1" />
                Add Rating
              </Button>
            </div>

            {ratings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No ratings yet. Click "Add Rating" to manually add competencies.
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2" data-ratings-container>
                {ratings.map((rating, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 space-y-3 ${
                      index === 0 && !rating.competency_id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <Label>Competency</Label>
                      <Select
                        value={rating.competency_id}
                        onValueChange={(value) =>
                          handleUpdateRating(index, 'competency_id', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select competency" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCompetencies.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id}>
                              {comp.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rating (0-4)</Label>
                      <Select
                        value={rating.score?.toString()}
                        onValueChange={(value) =>
                          handleUpdateRating(index, 'score', Number(value) as RatingScore)
                        }
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
                      <Label>Comment</Label>
                      <Textarea
                        placeholder="Optional notes about this rating..."
                        value={rating.comment}
                        onChange={(e) => handleUpdateRating(index, 'comment', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveRating(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Learner'}
              </Button>
            </div>
          </div>
        );
    }
  };

  const handleClose = () => {
    // Only allow closing via explicit close button, not outside click
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing by clicking outside
      if (!newOpen) return;
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Learner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'info' && 'Create New Learner'}
            {step === 'upload' && 'Upload Transcript (Optional)'}
            {step === 'review' && 'Review Competency Ratings'}
          </DialogTitle>
          <DialogDescription>
            {step === 'info' && 'Enter the learner\'s basic information.'}
            {step === 'upload' && 'Upload a transcript to auto-suggest ratings, or skip to add manually.'}
            {step === 'review' && 'Review and adjust the suggested ratings before creating the learner.'}
          </DialogDescription>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
