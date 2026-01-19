'use client';

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

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
import { RemainingWorkTrend } from '@/src/lib/actions/analytics';

export const description =
  'A line chart showing pending work trend with insights';

const chartConfig = {
  remaining: {
    label: 'Remaining',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function CumulativeFlowChart({
  chartData,
}: {
  chartData: RemainingWorkTrend[];
}) {
  const trend = useMemo(() => {
    if (chartData.length < 2)
      return { direction: 'stable' as const, change: 0, percentage: 0 };

    const recent = chartData.slice(-3);
    const older = chartData.slice(-6, -3);

    const recentAvg =
      recent.length > 0
        ? recent.reduce((acc, d) => acc + d.remaining, 0) / recent.length
        : 0;
    const olderAvg =
      older.length > 0
        ? older.reduce((acc, d) => acc + d.remaining, 0) / older.length
        : recentAvg;

    const change = recentAvg - olderAvg;
    const percentage = olderAvg > 0 ? (change / olderAvg) * 100 : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (percentage > 5) direction = 'up';
    else if (percentage < -5) direction = 'down';

    return { direction, change, percentage };
  }, [chartData]);

  const currentRemaining =
    chartData.length > 0 ? chartData[chartData.length - 1].remaining : 0;
  const avgRemaining =
    chartData.length > 0
      ? chartData.reduce((acc, d) => acc + d.remaining, 0) / chartData.length
      : 0;

  const TrendIcon =
    trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
        ? TrendingDown
        : Minus;
  const trendColor =
    trend.direction === 'up'
      ? 'text-red-500'
      : trend.direction === 'down'
        ? 'text-emerald-500'
        : 'text-muted-foreground';
  const trendBg =
    trend.direction === 'up'
      ? 'bg-red-500/10'
      : trend.direction === 'down'
        ? 'bg-emerald-500/10'
        : 'bg-muted/50';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Backlog Trend</CardTitle>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendBg} ${trendColor}`}
          >
            <TrendIcon className="h-3 w-3" />
            {trend.direction === 'up'
              ? 'Growing'
              : trend.direction === 'down'
                ? 'Shrinking'
                : 'Stable'}
          </span>
        </div>
        <CardDescription>
          {currentRemaining} tasks pending •{' '}
          {trend.direction === 'down'
            ? 'Good progress!'
            : trend.direction === 'up'
              ? 'Backlog growing'
              : 'Holding steady'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            {avgRemaining > 0 && (
              <ReferenceLine
                y={avgRemaining}
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value} tasks remaining`}
                />
              }
            />
            <Line
              dataKey="remaining"
              type="monotone"
              stroke={
                trend.direction === 'up'
                  ? 'var(--error)'
                  : trend.direction === 'down'
                    ? 'var(--success)'
                    : chartConfig.remaining.color
              }
              strokeWidth={2}
              dot={{
                fill: chartConfig.remaining.color,
                r: 3,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {trend.percentage !== 0 && (
          <span>
            {Math.abs(trend.percentage).toFixed(0)}%{' '}
            {trend.direction === 'up' ? 'increase' : 'decrease'} vs previous
            period
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
