'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

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
import { PriorityAging } from '@/src/lib/actions/analytics';

const chartConfig = {
  bucket0to3: {
    label: '0-3 days',
    color: 'var(--success)',
  },
  bucket3to7: {
    label: '3-7 days',
    color: 'var(--chart-3)',
  },
  bucket7to14: {
    label: '7-14 days',
    color: 'var(--warning)',
  },
  bucket14plus: {
    label: '14+ days',
    color: 'var(--error)',
  },
} satisfies ChartConfig;

interface PriorityAgingChartProps {
  chartData: PriorityAging[];
  onPriorityClick?: (priority: string) => void;
}

export function PriorityAgingChart({
  chartData,
  onPriorityClick,
}: PriorityAgingChartProps) {
  const metrics = useMemo(() => {
    const totalAging = chartData.reduce(
      (acc, d) => acc + d.bucket7to14 + d.bucket14plus,
      0,
    );
    const criticalAging = chartData
      .filter(
        (d) =>
          d.priority.toLowerCase() === 'urgent' ||
          d.priority.toLowerCase() === 'high',
      )
      .reduce((acc, d) => acc + d.bucket7to14 + d.bucket14plus, 0);
    const totalTasks = chartData.reduce(
      (acc, d) =>
        acc + d.bucket0to3 + d.bucket3to7 + d.bucket7to14 + d.bucket14plus,
      0,
    );
    const freshTasks = chartData.reduce((acc, d) => acc + d.bucket0to3, 0);
    const freshRate = totalTasks > 0 ? (freshTasks / totalTasks) * 100 : 0;

    // Health: good if <10% aging, warning if 10-25%, critical if >25%
    const agingRate = totalTasks > 0 ? (totalAging / totalTasks) * 100 : 0;
    const health =
      agingRate < 10 ? 'good' : agingRate < 25 ? 'warning' : 'critical';

    return {
      totalAging,
      criticalAging,
      totalTasks,
      freshRate,
      agingRate,
      health,
    };
  }, [chartData]);

  const handleBarClick = (
    _data: unknown,
    _index: number,
    event: React.MouseEvent,
  ) => {
    const target = event.target as SVGElement;
    const barIndex = target.getAttribute('data-index');
    if (barIndex !== null && onPriorityClick) {
      const dataItem = chartData[parseInt(barIndex, 10)];
      if (dataItem?.priority) {
        onPriorityClick(dataItem.priority.toLowerCase());
      }
    }
  };

  const HealthIcon = metrics.health === 'good' ? CheckCircle2 : AlertTriangle;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Priority Aging</CardTitle>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              metrics.health === 'good'
                ? 'bg-emerald-500/10 text-emerald-600'
                : metrics.health === 'warning'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-red-500/10 text-red-600'
            }`}
          >
            <HealthIcon className="h-3 w-3" />
            {metrics.agingRate.toFixed(0)}% aging
          </span>
        </div>
        <CardDescription>
          {metrics.criticalAging > 0
            ? `⚠️ ${metrics.criticalAging} high/urgent tasks aging >7 days`
            : `${metrics.freshRate.toFixed(0)}% of tasks are fresh (<3 days)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="priority"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label =
                      chartConfig[name as keyof typeof chartConfig]?.label ||
                      name;
                    return `${value} tasks (${label})`;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="bucket0to3"
              stackId="a"
              fill={chartConfig.bucket0to3.color}
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar
              dataKey="bucket3to7"
              stackId="a"
              fill={chartConfig.bucket3to7.color}
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar
              dataKey="bucket7to14"
              stackId="a"
              fill={chartConfig.bucket7to14.color}
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar
              dataKey="bucket14plus"
              stackId="a"
              fill={chartConfig.bucket14plus.color}
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            Fresh: {chartData.reduce((acc, d) => acc + d.bucket0to3, 0)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--error)]" />
            Stale: {metrics.totalAging}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
