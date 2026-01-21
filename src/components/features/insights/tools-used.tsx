'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
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

export const description = 'A bar chart showing tool usage and business impact';

const chartConfig = {
  savedHrs: {
    label: 'Hours Saved',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function ToolsUsedChart({ chartData }: { chartData: ToolsUsed[] }) {
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalHoursSaved = chartData.reduce(
      (acc, d) => acc + (d.savedHrs || 0),
      0,
    );
    const topTool = chartData.reduce(
      (max, d) => ((d.savedHrs || 0) > (max.savedHrs || 0) ? d : max),
      chartData[0],
    );
    const topPercentage =
      totalHoursSaved > 0
        ? ((topTool.savedHrs || 0) / totalHoursSaved) * 100
        : 0;

    // Diversity: more tools used = more diverse
    const diversity =
      chartData.length >= 5
        ? 'high'
        : chartData.length >= 3
          ? 'moderate'
          : 'low';

    return {
      totalHoursSaved,
      topTool: topTool.tool,
      topHoursSaved: topTool.savedHrs || 0,
      topPercentage,
      toolCount: chartData.length,
      diversity,
    };
  }, [chartData]);

  // Limit to top 10 tools for better visualization
  const topTools = useMemo(() => {
    return chartData.slice(0, 10);
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          Tools Used
        </CardTitle>
        <CardDescription>
          {metrics
            ? `${metrics.toolCount} tools used - ${metrics.totalHoursSaved.toFixed(0)}hrs saved`
            : 'Tool usage and business impact'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart
            data={topTools}
            layout="vertical"
            margin={{ left: 60, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="tool"
              width={50}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                value.length > 10 ? value.slice(0, 10) + '…' : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const tool = item?.payload as ToolsUsed;
                    if (!metrics) return `${value} hours saved`;
                    const percentage = (
                      ((value as number) / metrics.totalHoursSaved) *
                      100
                    ).toFixed(1);
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium capitalize">
                          {tool.tool}
                        </span>
                        <span>{value} hours saved ({percentage}%)</span>
                        <span className="text-xs text-muted-foreground">
                          {tool.count} tasks
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="savedHrs" fill={chartConfig.savedHrs.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="flex-col gap-1.5 text-xs pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">Highest impact:</span>
            <span className="font-medium capitalize">
              {metrics.topTool} ({metrics.topHoursSaved.toFixed(0)}hrs)
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
