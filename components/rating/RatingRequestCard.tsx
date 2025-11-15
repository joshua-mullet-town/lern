import Link from 'next/link';
import { Rating, Competency, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface RatingRequestCardProps {
  rating: Rating & {
    competency?: Competency;
    learner?: User;
  };
}

export function RatingRequestCard({ rating }: RatingRequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{rating.competency?.title || 'Unknown Competency'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Learner:</p>
            <p className="font-medium">{rating.learner?.display_name || 'Unknown Learner'}</p>
          </div>
          <Link href={`/master/rate/${rating.id}`}>
            <Button className="w-full">
              Rate Competency
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
