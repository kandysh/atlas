"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { mockTasks } from "@/data/mock-tasks";
import { CANCELLED } from "node:dns/promises";

export type ThroughPutOverTimeData = {
  date: string;
  hours: number;
  count: number;
};

export const description =
  "An interactive line chart showing completed tasks and hours saved over time.";

const chartConfig = {
  throughput: {
    label: "Throughput",
  },
  hours: {
    label: "Hours Saved",
    color: "var(--chart-1)",
  },
  count: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartLineInteractive({
  chartData,
}: {
  chartData: ThroughPutOverTimeData[];
}) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("hours");

  const total = React.useMemo(
    () => ({
      hours: chartData.reduce((acc, curr) => acc + curr.hours, 0),
      count: chartData.reduce((acc, curr) => acc + curr.count, 0),
    }),
    [chartData],
  );

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Throughput Chart.</CardTitle>
          <CardDescription>
            Shows the total hours saved and tasks completed over time.
          </CardDescription>
        </div>
        <div className="flex">
          {["hours", "count"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "long",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="hours"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
