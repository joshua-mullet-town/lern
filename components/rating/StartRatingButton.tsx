'use client';

import { useState } from 'react';
import { Rating, Competency, User } from '@/types';
import { Button } from '@/components/ui/button';
import { RatingFlow } from '@/components/rating/RatingFlow';
import { Play } from 'lucide-react';

interface StartRatingButtonProps {
  ratings: (Rating & { competency?: Competency; learner?: User })[];
}

export function StartRatingButton({ ratings }: StartRatingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Play className="w-4 h-4 mr-2" />
        Start Ratings
      </Button>
      <RatingFlow
        ratings={ratings}
        open={open}
        onClose={() => setOpen(false)}
        raterType="master"
      />
    </>
  );
}
