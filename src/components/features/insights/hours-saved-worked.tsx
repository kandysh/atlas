'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

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
import { MonthlyHoursPoint } from '@/src/lib/actions/analytics';

export const description = 'A multiple line chart';

const chartConfig = {
  worked: {
    label: 'Worked',
    color: 'var(--chart-1)',
  },
  saved: {
    label: 'Saved',
    color: 'var(--chart-2)',
  },
  net: {
    label: 'Net',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export default function HoursSavedWorkedChart({
  chartData,
}: {
  chartData: MonthlyHoursPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cumulative Hours</CardTitle>
        <CardDescription>
          Gives a cumulative view of hours worked and saved over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'long',
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                    })
                  }
                />
              }
            />
            {['worked', 'saved', 'net'].map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="linear"
                stroke={chartConfig[key as keyof typeof chartConfig].color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/*<CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              How to read this chart?
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              <ul>
                <li>Downward trend - team/process improving</li>
                <li>Upward trend - team/process needs improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </CardFooter>*/}
    </Card>
  );
}
