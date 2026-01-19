'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams Workload</CardTitle>
        <CardDescription>Task distribution across teams</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill={chartConfig.count.color}
              radius={4}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
