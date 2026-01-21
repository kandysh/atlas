'use client';

import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
} from 'recharts';
import { Grid3X3 } from 'lucide-react';

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
import { ImpactMatrixData } from '@/src/lib/types/analytics';

const chartConfig = {
  processesDemised: {
    label: 'Processes Demised',
    color: 'var(--chart-1)',
  },
  savedHrs: {
    label: 'Hours Saved',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface ImpactMatrixChartProps {
  data: ImpactMatrixData[];
}

export function ImpactMatrixChart({ data }: ImpactMatrixChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Impact Matrix
          </CardTitle>
          <CardDescription>Each dot represents one automation</CardDescription>
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
          <Grid3X3 className="h-4 w-4" />
          Impact Matrix
        </CardTitle>
        <CardDescription>Each dot represents one automation</CardDescription>
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
              dataKey="processesDemised"
              type="number"
              name="Processes Demised"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="savedHrs"
              type="number"
              name="Hours Saved"
              tickLine={false}
              axisLine={false}
            />
            <ZAxis range={[60, 400]} />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as ImpactMatrixData;
                    if (name === 'processesDemised') {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{payload.title}</span>
                          <span>Processes: {payload.processesDemised}</span>
                          <span>Hours: {payload.savedHrs}</span>
                          <span className="text-xs text-muted-foreground">
                            {payload.assetClass}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              }
            />
            <Scatter data={data} fill="var(--chart-1)" />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
