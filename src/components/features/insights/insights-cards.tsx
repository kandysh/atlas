'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { AlertCircle, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { AnalyticsData, AnalyticsFilters } from '@/src/lib/actions/analytics';

// Default hourly rate for savings calculation
// TODO: Make this configurable per workspace/organization
const DEFAULT_HOURLY_RATE = 50;

interface InsightsCardsProps {
  data: AnalyticsData;
  onFilterChange: (filters: AnalyticsFilters) => void;
  hourlyRate?: number;
}

interface Insight {
  id: string;
  icon: typeof AlertCircle;
  iconColor: string;
  bgColor: string;
  message: string;
  action: string;
  filter?: AnalyticsFilters;
}

export function InsightsCards({
  data,
  onFilterChange,
  hourlyRate = DEFAULT_HOURLY_RATE,
}: InsightsCardsProps) {
  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    // Find tasks stuck in testing for too long
    const testingAging = data.priorityAging.find(
      (p) =>
        p.priority.toLowerCase() === 'high' ||
        p.priority.toLowerCase() === 'urgent',
    );
    const stuckInTesting = testingAging
      ? testingAging.bucket7to14 + testingAging.bucket14plus
      : 0;

    if (stuckInTesting > 0) {
      result.push({
        id: 'stuck-testing',
        icon: AlertCircle,
        iconColor: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        message: `${stuckInTesting} high priority tasks stuck >7 days`,
        action: 'Show',
        filter: { priority: 'high' },
      });
    }

    // Find top performer
    const topPerformer = data.ownerProductivity[0];
    if (topPerformer && data.ownerProductivity.length > 1) {
      const avgCompleted =
        data.ownerProductivity.reduce((acc, p) => acc + p.completedTasks, 0) /
        data.ownerProductivity.length;
      const performanceRatio = topPerformer.completedTasks / avgCompleted;

      if (performanceRatio >= 1.5) {
        result.push({
          id: 'top-performer',
          icon: TrendingUp,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          message: `${topPerformer.owner} completes ${performanceRatio.toFixed(1)}x faster than avg`,
          action: 'Filter',
          filter: { assignee: topPerformer.owner },
        });
      }
    }

    // Calculate savings value using configurable hourly rate
    const savedValue = data.kpiSummary.totalHoursSaved * hourlyRate;
    if (savedValue > 0) {
      result.push({
        id: 'savings',
        icon: DollarSign,
        iconColor: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        message: `$${savedValue.toLocaleString()} saved via automation`,
        action: 'Details',
      });
    }

    // Open tasks warning
    const openTasksRatio =
      data.kpiSummary.openTasks / Math.max(data.kpiSummary.totalTasks, 1);
    if (openTasksRatio > 0.7) {
      result.push({
        id: 'backlog-warning',
        icon: Clock,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-500/10',
        message: `${Math.round(openTasksRatio * 100)}% of tasks are still open`,
        action: 'View',
        filter: { status: 'todo' },
      });
    }

    return result;
  }, [data, hourlyRate]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50">
      <CardContent className="py-3 px-4">
        <div className="flex flex-wrap gap-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className="flex items-center gap-3 text-sm">
                <div className={`p-1.5 rounded-lg ${insight.bgColor}`}>
                  <Icon className={`h-4 w-4 ${insight.iconColor}`} />
                </div>
                <span className="text-muted-foreground">{insight.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    insight.filter && onFilterChange(insight.filter)
                  }
                >
                  [{insight.action}]
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
