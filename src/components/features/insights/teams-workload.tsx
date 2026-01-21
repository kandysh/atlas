'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';

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
import { TeamsWorkload } from '@/src/lib/actions/analytics';

const chartConfig = {
  savedHrs: {
    label: 'Hours Saved',
    color: 'var(--chart-1)',
  },
  processesDemised: {
    label: 'Processes Demised',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface TeamsWorkloadChartProps {
  chartData: TeamsWorkload[];
  onTeamClick?: (team: string) => void;
}

export function TeamsWorkloadChart({
  chartData,
  onTeamClick,
}: TeamsWorkloadChartProps) {
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalHoursSaved = chartData.reduce((acc, d) => acc + (d.savedHrs || 0), 0);
    const totalProcessesDemised = chartData.reduce((acc, d) => acc + (d.processesDemised || 0), 0);
    const avgHoursSaved = totalHoursSaved / chartData.length;
    const maxHoursSaved = Math.max(...chartData.map((d) => d.savedHrs || 0));

    // Identify high-impact teams (>150% of average)
    const highImpactTeams = chartData.filter((d) => (d.savedHrs || 0) > avgHoursSaved * 1.5);

    // Calculate impact balance score (lower variance = better balance)
    const variance =
      chartData.reduce((acc, d) => acc + Math.pow((d.savedHrs || 0) - avgHoursSaved, 2), 0) /
      chartData.length;
    const stdDev = Math.sqrt(variance);
    const balanceScore =
      avgHoursSaved > 0 ? Math.max(0, 100 - (stdDev / avgHoursSaved) * 100) : 100;

    return {
      totalHoursSaved,
      totalProcessesDemised,
      avgHoursSaved,
      maxHoursSaved,
      highImpactTeams,
      balanceScore,
      teamCount: chartData.length,
    };
  }, [chartData]);

  const handleBarClick = (
    _data: unknown,
    _index: number,
    event: React.MouseEvent,
  ) => {
    const target = event.target as SVGElement;
    const barIndex = target.getAttribute('data-index');
    if (barIndex !== null && onTeamClick) {
      const dataItem = chartData[parseInt(barIndex, 10)];
      if (dataItem?.team) {
        onTeamClick(dataItem.team);
      }
    }
  };

  // Color bars based on hours saved relative to average
  const getBarColor = (savedHrs: number) => {
    if (!metrics) return chartConfig.savedHrs.color;
    if (savedHrs > metrics.avgHoursSaved * 1.5) return 'var(--chart-1)';
    if (savedHrs > metrics.avgHoursSaved * 1.2) return 'var(--chart-2)';
    if (savedHrs < metrics.avgHoursSaved * 0.5) return 'var(--muted-foreground)';
    return chartConfig.savedHrs.color;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Team Workload
          </CardTitle>
          {metrics && metrics.highImpactTeams.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              High Impact
            </span>
          )}
        </div>
        <CardDescription>
          {metrics
            ? `${metrics.teamCount} teams • ${metrics.totalHoursSaved.toFixed(0)}hrs saved • ${metrics.totalProcessesDemised} processes demised`
            : 'Team impact distribution'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="team"
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
                    const team = item?.payload as TeamsWorkload;
                    if (name === 'savedHrs') {
                      if (!metrics) return `${value} hours saved`;
                      const ratio = (value as number) / metrics.avgHoursSaved;
                      const label =
                        ratio > 1.5
                          ? '🚀 High impact'
                          : ratio < 0.5
                            ? '📉 Low impact'
                            : '✓ Balanced';
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span>{value} hours saved</span>
                          {team && team.processesDemised > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {team.processesDemised} processes demised
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {label}
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
              dataKey="savedHrs"
              radius={4}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.savedHrs || 0)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="text-xs text-muted-foreground pt-0">
          <div className="flex items-center justify-between w-full">
            <span>Avg: {metrics.avgHoursSaved.toFixed(0)} hrs/team</span>
            <span
              className={`font-medium ${
                metrics.balanceScore >= 70
                  ? 'text-emerald-600'
                  : metrics.balanceScore >= 40
                    ? 'text-amber-600'
                    : 'text-red-600'
              }`}
            >
              Balance: {metrics.balanceScore.toFixed(0)}%
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
