'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Users } from 'lucide-react';

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
import { ImpactDensityByTeamData } from '@/src/lib/types/analytics';

const chartConfig = {
  impactDensity: {
    label: 'Impact Density',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface ImpactDensityByTeamChartProps {
  data: ImpactDensityByTeamData[];
}

export function ImpactDensityByTeamChart({ data }: ImpactDensityByTeamChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Impact Density by Team
          </CardTitle>
          <CardDescription>Processes automated per day by team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Impact Density by Team
        </CardTitle>
        <CardDescription>Processes automated per day by team</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="team"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as ImpactDensityByTeamData;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{payload.team}</span>
                        <span>Density: {Number(value).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          {payload.processesDemised} processes ÷ {payload.avgCycleDays.toFixed(1)} days
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {payload.taskCount} tasks
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey="impactDensity"
              fill={chartConfig.impactDensity.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
