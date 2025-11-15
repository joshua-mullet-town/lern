import Link from 'next/link';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

interface LearnerCardProps {
  learner: User;
}

export function LearnerCard({ learner }: LearnerCardProps) {
  return (
    <Link href={`/learners/${learner.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{learner.display_name}</CardTitle>
              <p className="text-sm text-slate-500">{learner.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-slate-400">
            Created {learner.created_at.toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
