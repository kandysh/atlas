"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { RollingCycle } from "@/src/lib/utils";

export const description = "A multiple line chart";

const chartConfig = {
  cycle: {
    label: "Cycle Time",
  },
  rollingAvg: {
    label: "Rolling",
    color: "var(--chart-1)",
  },
  avgCycleDays: {
    label: "Average",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function CycleTimeChart({
  chartData,
}: {
  chartData: RollingCycle[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cycle Time Trend</CardTitle>
        <CardDescription>
          Average time (in days) taken to complete tasks each month, shown
          alongside a rolling average to highlight long-term delivery trends.
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="rollingAvg"
              type="monotone"
              stroke={chartConfig.rollingAvg.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="avgCycleDays"
              type="monotone"
              stroke={chartConfig.avgCycleDays.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
