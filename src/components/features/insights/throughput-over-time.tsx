'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

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
  type ChartConfig,
} from '@/src/components/ui/chart';
import { ThroughPutOverTimeData } from '@/src/lib/types';

export const description =
  'An interactive bar chart showing completed tasks and hours saved over time.';

const chartConfig = {
  throughput: {
    label: 'Throughput',
  },
  hours: {
    label: 'Hours Saved',
    color: 'var(--chart-1)',
  },
  count: {
    label: 'Completed',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartLineInteractive({
  chartData,
}: {
  chartData: ThroughPutOverTimeData[];
}) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('count');

  const total = React.useMemo(
    () => ({
      hours: chartData.reduce((acc, curr) => acc + curr.hours, 0),
      count: chartData.reduce((acc, curr) => acc + curr.count, 0),
    }),
    [chartData],
  );

  const trend = useMemo(() => {
    if (chartData.length < 4) return null;

    const recent = chartData.slice(-3);
    const older = chartData.slice(-6, -3);

    const key = activeChart as 'hours' | 'count';
    const recentSum = recent.reduce((acc, d) => acc + d[key], 0);
    const olderSum =
      older.length > 0 ? older.reduce((acc, d) => acc + d[key], 0) : recentSum;

    const change = recentSum - olderSum;
    const percentChange = olderSum > 0 ? (change / olderSum) * 100 : 0;

    return {
      direction:
        percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'stable',
      percentChange,
    };
  }, [chartData, activeChart]);

  const avgPerMonth = total.count / Math.max(chartData.length, 1);

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Throughput
          </CardTitle>
          <CardDescription className="text-xs">
            {avgPerMonth.toFixed(1)} tasks/month avg
          </CardDescription>
        </div>
        <div className="flex">
          {(['count', 'hours'] as const).map((key) => {
            const chart = key as keyof typeof chartConfig;
            const isActive = activeChart === chart;
            return (
              <button
                key={chart}
                data-active={isActive}
                className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-colors ${
                  isActive ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-40"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    });
                  }}
                  formatter={(value, name) => {
                    if (name === 'hours') return `${value} hours saved`;
                    return `${value} tasks completed`;
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {trend && trend.direction !== 'stable' && (
        <CardFooter className="text-xs text-muted-foreground border-t px-6 py-3">
          <div
            className={`flex items-center gap-1 ${
              trend.direction === 'up' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {trend.direction === 'up' ? '+' : ''}
              {trend.percentChange.toFixed(0)}% vs previous period
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
