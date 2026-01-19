'use client';

import { useEffect, useState } from 'react';
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

  const kpis = [
    {
      label: 'Total Tasks',
      value: data.totalTasks,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      onClick: () => router.push('/'),
      tooltip: 'View all tasks',
    },
    {
      label: 'Open Tasks',
      value: data.openTasks,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      onClick: () => {
        // Filter to show open tasks (non-completed)
        onFilterChange?.({ status: 'todo' });
      },
      tooltip: 'Filter to open tasks',
    },
    {
      label: 'Avg Cycle Time',
      value: data.avgCycleDays,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      suffix: ' days',
      decimals: 1,
      tooltip: 'Average time to complete tasks',
    },
    {
      label: 'Hours Saved',
      value: data.totalHoursSaved,
      icon: Timer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      suffix: ' hrs',
      decimals: 0,
      tooltip: 'Total hours saved through automation',
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
            className={`bg-background/80 backdrop-blur-sm border-border/50 transition-all duration-200 group ${
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
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    <AnimatedCounter
                      value={kpi.value}
                      decimals={kpi.decimals}
                      suffix={kpi.suffix}
                    />
                  </p>
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
