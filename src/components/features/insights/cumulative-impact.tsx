'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

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
import { CumulativeImpactData } from '@/src/lib/types/analytics';

const chartConfig = {
  cumulativeProcesses: {
    label: 'Cumulative Processes',
    color: 'var(--chart-1)',
  },
  cumulativeHours: {
    label: 'Cumulative Hours',
    color: 'var(--success)',
  },
} satisfies ChartConfig;

interface CumulativeImpactChartProps {
  data: CumulativeImpactData[];
}

export function CumulativeImpactChart({ data }: CumulativeImpactChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cumulative Business Impact
          </CardTitle>
          <CardDescription>Total impact delivered over time</CardDescription>
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
          <TrendingUp className="h-4 w-4" />
          Cumulative Business Impact
        </CardTitle>
        <CardDescription>Total impact delivered over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                })
              }
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  }
                />
              }
            />
            <Line
              dataKey="cumulativeProcesses"
              type="monotone"
              stroke={chartConfig.cumulativeProcesses.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="cumulativeHours"
              type="monotone"
              stroke={chartConfig.cumulativeHours.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
