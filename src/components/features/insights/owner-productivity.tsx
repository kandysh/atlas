'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Trophy, TrendingUp } from 'lucide-react';

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
import { OwnerProductivity } from '@/src/lib/actions/analytics';

const chartConfig = {
  completedTasks: {
    label: 'Completed',
    color: 'var(--chart-1)',
  },
  avgCycleDays: {
    label: 'Avg Cycle (days)',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface OwnerProductivityChartProps {
  chartData: OwnerProductivity[];
  onOwnerClick?: (owner: string) => void;
}

export function OwnerProductivityChart({
  chartData,
  onOwnerClick,
}: OwnerProductivityChartProps) {
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const totalCompleted = chartData.reduce((acc, d) => acc + d.completedTasks, 0);
    const avgCompleted = totalCompleted / chartData.length;
    const topPerformer = chartData[0];
    const totalHoursSaved = chartData.reduce((acc, d) => acc + d.totalHoursSaved, 0);
    
    return {
      topPerformer: topPerformer?.owner || 'N/A',
      topCount: topPerformer?.completedTasks || 0,
      avgCompleted,
      totalHoursSaved,
      teamSize: chartData.length,
    };
  }, [chartData]);

  const handleBarClick = (
    _data: unknown,
    _index: number,
    event: React.MouseEvent,
  ) => {
    const target = event.target as SVGElement;
    const barIndex = target.getAttribute('data-index');
    if (barIndex !== null && onOwnerClick) {
      const dataItem = chartData[parseInt(barIndex, 10)];
      if (dataItem?.owner) {
        onOwnerClick(dataItem.owner);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Top Performers
          </CardTitle>
          {metrics && metrics.topCount > metrics.avgCompleted * 1.3 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              Standout
            </span>
          )}
        </div>
        <CardDescription>
          {metrics ? `${metrics.teamSize} contributors • ${metrics.totalHoursSaved.toFixed(0)}hrs saved total` : 'Loading...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="owner"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              tickFormatter={(value) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    if (name === 'avgCycleDays') {
                      return `${Number(value).toFixed(1)} days`;
                    }
                    const owner = item?.payload as OwnerProductivity;
                    if (owner) {
                      return (
                        <div className="flex flex-col gap-1">
                          <span>{value} tasks completed</span>
                          <span className="text-xs text-muted-foreground">
                            {owner.totalHoursSaved.toFixed(1)}hrs saved
                          </span>
                        </div>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar
              dataKey="completedTasks"
              fill={chartConfig.completedTasks.color}
              radius={4}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {metrics && metrics.topPerformer !== 'N/A' && (
        <CardFooter className="text-xs text-muted-foreground pt-0">
          🏆 {metrics.topPerformer} leads with {metrics.topCount} completions
        </CardFooter>
      )}
    </Card>
  );
}
