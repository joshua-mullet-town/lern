'use client';

import { Competency, Rating, Artifact } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrustBadge } from './TrustBadge';
import { ArtifactThumbnail } from '@/components/artifact/ArtifactThumbnail';

interface CompetencyWithTrustBadgesProps {
  competency: Competency;
  ratings: Rating[];
  average: number;
  artifacts?: Artifact[];
}

export function CompetencyWithTrustBadges({
  competency,
  ratings,
  average,
  artifacts = [],
}: CompetencyWithTrustBadgesProps) {
  // Get unique rater types for trust badges
  const raterTypes = Array.from(new Set(ratings.map(r => r.rater_type)));

  // Combine ratings and artifacts into a timeline, sorted by date (oldest first for chart flow)
  type TimelineItem =
    | { type: 'rating'; data: Rating; date: Date }
    | { type: 'artifact'; data: Artifact; date: Date };

  const timeline: TimelineItem[] = [
    ...ratings.map(r => ({
      type: 'rating' as const,
      data: r,
      date: r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
    })),
    ...artifacts.map(a => ({
      type: 'artifact' as const,
      data: a,
      date: a.created_at instanceof Date ? a.created_at : new Date(a.created_at),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()); // Oldest first (so line flows correctly)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{competency.title}</CardTitle>
            {competency.description && (
              <p className="text-sm text-slate-600 mt-1">{competency.description}</p>
            )}
          </div>
          <div className="ml-4 text-right">
            <div className="text-3xl font-bold text-blue-600">{average.toFixed(1)}</div>
            <div className="text-xs text-slate-500">Average Rating</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Horizontal Scrolling Timeline */}
          <div className="max-w-full">
            <p className="text-sm font-medium text-slate-700 mb-6">Learning Journey:</p>

            {/* Horizontal scrolling container */}
            <div className="bg-slate-50 rounded-lg border-2 border-slate-200 p-4 overflow-x-auto max-w-full">
              <p className="text-xs font-semibold text-slate-700 mb-3">Running Average (0-4)</p>

              <div className="relative" style={{ width: `${timeline.length * 220}px`, minWidth: '100%' }}>
                {/* Cards above chart */}
                <div className="flex gap-4 mb-4">
                  {timeline.map((item) => (
                    <div key={item.type === 'rating' ? item.data.id : item.data.id} className="w-[200px] flex-shrink-0">
                      {/* Date */}
                      <div className="text-xs font-semibold text-slate-600 mb-2 text-center">
                        {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      {item.type === 'rating' ? (
                        /* Rating card */
                        <div>
                          <div className="rounded-lg border-2 border-blue-300 p-2 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center gap-2">
                            <TrustBadge raterType={item.data.rater_type} />
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-slate-900">{item.data.score}</span>
                              <span className="text-xs text-slate-500">/4</span>
                            </div>
                          </div>
                          {item.data.comment && (
                            <p className="text-xs text-slate-700 italic mt-2 text-center">
                              "{item.data.comment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Artifact card */
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-2 shadow-sm flex flex-col items-center gap-2">
                          <ArtifactThumbnail artifact={item.data} size="sm" showName={false} />
                          <div className="text-center">
                            <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
                              Portfolio
                            </p>
                            <p className="text-xs font-medium text-slate-900 truncate max-w-[180px]">{item.data.file_name}</p>
                            <p className="text-xs text-slate-600 uppercase">{item.data.file_type}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="relative border-b-2 border-slate-300 h-[200px]">
                  {/* Y-axis labels (0-4) */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2 -ml-8">
                    {[4, 3, 2, 1, 0].map((value) => (
                      <div key={value} className="text-xs font-medium text-slate-500">
                        {value}
                      </div>
                    ))}
                  </div>

                  {/* Horizontal grid lines */}
                  {[1, 2, 3, 4].map((value) => (
                    <div
                      key={value}
                      className="absolute left-0 right-0 h-px bg-slate-200"
                      style={{ bottom: `${(value / 4) * 100}%` }}
                    />
                  ))}

                  {/* SVG for line and dots */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    {/* Smooth path through rating points */}
                    {(() => {
                      const ratingPoints: { x: number; y: number }[] = [];

                      timeline.forEach((item, index) => {
                        const ratingsUpToNow = timeline
                          .slice(0, index + 1)
                          .filter(t => t.type === 'rating')
                          .map(t => (t.data as Rating).score!);

                        if (ratingsUpToNow.length > 0) {
                          const avg = ratingsUpToNow.reduce<number>((sum, score) => sum + (score as number), 0) / ratingsUpToNow.length;
                          const xPos = index * 220 + 100; // Center of each column
                          const yPos = 200 - (avg / 4) * 200; // Invert Y (0 at bottom)
                          ratingPoints.push({ x: xPos, y: yPos });
                        }
                      });

                      // Create smooth path
                      if (ratingPoints.length > 1) {
                        let pathD = `M ${ratingPoints[0].x} ${ratingPoints[0].y}`;

                        for (let i = 1; i < ratingPoints.length; i++) {
                          const prev = ratingPoints[i - 1];
                          const curr = ratingPoints[i];
                          const controlPointOffset = (curr.x - prev.x) * 0.5;

                          pathD += ` C ${prev.x + controlPointOffset} ${prev.y}, ${curr.x - controlPointOffset} ${curr.y}, ${curr.x} ${curr.y}`;
                        }

                        return (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                        );
                      }
                      return null;
                    })()}

                    {/* Dots and connector lines */}
                    {timeline.map((item, index) => {
                      const ratingsUpToNow = timeline
                        .slice(0, index + 1)
                        .filter(t => t.type === 'rating')
                        .map(t => (t.data as Rating).score!);

                      if (ratingsUpToNow.length === 0) return null;

                      const avg = ratingsUpToNow.reduce<number>((sum, score) => sum + (score as number), 0) / ratingsUpToNow.length;
                      const xPos = index * 220 + 100;
                      const yPos = 200 - (avg / 4) * 200;

                      return (
                        <g key={item.type === 'rating' ? item.data.id : item.data.id}>
                          {/* Dotted line to card above */}
                          <line
                            x1={xPos}
                            y1={yPos}
                            x2={xPos}
                            y2="0"
                            className="stroke-blue-400 stroke-1"
                            strokeDasharray="4,4"
                          />
                          {/* Dot */}
                          <circle
                            cx={xPos}
                            cy={yPos}
                            r="5"
                            className="fill-blue-600 stroke-white stroke-2"
                          />
                          {/* Average label below dot with background */}
                          <rect
                            x={xPos - 18}
                            y={yPos + 10}
                            width="36"
                            height="20"
                            rx="6"
                            className="fill-white stroke-blue-300 stroke-1"
                          />
                          <text
                            x={xPos}
                            y={yPos + 24}
                            textAnchor="middle"
                            className="fill-slate-700 text-xs font-semibold"
                          >
                            {avg.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
