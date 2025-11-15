'use client';

import { User, Organization } from '@/types';
import { Building2, GraduationCap, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PublicProfileHeaderProps {
  learner: User;
  organization?: Organization;
}

export function PublicProfileHeader({ learner, organization }: PublicProfileHeaderProps) {
  return (
    <Card className="border-2">
      <CardContent>
        <div className="flex items-start gap-6">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white flex-shrink-0 shadow-lg" suppressHydrationWarning>
            <UserIcon className="w-14 h-14" strokeWidth={1.5} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{learner.display_name}</h1>
            {organization && (
              <div className="flex items-center gap-2 text-slate-600">
                {organization.org_type === 'education' ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
                <span className="text-lg">{organization.name}</span>
              </div>
            )}
            <p className="text-sm text-slate-500 mt-2">
              {organization?.org_type === 'education' ? 'Student' : 'Employee'} Portfolio
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
