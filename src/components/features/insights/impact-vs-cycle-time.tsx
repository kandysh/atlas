'use client';

import { Scatter, ScatterChart, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';
import { Clock } from 'lucide-react';

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
import { ImpactVsCycleTimeData } from '@/src/lib/types/analytics';

const chartConfig = {
  cycleDays: {
    label: 'Cycle Days',
    color: 'var(--chart-1)',
  },
  totalImpact: {
    label: 'Total Impact',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface ImpactVsCycleTimeChartProps {
  data: ImpactVsCycleTimeData[];
}

export function ImpactVsCycleTimeChart({ data }: ImpactVsCycleTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Impact vs Cycle Time
          </CardTitle>
          <CardDescription>Automation impact relative to delivery time</CardDescription>
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
          <Clock className="h-4 w-4" />
          Impact vs Cycle Time
        </CardTitle>
        <CardDescription>Automation impact relative to delivery time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ScatterChart
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cycleDays"
              type="number"
              name="Cycle Days"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="totalImpact"
              type="number"
              name="Total Impact"
              tickLine={false}
              axisLine={false}
            />
            <ZAxis range={[60, 400]} />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as ImpactVsCycleTimeData;
                    if (name === 'cycleDays') {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{payload.title}</span>
                          <span>Cycle: {payload.cycleDays} days</span>
                          <span>Impact: {payload.totalImpact}</span>
                          <span className="text-xs text-muted-foreground">
                            {payload.savedHrs}h saved • {payload.processesDemised} processes
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              }
            />
            <Scatter
              data={data}
              fill="var(--chart-2)"
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
