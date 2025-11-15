import { Competency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompetencyCardProps {
  competency: Competency;
}

export function CompetencyCard({ competency }: CompetencyCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{competency.title}</CardTitle>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              competency.type === 'hard'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {competency.type}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-2">
          {competency.description}
        </p>
      </CardContent>
    </Card>
  );
}
