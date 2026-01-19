'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { AlertCircle, TrendingUp, Timer, Clock, Zap, AlertTriangle } from 'lucide-react';
import { AnalyticsData, AnalyticsFilters } from '@/src/lib/actions/analytics';

interface InsightsCardsProps {
  data: AnalyticsData;
  onFilterChange: (filters: AnalyticsFilters) => void;
}

interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  icon: typeof AlertCircle;
  message: string;
  action: string;
  filter?: AnalyticsFilters;
  priority: number; // Lower = more important
}

export function InsightsCards({ data, onFilterChange }: InsightsCardsProps) {
  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    // Critical: Tasks stuck in testing for too long
    const urgentAging = data.priorityAging.find(
      (p) => p.priority.toLowerCase() === 'urgent',
    );
    const highAging = data.priorityAging.find(
      (p) => p.priority.toLowerCase() === 'high',
    );
    
    const urgentStuck = urgentAging ? urgentAging.bucket7to14 + urgentAging.bucket14plus : 0;
    const highStuck = highAging ? highAging.bucket7to14 + highAging.bucket14plus : 0;

    if (urgentStuck > 0) {
      result.push({
        id: 'urgent-stuck',
        type: 'critical',
        icon: AlertTriangle,
        message: `${urgentStuck} urgent task${urgentStuck !== 1 ? 's' : ''} aging >7 days`,
        action: 'Review Now',
        filter: { priority: 'urgent' },
        priority: 1,
      });
    }

    if (highStuck > 0 && urgentStuck === 0) {
      result.push({
        id: 'high-stuck',
        type: 'warning',
        icon: AlertCircle,
        message: `${highStuck} high priority task${highStuck !== 1 ? 's' : ''} aging >7 days`,
        action: 'Review',
        filter: { priority: 'high' },
        priority: 2,
      });
    }

    // Open tasks warning - only show if ratio is concerning
    const openTasksRatio =
      data.kpiSummary.openTasks / Math.max(data.kpiSummary.totalTasks, 1);
    if (openTasksRatio > 0.7) {
      result.push({
        id: 'backlog-warning',
        type: 'warning',
        icon: Clock,
        message: `${Math.round(openTasksRatio * 100)}% of tasks still open - backlog may be growing`,
        action: 'Triage',
        filter: { status: 'todo' },
        priority: 3,
      });
    }

    // Top performer - highlight excellence
    const topPerformer = data.ownerProductivity[0];
    if (topPerformer && data.ownerProductivity.length > 1) {
      const avgCompleted =
        data.ownerProductivity.reduce((acc, p) => acc + p.completedTasks, 0) /
        data.ownerProductivity.length;
      const performanceRatio = topPerformer.completedTasks / avgCompleted;

      if (performanceRatio >= 1.5 && topPerformer.completedTasks >= 5) {
        result.push({
          id: 'top-performer',
          type: 'success',
          icon: TrendingUp,
          message: `${topPerformer.owner} is ${performanceRatio.toFixed(1)}x above average in completions`,
          action: 'View Work',
          filter: { assignee: topPerformer.owner },
          priority: 5,
        });
      }
    }

    // Hours efficiency insight
    if (data.hoursEfficiency.length > 0) {
      const recentEfficiency = data.hoursEfficiency[data.hoursEfficiency.length - 1];
      if (recentEfficiency && recentEfficiency.efficiency > 120) {
        result.push({
          id: 'over-budget',
          type: 'warning',
          icon: Timer,
          message: `Recent work ${recentEfficiency.efficiency.toFixed(0)}% of estimates - consider refining estimates`,
          action: 'Details',
          priority: 4,
        });
      } else if (recentEfficiency && recentEfficiency.efficiency < 80 && recentEfficiency.efficiency > 0) {
        result.push({
          id: 'under-budget',
          type: 'success',
          icon: Zap,
          message: `Team delivering at ${recentEfficiency.efficiency.toFixed(0)}% of estimates - great efficiency!`,
          action: 'Details',
          priority: 6,
        });
      }
    }

    // Hours saved celebration
    const hoursSaved = data.kpiSummary.totalHoursSaved;
    if (hoursSaved >= 100) {
      result.push({
        id: 'savings-milestone',
        type: 'success',
        icon: Timer,
        message: `${hoursSaved.toLocaleString()} hours saved - that's ${Math.round(hoursSaved / 8)} work days!`,
        action: 'Celebrate',
        priority: 7,
      });
    }

    // Sort by priority
    return result.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [data]);

  if (insights.length === 0) {
    return null;
  }

  const typeStyles = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-l-red-500',
      iconColor: 'text-red-500',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-l-amber-500',
      iconColor: 'text-amber-500',
      buttonVariant: 'outline' as const,
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-l-emerald-500',
      iconColor: 'text-emerald-500',
      buttonVariant: 'outline' as const,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-l-blue-500',
      iconColor: 'text-blue-500',
      buttonVariant: 'outline' as const,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {insights.map((insight) => {
        const Icon = insight.icon;
        const styles = typeStyles[insight.type];
        return (
          <Card
            key={insight.id}
            className={`${styles.bg} border-l-4 ${styles.border} transition-all hover:shadow-md`}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg bg-background/50`}>
                  <Icon className={`h-4 w-4 ${styles.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {insight.message}
                  </p>
                  {insight.filter && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-xs"
                      onClick={() => onFilterChange(insight.filter!)}
                    >
                      {insight.action} →
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
