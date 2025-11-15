'use client';

import { User } from '@/types';
import { UserCircle } from 'lucide-react';

interface LearnerProfileHeaderProps {
  learner: User;
}

export function LearnerProfileHeader({ learner }: LearnerProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
          <UserCircle className="w-12 h-12 text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{learner.display_name}</h1>
          <p className="text-slate-600">{learner.email}</p>
          <p className="text-sm text-slate-400 mt-1">
            Joined {learner.created_at.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
