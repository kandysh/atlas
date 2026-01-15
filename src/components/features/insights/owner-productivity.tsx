"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { OwnerProductivity } from "@/src/lib/actions/analytics";

const chartConfig = {
  completed: {
    label: "Tasks Completed",
    color: "var(--chart-1)",
  },
  hoursSaved: {
    label: "Hours Saved",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function OwnerProductivityChart({
  chartData,
}: {
  chartData: OwnerProductivity[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Productivity</CardTitle>
        <CardDescription>Top 5 performers by tasks completed</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="owner"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={100}
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload as OwnerProductivity;
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold">{value}</div>
                          <div className="text-xs text-muted-foreground">
                            Avg Cycle: {data.avgCycleDays.toFixed(1)} days
                          </div>
                        </div>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar
              dataKey="completed"
              fill={chartConfig.completed.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
