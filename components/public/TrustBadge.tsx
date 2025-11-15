import { RaterType } from '@/types';
import { User, GraduationCap, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrustBadgeProps {
  raterType: RaterType;
}

const badgeConfig: Record<RaterType, { icon: typeof User; label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  self: {
    icon: User,
    label: 'Self-Assessed',
    variant: 'secondary',
  },
  mentor: {
    icon: GraduationCap,
    label: 'Mentor Verified',
    variant: 'default',
  },
  master: {
    icon: Briefcase,
    label: 'Industry Verified',
    variant: 'default',
  },
};

export function TrustBadge({ raterType }: TrustBadgeProps) {
  const config = badgeConfig[raterType];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 px-3 py-1">
      <Icon className="w-3 h-3" />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
}
