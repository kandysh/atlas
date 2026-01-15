"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Clock, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { KPIMetrics } from "@/src/lib/actions/analytics";

interface HeroKPIsProps {
  kpis: KPIMetrics;
  isLoading?: boolean;
}

export function HeroKPIs({ kpis, isLoading }: HeroKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Tasks"
        value={kpis.totalTasks}
        icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        description="All tasks in workspace"
        isLoading={isLoading}
      />
      <KPICard
        title="Open Tasks"
        value={kpis.openTasks}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        description="Tasks in progress"
        trend={
          kpis.totalTasks > 0
            ? Math.round((kpis.openTasks / kpis.totalTasks) * 100)
            : 0
        }
        isLoading={isLoading}
      />
      <KPICard
        title="Avg Cycle Time"
        value={kpis.avgCycleTime}
        suffix="d"
        decimals={1}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Average completion time"
        isLoading={isLoading}
      />
      <KPICard
        title="Hours Saved"
        value={kpis.hoursSaved}
        suffix="h"
        decimals={0}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        description="Total efficiency gains"
        isLoading={isLoading}
      />
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  trend?: number;
  suffix?: string;
  decimals?: number;
  isLoading?: boolean;
}

function KPICard({
  title,
  value,
  icon,
  description,
  trend,
  suffix = "",
  decimals = 0,
  isLoading,
}: KPICardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (isLoading) return;

    const duration = 300; // ms
    const steps = 20;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  const formatDisplayValue = () => {
    if (isLoading) return "-";
    if (decimals > 0) return animatedValue.toFixed(decimals);
    return Math.round(animatedValue).toLocaleString();
  };

  const displayValue = formatDisplayValue();

  return (
    <Card className="relative overflow-hidden bg-background/80 backdrop-blur transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">
            {displayValue}
            {!isLoading && suffix && (
              <span className="text-lg text-muted-foreground ml-1">
                {suffix}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend !== undefined && trend > 0 && !isLoading && (
              <span className="text-xs text-muted-foreground">
                • {trend}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
