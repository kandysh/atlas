"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
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
import { PriorityAging } from "@/src/lib/actions/analytics";

const chartConfig = {
  urgent: {
    label: "Urgent",
    color: "hsl(var(--destructive))",
  },
  high: {
    label: "High",
    color: "var(--chart-1)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-2)",
  },
  low: {
    label: "Low",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function PriorityAgingChart({
  chartData,
}: {
  chartData: PriorityAging[];
}) {
  // Transform data for stacked bar chart
  const ageBuckets = Array.from(
    new Set(chartData.map((d) => d.ageBucket))
  ).sort((a, b) => {
    const order = ["0-3 days", "4-7 days", "8-14 days", "15-30 days", "30+ days"];
    return order.indexOf(a) - order.indexOf(b);
  });

  interface TransformedRow {
    ageBucket: string;
    [priority: string]: string | number;
  }

  const transformedData: TransformedRow[] = ageBuckets.map((bucket) => {
    const row: TransformedRow = { ageBucket: bucket };
    chartData
      .filter((d) => d.ageBucket === bucket)
      .forEach((d) => {
        row[d.priority] = d.count;
      });
    return row;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Aging</CardTitle>
        <CardDescription>Task age distribution by priority</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
          <BarChart
            accessibilityLayer
            data={transformedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="ageBucket"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            {Object.keys(chartConfig).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={chartConfig[key as keyof typeof chartConfig].color}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
