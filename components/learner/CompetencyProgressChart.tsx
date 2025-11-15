'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  TimeScale,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Rating } from '@/types';

ChartJS.register(TimeScale);

interface CompetencyProgressChartProps {
  ratings: Rating[];
}

const RATER_TYPE_COLORS: Record<string, string> = {
  self: '#3b82f6',      // blue
  mentor: '#10b981',    // green
  master: '#8b5cf6',    // violet
};

export function CompetencyProgressChart({ ratings }: CompetencyProgressChartProps) {
  // Group by rater type
  const ratingsByType = new Map<string, Rating[]>();

  for (const rating of ratings) {
    if (!ratingsByType.has(rating.rater_type)) {
      ratingsByType.set(rating.rater_type, []);
    }
    ratingsByType.get(rating.rater_type)!.push(rating);
  }

  // Sort each group by date
  for (const [, ratings] of ratingsByType) {
    ratings.sort((a, b) => {
      const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
      const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
      return dateA.getTime() - dateB.getTime();
    });
  }

  // Build datasets - one line per rater type with time-based data
  const datasets = Array.from(ratingsByType.entries()).map(([raterType, ratings]) => {
    const dataPoints: Array<{ x: Date; y: number }> = [];

    for (const rating of ratings) {
      const date = rating.created_at instanceof Date ? rating.created_at : new Date(rating.created_at);
      dataPoints.push({ x: date, y: rating.score || 0 });
    }

    return {
      label: raterType.charAt(0).toUpperCase() + raterType.slice(1),
      data: dataPoints,
      borderColor: RATER_TYPE_COLORS[raterType] || '#64748b',
      backgroundColor: (RATER_TYPE_COLORS[raterType] || '#64748b') + '20',
      tension: 0.3,
      borderWidth: 2,
    };
  });

  const data = {
    datasets,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          padding: 10,
          usePointStyle: false,
          boxWidth: 12,
          boxHeight: 12,
          font: {
            size: 11,
          },
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
          font: {
            size: 10,
          },
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
          maxTicksLimit: 5,
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="h-[180px] mt-3">
      <Line data={data} options={options} />
    </div>
  );
}
