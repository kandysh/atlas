'use client';

import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
} from 'recharts';
import { Target } from 'lucide-react';

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
import { TeamImpactQuadrantData } from '@/src/lib/types/analytics';

const chartConfig = {
  totalProcessesDemised: {
    label: 'Total Processes',
    color: 'var(--chart-1)',
  },
  totalSavedHrs: {
    label: 'Total Hours',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface TeamImpactQuadrantChartProps {
  data: TeamImpactQuadrantData[];
}

export function TeamImpactQuadrantChart({
  data,
}: TeamImpactQuadrantChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Team Impact Quadrant
          </CardTitle>
          <CardDescription>Team performance matrix</CardDescription>
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
          <Target className="h-4 w-4" />
          Team Impact Quadrant
        </CardTitle>
        <CardDescription>Team performance matrix</CardDescription>
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
              dataKey="totalProcessesDemised"
              type="number"
              name="Total Processes Demised"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="totalSavedHrs"
              type="number"
              name="Total Hours Saved"
              tickLine={false}
              axisLine={false}
            />
            <ZAxis dataKey="taskCount" range={[100, 1000]} />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as TeamImpactQuadrantData;
                    if (name === 'totalProcessesDemised') {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{payload.team}</span>
                          <span>
                            Processes: {payload.totalProcessesDemised}
                          </span>
                          <span>Hours: {payload.totalSavedHrs}</span>
                          <span className="text-xs text-muted-foreground">
                            {payload.taskCount} tasks
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
