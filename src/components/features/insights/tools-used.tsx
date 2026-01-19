'use client';

import { useMemo } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { Wrench } from 'lucide-react';

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

import { ToolsUsed } from '@/src/lib/types';

export const description = 'A radar chart showing tool usage distribution';

const chartConfig = {
  tool: {
    label: 'Tool',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

export function ToolsUsedChart({ chartData }: { chartData: ToolsUsed[] }) {
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalUsage = chartData.reduce((acc, d) => acc + d.count, 0);
    const topTool = chartData.reduce(
      (max, d) => (d.count > max.count ? d : max),
      chartData[0],
    );
    const topPercentage =
      totalUsage > 0 ? (topTool.count / totalUsage) * 100 : 0;

    // Diversity: more tools used = more diverse
    const diversity =
      chartData.length >= 5
        ? 'high'
        : chartData.length >= 3
          ? 'moderate'
          : 'low';

    return {
      totalUsage,
      topTool: topTool.tool,
      topCount: topTool.count,
      topPercentage,
      toolCount: chartData.length,
      diversity,
    };
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          Tools Utilization
        </CardTitle>
        <CardDescription>
          {metrics
            ? `${metrics.toolCount} tools in use across projects`
            : 'Tool usage distribution'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    if (!metrics) return `${value} uses`;
                    const percentage = (
                      ((value as number) / metrics.totalUsage) *
                      100
                    ).toFixed(1);
                    return `${value} uses (${percentage}%)`;
                  }}
                />
              }
            />
            <PolarAngleAxis
              dataKey="tool"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                value.length > 8 ? value.slice(0, 8) + '…' : value
              }
            />
            <PolarGrid strokeDasharray="3 3" />
            <Radar
              dataKey="count"
              fill={chartConfig.tool.color}
              fillOpacity={0.5}
              stroke={chartConfig.tool.color}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="flex-col gap-1.5 text-xs pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">Most used:</span>
            <span className="font-medium capitalize">
              {metrics.topTool} ({metrics.topPercentage.toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">Diversity:</span>
            <span
              className={`font-medium px-1.5 py-0.5 rounded ${
                metrics.diversity === 'high'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : metrics.diversity === 'moderate'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              {metrics.diversity.charAt(0).toUpperCase() +
                metrics.diversity.slice(1)}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
