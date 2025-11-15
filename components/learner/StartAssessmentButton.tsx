'use client';

import { useState } from 'react';
import { Rating, Competency } from '@/types';
import { Button } from '@/components/ui/button';
import { RatingFlow } from '@/components/rating/RatingFlow';
import { Play } from 'lucide-react';

interface StartAssessmentButtonProps {
  ratings: (Rating & { competency?: Competency })[];
}

export function StartAssessmentButton({ ratings }: StartAssessmentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Play className="w-4 h-4 mr-2" />
        Start Self-Assessment
      </Button>
      <RatingFlow
        ratings={ratings}
        open={open}
        onClose={() => setOpen(false)}
        raterType="self"
      />
    </>
  );
}
