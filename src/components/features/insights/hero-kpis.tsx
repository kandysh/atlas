'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/src/components/ui/card';
import { KpiSummary } from '@/src/lib/actions/analytics';
import { CheckCircle2, Clock, Target, Timer } from 'lucide-react';
import { AnalyticsFilters } from '@/src/lib/actions/analytics';

interface HeroKpisProps {
  data: KpiSummary;
  isLoading?: boolean;
  onFilterChange?: (filters: AnalyticsFilters) => void;
}

function AnimatedCounter({
  value,
  duration = 500,
  decimals = 0,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function HeroKpis({ data, isLoading, onFilterChange }: HeroKpisProps) {
  const router = useRouter();

  // Compute derived insights
  const insights = useMemo(() => {
    const completionRate = data.totalTasks > 0 
      ? ((data.totalTasks - data.openTasks) / data.totalTasks) * 100 
      : 0;
    
    // Cycle time health: < 5 days is good, > 14 is concerning
    const cycleHealth = data.avgCycleDays <= 5 ? 'good' : data.avgCycleDays <= 14 ? 'moderate' : 'slow';
    
    // Open tasks ratio health
    const openRatio = data.totalTasks > 0 ? data.openTasks / data.totalTasks : 0;
    const backlogHealth = openRatio < 0.3 ? 'healthy' : openRatio < 0.6 ? 'growing' : 'critical';
    
    return { completionRate, cycleHealth, backlogHealth, openRatio };
  }, [data]);

  const kpis = [
    {
      label: 'Total Tasks',
      value: data.totalTasks,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-l-primary',
      onClick: () => router.push('/'),
      tooltip: 'View all tasks',
      subtitle: `${insights.completionRate.toFixed(0)}% complete`,
      subtitleColor: insights.completionRate >= 70 ? 'text-emerald-600' : insights.completionRate >= 40 ? 'text-amber-600' : 'text-muted-foreground',
    },
    {
      label: 'Open Tasks',
      value: data.openTasks,
      icon: Clock,
      color: insights.backlogHealth === 'healthy' ? 'text-emerald-500' : insights.backlogHealth === 'growing' ? 'text-amber-500' : 'text-red-500',
      bgColor: insights.backlogHealth === 'healthy' ? 'bg-emerald-500/10' : insights.backlogHealth === 'growing' ? 'bg-amber-500/10' : 'bg-red-500/10',
      borderColor: insights.backlogHealth === 'healthy' ? 'border-l-emerald-500' : insights.backlogHealth === 'growing' ? 'border-l-amber-500' : 'border-l-red-500',
      onClick: () => {
        onFilterChange?.({ status: 'todo' });
      },
      tooltip: 'Filter to open tasks',
      subtitle: insights.backlogHealth === 'healthy' ? 'Backlog healthy' : insights.backlogHealth === 'growing' ? 'Backlog growing' : 'High backlog',
      subtitleColor: insights.backlogHealth === 'healthy' ? 'text-emerald-600' : insights.backlogHealth === 'growing' ? 'text-amber-600' : 'text-red-600',
    },
    {
      label: 'Avg Cycle Time',
      value: data.avgCycleDays,
      icon: CheckCircle2,
      color: insights.cycleHealth === 'good' ? 'text-emerald-500' : insights.cycleHealth === 'moderate' ? 'text-amber-500' : 'text-red-500',
      bgColor: insights.cycleHealth === 'good' ? 'bg-emerald-500/10' : insights.cycleHealth === 'moderate' ? 'bg-amber-500/10' : 'bg-red-500/10',
      borderColor: insights.cycleHealth === 'good' ? 'border-l-emerald-500' : insights.cycleHealth === 'moderate' ? 'border-l-amber-500' : 'border-l-red-500',
      suffix: ' days',
      decimals: 1,
      tooltip: 'Average time to complete tasks',
      subtitle: insights.cycleHealth === 'good' ? 'Fast delivery' : insights.cycleHealth === 'moderate' ? 'Moderate pace' : 'Needs improvement',
      subtitleColor: insights.cycleHealth === 'good' ? 'text-emerald-600' : insights.cycleHealth === 'moderate' ? 'text-amber-600' : 'text-red-600',
    },
    {
      label: 'Hours Saved',
      value: data.totalHoursSaved,
      icon: Timer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-l-purple-500',
      suffix: ' hrs',
      decimals: 0,
      tooltip: 'Total hours saved through automation',
      subtitle: data.totalHoursSaved > 0 ? `≈ ${(data.totalHoursSaved / 8).toFixed(0)} work days` : 'Track savings',
      subtitleColor: data.totalHoursSaved > 0 ? 'text-purple-600' : 'text-muted-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="bg-background/80 backdrop-blur-sm border-border/50"
          >
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isClickable = !!kpi.onClick;
        
        return (
          <Card
            key={kpi.label}
            className={`bg-background/80 backdrop-blur-sm border-border/50 border-l-4 ${kpi.borderColor} transition-all duration-200 group ${
              isClickable 
                ? 'hover:shadow-lg hover:border-primary/30 cursor-pointer' 
                : ''
            }`}
            onClick={kpi.onClick}
            title={kpi.tooltip}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    <AnimatedCounter
                      value={kpi.value}
                      decimals={kpi.decimals}
                      suffix={kpi.suffix}
                    />
                  </p>
                  {kpi.subtitle && (
                    <p className={`text-xs ${kpi.subtitleColor}`}>
                      {kpi.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`p-2 rounded-lg ${kpi.bgColor} ${isClickable ? 'group-hover:scale-110' : ''} transition-transform`}
                >
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
