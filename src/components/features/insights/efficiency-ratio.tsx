'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';

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
import { EfficiencyRatioData } from '@/src/lib/types/analytics';

const chartConfig = {
  efficiency: {
    label: 'Efficiency Ratio',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface EfficiencyRatioChartProps {
  data: EfficiencyRatioData[];
}

export function EfficiencyRatioChart({ data }: EfficiencyRatioChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Efficiency Ratio Distribution
          </CardTitle>
          <CardDescription>Hours saved per process automated</CardDescription>
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
          <BarChart3 className="h-4 w-4" />
          Efficiency Ratio Distribution
        </CardTitle>
        <CardDescription>Hours saved per process automated</CardDescription>
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
              dataKey="title"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.slice(0, 15)}...` : value
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
                    const payload = item.payload as EfficiencyRatioData;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{payload.title}</span>
                        <span>Efficiency: {Number(value).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          {payload.savedHrs}h ÷ {payload.processesDemised} processes
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey="efficiency"
              fill={chartConfig.efficiency.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
