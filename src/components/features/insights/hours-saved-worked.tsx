'use client';

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Timer } from 'lucide-react';

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
import { MonthlyHoursPoint } from '@/src/lib/actions/analytics';

export const description =
  'A multiple line chart showing hours worked and saved';

const chartConfig = {
  worked: {
    label: 'Worked',
    color: 'var(--chart-1)',
  },
  saved: {
    label: 'Saved',
    color: 'var(--success)',
  },
  net: {
    label: 'Net Savings',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export default function HoursSavedWorkedChart({
  chartData,
}: {
  chartData: MonthlyHoursPoint[];
}) {
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalWorked = chartData.reduce((acc, d) => acc + d.worked, 0);
    const totalSaved = chartData.reduce((acc, d) => acc + d.saved, 0);
    const totalNet = totalSaved - totalWorked;

    // Trend: compare recent 3 months net vs previous 3
    const recent = chartData.slice(-3);
    const older = chartData.slice(-6, -3);

    const recentNet = recent.reduce((acc, d) => acc + d.net, 0);
    const olderNet =
      older.length > 0 ? older.reduce((acc, d) => acc + d.net, 0) : recentNet;

    const trend =
      recentNet > olderNet
        ? 'improving'
        : recentNet < olderNet
          ? 'declining'
          : 'stable';
    const roi = totalWorked > 0 ? (totalSaved / totalWorked) * 100 : 0;

    return {
      totalWorked,
      totalSaved,
      totalNet,
      trend,
      roi,
    };
  }, [chartData]);

  const TrendIcon =
    metrics?.trend === 'improving'
      ? TrendingUp
      : metrics?.trend === 'declining'
        ? TrendingDown
        : Minus;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            Hours Analysis
          </CardTitle>
          {metrics && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                metrics.roi >= 100
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : metrics.roi >= 50
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              {metrics.roi.toFixed(0)}% ROI
            </span>
          )}
        </div>
        <CardDescription>
          {metrics
            ? `${metrics.totalSaved.toFixed(0)}h saved vs ${metrics.totalWorked.toFixed(0)}h worked`
            : 'Cumulative hours worked and saved over time'}
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
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                })
              }
            />
            <ReferenceLine
              y={0}
              stroke="var(--muted-foreground)"
              strokeDasharray="5 5"
              strokeOpacity={0.3}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  }
                  formatter={(value, name) => {
                    const hours = Number(value).toFixed(1);
                    const label =
                      name === 'worked'
                        ? 'Worked'
                        : name === 'saved'
                          ? 'Saved'
                          : 'Net';
                    return `${hours}h ${label.toLowerCase()}`;
                  }}
                />
              }
            />
            <Line
              dataKey="worked"
              type="monotone"
              stroke={chartConfig.worked.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="saved"
              type="monotone"
              stroke={chartConfig.saved.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="net"
              type="monotone"
              stroke={chartConfig.net.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="text-xs text-muted-foreground pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: chartConfig.saved.color }}
                />
                Saved
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: chartConfig.worked.color }}
                />
                Worked
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: chartConfig.net.color }}
                />
                Net
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 ${
                metrics.trend === 'improving'
                  ? 'text-emerald-600'
                  : metrics.trend === 'declining'
                    ? 'text-amber-600'
                    : ''
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              {metrics.trend === 'improving'
                ? 'Savings growing'
                : metrics.trend === 'declining'
                  ? 'Watch trend'
                  : ''}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
