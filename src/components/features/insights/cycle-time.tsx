'use client';

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Minus, Zap } from 'lucide-react';

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
import { RollingCycle } from '@/src/lib/actions/analytics';

export const description = 'A multiple line chart showing cycle time trends';

const chartConfig = {
  cycle: {
    label: 'Cycle Time',
  },
  rollingAvg: {
    label: 'Rolling Avg',
    color: 'var(--chart-1)',
  },
  avgCycleDays: {
    label: 'Monthly Avg',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function CycleTimeChart({
  chartData,
}: {
  chartData: RollingCycle[];
}) {
  const metrics = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const recent = chartData.slice(-3);
    const older = chartData.slice(-6, -3);
    
    const recentAvg = recent.length > 0 ? recent.reduce((acc, d) => acc + d.avgCycleDays, 0) / recent.length : 0;
    const olderAvg = older.length > 0 ? older.reduce((acc, d) => acc + d.avgCycleDays, 0) / older.length : recentAvg;
    
    const change = recentAvg - olderAvg;
    const percentChange = olderAvg > 0 ? (change / olderAvg) * 100 : 0;
    
    // For cycle time, DOWN is good
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (percentChange < -5) trend = 'improving';
    else if (percentChange > 5) trend = 'worsening';
    
    const currentAvg = chartData[chartData.length - 1]?.avgCycleDays || 0;
    const overallAvg = chartData.reduce((acc, d) => acc + d.avgCycleDays, 0) / chartData.length;
    
    // Health based on cycle time
    const health = currentAvg <= 5 ? 'fast' : currentAvg <= 14 ? 'normal' : 'slow';
    
    return { trend, percentChange, currentAvg, overallAvg, health };
  }, [chartData]);

  const TrendIcon = metrics?.trend === 'improving' ? TrendingDown : 
                   metrics?.trend === 'worsening' ? TrendingUp : Minus;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            Cycle Time
          </CardTitle>
          {metrics && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              metrics.trend === 'improving' ? 'bg-emerald-500/10 text-emerald-600' :
              metrics.trend === 'worsening' ? 'bg-red-500/10 text-red-600' :
              'bg-muted text-muted-foreground'
            }`}>
              <TrendIcon className="h-3 w-3" />
              {metrics.trend === 'improving' ? 'Faster' : metrics.trend === 'worsening' ? 'Slower' : 'Stable'}
            </span>
          )}
        </div>
        <CardDescription>
          {metrics 
            ? `${metrics.currentAvg.toFixed(1)} days avg • ${metrics.health === 'fast' ? 'Fast delivery!' : metrics.health === 'normal' ? 'Healthy pace' : 'Room for improvement'}`
            : 'Average time to complete tasks'}
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
            {metrics && (
              <ReferenceLine 
                y={metrics.overallAvg} 
                stroke="var(--muted-foreground)" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
            )}
            <ChartTooltip 
              cursor={false} 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => {
                    const label = name === 'rollingAvg' ? 'Rolling avg' : 'Monthly avg';
                    return `${Number(value).toFixed(1)} days (${label})`;
                  }}
                />
              } 
            />
            <Line
              dataKey="rollingAvg"
              type="monotone"
              stroke={chartConfig.rollingAvg.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="avgCycleDays"
              type="monotone"
              stroke={chartConfig.avgCycleDays.color}
              strokeWidth={2}
              strokeOpacity={0.5}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartConfig.rollingAvg.color }} />
              Rolling
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartConfig.avgCycleDays.color }} />
              Monthly
            </span>
          </div>
          {metrics && Math.abs(metrics.percentChange) > 5 && (
            <span className={metrics.trend === 'improving' ? 'text-emerald-600' : 'text-red-600'}>
              {metrics.percentChange > 0 ? '+' : ''}{metrics.percentChange.toFixed(0)}%
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
