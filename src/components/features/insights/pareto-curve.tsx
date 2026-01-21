'use client';

import {
  Bar,
  Line,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
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
import { ParetoCurveData } from '@/src/lib/types/analytics';

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--chart-1)',
  },
  cumulativePercentage: {
    label: 'Cumulative %',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface ParetoCurveChartProps {
  data: ParetoCurveData[];
  title: string;
  valueLabel: string;
}

export function ParetoCurveChart({
  data,
  title,
  valueLabel,
}: ParetoCurveChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {title}
          </CardTitle>
          <CardDescription>
            Pareto analysis of {valueLabel.toLowerCase()}
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
          <TrendingUp className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>
          Pareto analysis of {valueLabel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="displayId"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value.length > 8 ? `${value.slice(0, 8)}...` : value
              }
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: valueLabel, angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as ParetoCurveData;
                    if (name === 'value') {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">
                            {payload.displayId}
                          </span>
                          <span className="text-xs">{payload.title}</span>
                          <span>
                            {valueLabel}: {value}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {payload.cumulativePercentage.toFixed(1)}%
                            cumulative
                          </span>
                        </div>
                      );
                    }
                    return `${Number(value).toFixed(1)}%`;
                  }}
                />
              }
            />
            <Bar
              yAxisId="left"
              dataKey="value"
              fill={chartConfig.value.color}
              radius={4}
            />
            <Line
              yAxisId="right"
              dataKey="cumulativePercentage"
              type="monotone"
              stroke={chartConfig.cumulativePercentage.color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
