'use client';

import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
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

export const description = 'A radar chart showing tool usage and business impact';

const chartConfig = {
  hours: {
    label: 'Hours Saved',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function ToolsUsedRadar({ chartData }: { chartData: ToolsUsed[] }) {
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
      toolCount: chartData.length,
      diversity,
    };
  }, [chartData]);

  // Limit to top 8 tools for better radar visualization
  const radarData = useMemo(() => {
    return chartData.slice(0, 8).map(tool => ({
      tool: tool.tool.length > 12 ? tool.tool.slice(0, 12) + '...' : tool.tool,
      fullTool: tool.tool, // Keep full name for tooltip
      hours: tool.savedHrs || 0,
      count: tool.count,
    }));
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
        <ChartContainer config={chartConfig} className="h-[320px]">
          <RadarChart data={radarData}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="tool"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, item) => {
                    const data = item?.payload;
                    const percentage = metrics
                      ? (((value as number) / metrics.totalHoursSaved) * 100).toFixed(1)
                      : 0;
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium capitalize">
                          {data.fullTool}
                        </span>
                        <span>{value} hours ({percentage}%)</span>
                        <span className="text-xs text-muted-foreground">
                          {data.count} projects
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Radar
              dataKey="hours"
              stroke={chartConfig.hours.color}
              fill={chartConfig.hours.color}
              fillOpacity={0.6}
            />
          </RadarChart>
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
