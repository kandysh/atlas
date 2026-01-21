'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import {
  AlertCircle,
  TrendingUp,
  Timer,
  Clock,
  Zap,
  AlertTriangle,
  Target,
  Award,
} from 'lucide-react';
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

    const urgentStuck = urgentAging
      ? urgentAging.bucket7to14 + urgentAging.bucket14plus
      : 0;
    const highStuck = highAging
      ? highAging.bucket7to14 + highAging.bucket14plus
      : 0;

    if (urgentStuck > 0) {
      result.push({
        id: 'urgent-stuck',
        type: 'critical',
        icon: AlertTriangle,
        message: `${urgentStuck} urgent automation${urgentStuck !== 1 ? 's' : ''} aging >7 days - potential value at risk`,
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
        message: `${highStuck} high-impact automation${highStuck !== 1 ? 's' : ''} aging >7 days`,
        action: 'Review',
        filter: { priority: 'high' },
        priority: 2,
      });
    }

    // Processes demised milestone
    const processesDemised = data.kpiSummary.totalProcessesDemised;
    if (processesDemised >= 50) {
      result.push({
        id: 'processes-milestone',
        type: 'success',
        icon: Target,
        message: `${processesDemised} processes automated - eliminating manual work at scale!`,
        action: 'View Portfolio',
        priority: 3,
      });
    }

    // High-impact team recognition
    const topTeam = data.teamsWorkload[0];
    if (topTeam && topTeam.savedHrs >= 100) {
      result.push({
        id: 'high-impact-team',
        type: 'success',
        icon: Award,
        message: `${topTeam.team} team delivered ${topTeam.savedHrs.toFixed(0)}h saved - leading business impact!`,
        action: 'View Team',
        filter: { team: topTeam.team },
        priority: 4,
      });
    }

    // Top impact owner - highlight excellence
    const topOwner = data.ownerProductivity[0];
    if (topOwner && data.ownerProductivity.length > 1) {
      const avgSavedHrs =
        data.ownerProductivity.reduce((acc, p) => acc + p.totalHoursSaved, 0) /
        data.ownerProductivity.length;
      const impactRatio = topOwner.totalHoursSaved / avgSavedHrs;

      if (impactRatio >= 1.5 && topOwner.totalHoursSaved >= 50) {
        result.push({
          id: 'top-impact-owner',
          type: 'success',
          icon: TrendingUp,
          message: `${topOwner.owner} delivered ${topOwner.totalHoursSaved.toFixed(0)}h saved - ${impactRatio.toFixed(1)}x above average impact`,
          action: 'View Work',
          filter: { assignee: topOwner.owner },
          priority: 5,
        });
      }
    }

    // Open tasks warning - only show if ratio is concerning
    const openTasksRatio =
      data.kpiSummary.openTasks / Math.max(data.kpiSummary.totalTasks, 1);
    if (openTasksRatio > 0.7) {
      result.push({
        id: 'backlog-warning',
        type: 'warning',
        icon: Clock,
        message: `${Math.round(openTasksRatio * 100)}% of automations still in progress - value realization delayed`,
        action: 'Triage',
        filter: { status: 'todo' },
        priority: 6,
      });
    }

    // ROI insight - high efficiency
    const topROIAsset = data.assetClassROI[0];
    if (topROIAsset && topROIAsset.roiScore > 10) {
      result.push({
        id: 'high-roi',
        type: 'success',
        icon: Zap,
        message: `${topROIAsset.assetClass} automations showing exceptional ROI (${topROIAsset.roiScore.toFixed(1)} hrs/day)`,
        action: 'Explore',
        filter: { assetClass: topROIAsset.assetClass },
        priority: 7,
      });
    }

    // Hours saved celebration
    const hoursSaved = data.kpiSummary.totalHoursSaved;
    if (hoursSaved >= 500) {
      result.push({
        id: 'savings-milestone',
        type: 'success',
        icon: Timer,
        message: `${hoursSaved.toLocaleString()}h business value delivered - equivalent to ${Math.round(hoursSaved / 2080)} full-time employees per year!`,
        action: 'Celebrate',
        priority: 8,
      });
    } else if (hoursSaved >= 100) {
      result.push({
        id: 'savings-milestone',
        type: 'success',
        icon: Timer,
        message: `${hoursSaved.toLocaleString()}h saved - that's ${Math.round(hoursSaved / 8)} work days of business value!`,
        action: 'View Impact',
        priority: 8,
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
