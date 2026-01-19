'use client';

import { useMemo } from 'react';
import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/src/components/ui/chart';
import { HoursEfficiency } from '@/src/lib/actions/analytics';

const chartConfig = {
  currentHrs: {
    label: 'Estimated',
    color: 'var(--chart-1)',
  },
  workedHrs: {
    label: 'Actual',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface HoursEfficiencyChartProps {
  chartData: HoursEfficiency[];
}

export function HoursEfficiencyChart({ chartData }: HoursEfficiencyChartProps) {
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const avgEfficiency = chartData.reduce((acc, curr) => acc + curr.efficiency, 0) / chartData.length;
    const totalEstimated = chartData.reduce((acc, curr) => acc + curr.currentHrs, 0);
    const totalWorked = chartData.reduce((acc, curr) => acc + curr.workedHrs, 0);
    
    // Trend: compare last 3 months to previous 3
    const recent = chartData.slice(-3);
    const older = chartData.slice(-6, -3);
    const recentAvg = recent.length > 0 ? recent.reduce((acc, d) => acc + d.efficiency, 0) / recent.length : 0;
    const olderAvg = older.length > 0 ? older.reduce((acc, d) => acc + d.efficiency, 0) / older.length : recentAvg;
    
    const trendDirection = recentAvg < olderAvg ? 'improving' : recentAvg > olderAvg ? 'declining' : 'stable';
    const trendChange = Math.abs(recentAvg - olderAvg);
    
    // Health: <90% is great, 90-110% is good, >110% needs attention
    const health = avgEfficiency <= 90 ? 'excellent' : avgEfficiency <= 110 ? 'good' : 'over';
    
    return {
      avgEfficiency,
      totalEstimated,
      totalWorked,
      variance: totalWorked - totalEstimated,
      trendDirection,
      trendChange,
      health,
    };
  }, [chartData]);

  const TrendIcon = metrics?.trendDirection === 'improving' ? TrendingDown : 
                   metrics?.trendDirection === 'declining' ? TrendingUp : Target;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Estimation Accuracy
          </CardTitle>
          {metrics && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              metrics.health === 'excellent' ? 'bg-emerald-500/10 text-emerald-600' :
              metrics.health === 'good' ? 'bg-blue-500/10 text-blue-600' :
              'bg-amber-500/10 text-amber-600'
            }`}>
              {metrics.avgEfficiency.toFixed(0)}% of estimates
            </span>
          )}
        </div>
        <CardDescription>
          {metrics?.health === 'excellent' 
            ? 'Consistently under budget - great estimation!' 
            : metrics?.health === 'good'
            ? 'On track with estimates'
            : 'Actual hours exceeding estimates'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value + '-01').toLocaleDateString('en-US', {
                  month: 'short',
                })
              }
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  }
                  formatter={(value, name, item) => {
                    const hours = Number(value).toFixed(1);
                    const entry = item?.payload as HoursEfficiency;
                    if (name === 'workedHrs' && entry) {
                      const diff = entry.workedHrs - entry.currentHrs;
                      const diffLabel = diff > 0 ? `+${diff.toFixed(1)}h over` : diff < 0 ? `${Math.abs(diff).toFixed(1)}h under` : 'on target';
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span>{hours}h actual</span>
                          <span className={`text-xs ${diff > 0 ? 'text-amber-600' : diff < 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {diffLabel}
                          </span>
                        </div>
                      );
                    }
                    return `${hours}h`;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="currentHrs"
              type="monotone"
              fill={chartConfig.currentHrs.color}
              fillOpacity={0.1}
              stroke={chartConfig.currentHrs.color}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Area
              dataKey="workedHrs"
              type="monotone"
              fill={chartConfig.workedHrs.color}
              fillOpacity={0.2}
              stroke={chartConfig.workedHrs.color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="text-xs text-muted-foreground pt-0">
          <div className="flex items-center justify-between w-full">
            <span>
              {metrics.variance >= 0 ? '+' : ''}{metrics.variance.toFixed(0)}h vs estimates
            </span>
            <span className={`inline-flex items-center gap-1 ${
              metrics.trendDirection === 'improving' ? 'text-emerald-600' :
              metrics.trendDirection === 'declining' ? 'text-amber-600' : 'text-muted-foreground'
            }`}>
              <TrendIcon className="h-3 w-3" />
              {metrics.trendDirection === 'improving' ? 'Improving' :
               metrics.trendDirection === 'declining' ? 'Watch closely' : 'Stable'}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
