'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Users, AlertTriangle } from 'lucide-react';

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
  count: {
    label: 'Tasks',
    color: 'var(--chart-3)',
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
    
    const totalTasks = chartData.reduce((acc, d) => acc + d.count, 0);
    const avgLoad = totalTasks / chartData.length;
    const maxLoad = Math.max(...chartData.map(d => d.count));
    const minLoad = Math.min(...chartData.map(d => d.count));
    
    // Identify overloaded teams (>150% of average)
    const overloadedTeams = chartData.filter(d => d.count > avgLoad * 1.5);
    
    // Calculate load balance score (lower variance = better balance)
    const variance = chartData.reduce((acc, d) => acc + Math.pow(d.count - avgLoad, 2), 0) / chartData.length;
    const stdDev = Math.sqrt(variance);
    const balanceScore = avgLoad > 0 ? Math.max(0, 100 - (stdDev / avgLoad) * 100) : 100;
    
    return {
      totalTasks,
      avgLoad,
      maxLoad,
      minLoad,
      overloadedTeams,
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

  // Color bars based on load relative to average
  const getBarColor = (count: number) => {
    if (!metrics) return chartConfig.count.color;
    if (count > metrics.avgLoad * 1.5) return 'var(--error)';
    if (count > metrics.avgLoad * 1.2) return 'var(--warning)';
    if (count < metrics.avgLoad * 0.5) return 'var(--muted-foreground)';
    return chartConfig.count.color;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Team Workload
          </CardTitle>
          {metrics && metrics.overloadedTeams.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              Imbalanced
            </span>
          )}
        </div>
        <CardDescription>
          {metrics ? `${metrics.teamCount} teams • ${metrics.totalTasks} total tasks` : 'Task distribution across teams'}
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
                  formatter={(value) => {
                    if (!metrics) return `${value} tasks`;
                    const ratio = (value as number) / metrics.avgLoad;
                    const label = ratio > 1.5 ? '⚠️ High load' : ratio < 0.5 ? '📉 Low load' : '✓ Balanced';
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span>{value} tasks</span>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    );
                  }}
                />
              } 
            />
            <Bar
              dataKey="count"
              radius={4}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="text-xs text-muted-foreground pt-0">
          <div className="flex items-center justify-between w-full">
            <span>Avg: {metrics.avgLoad.toFixed(0)} tasks/team</span>
            <span className={`font-medium ${
              metrics.balanceScore >= 70 ? 'text-emerald-600' : 
              metrics.balanceScore >= 40 ? 'text-amber-600' : 'text-red-600'
            }`}>
              Balance: {metrics.balanceScore.toFixed(0)}%
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
