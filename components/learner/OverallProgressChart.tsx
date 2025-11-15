'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Rating, Competency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OverallProgressChartProps {
  ratings: Rating[];
  competencies: Competency[];
}

// Generate vibrant colors for competency lines
const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function OverallProgressChart({ ratings, competencies }: OverallProgressChartProps) {
  // Group ratings by competency and sort by date
  const competencyMap = new Map(competencies.map(c => [c.id, c]));
  const ratingsByCompetency = new Map<string, Rating[]>();

  for (const rating of ratings) {
    if (rating.status !== 'completed' || rating.score === undefined) continue;

    const competencyId = rating.competency_id;
    if (!ratingsByCompetency.has(competencyId)) {
      ratingsByCompetency.set(competencyId, []);
    }
    ratingsByCompetency.get(competencyId)!.push(rating);
  }

  // Sort ratings by date for each competency
  for (const [, ratings] of ratingsByCompetency) {
    ratings.sort((a, b) => {
      const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
      const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
      return dateA.getTime() - dateB.getTime();
    });
  }

  // Build datasets - one line per competency with time-based data
  const alignedDatasets = Array.from(ratingsByCompetency.entries()).map(([competencyId, ratings], index) => {
    const competency = competencyMap.get(competencyId);
    if (!competency) return null;

    const dataPoints: Array<{ x: Date; y: number }> = [];
    let runningSum = 0;
    let count = 0;

    for (const rating of ratings) {
      const date = rating.created_at instanceof Date ? rating.created_at : new Date(rating.created_at);

      runningSum += rating.score || 0;
      count++;
      const average = runningSum / count;

      dataPoints.push({ x: date, y: average });
    }

    return {
      label: competency.title,
      data: dataPoints,
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '20',
      tension: 0.3,
      borderWidth: 2,
    };
  }).filter(Boolean);

  const data = {
    datasets: alignedDatasets as Array<{
      label: string;
      data: Array<{ x: Date; y: number }>;
      borderColor: string;
      backgroundColor: string;
      tension: number;
      borderWidth: number;
    }>,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: false,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y?.toFixed(1) ?? 'N/A'}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 4.5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            // Only show whole numbers 0-4
            const numValue = typeof value === 'number' ? value : Number(value);
            if (numValue >= 0 && numValue <= 4 && numValue % 1 === 0) {
              return numValue;
            }
            return null;
          },
        },
        title: {
          display: true,
          text: 'Rating',
        },
      },
      x: {
        type: 'time' as const,
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d',
          },
        },
        ticks: {
          maxTicksLimit: 8,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  if (alignedDatasets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
