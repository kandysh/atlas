'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { DollarSign } from 'lucide-react';

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
import { AssetClassROIData } from '@/src/lib/types/analytics';

const chartConfig = {
  roiScore: {
    label: 'ROI Score',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface AssetClassROIChartProps {
  data: AssetClassROIData[];
}

export function AssetClassROIChart({ data }: AssetClassROIChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Asset Class ROI
          </CardTitle>
          <CardDescription>
            Return on investment by automation type
          </CardDescription>
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
          <DollarSign className="h-4 w-4" />
          Asset Class ROI
        </CardTitle>
        <CardDescription>
          Return on investment by automation type
        </CardDescription>
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
              dataKey="assetClass"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.slice(0, 12)}...` : value
              }
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as AssetClassROIData;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">
                          {payload.assetClass}
                        </span>
                        <span>ROI: {Number(value).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          {payload.savedHrs}h ÷{' '}
                          {payload.avgCycleDays.toFixed(1)} days
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
              dataKey="roiScore"
              fill={chartConfig.roiScore.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
