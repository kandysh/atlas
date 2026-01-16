"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { PriorityAging } from "@/src/lib/actions/analytics";

const chartConfig = {
  bucket0to3: {
    label: "0-3 days",
    color: "var(--chart-2)",
  },
  bucket3to7: {
    label: "3-7 days",
    color: "var(--chart-3)",
  },
  bucket7to14: {
    label: "7-14 days",
    color: "var(--chart-4)",
  },
  bucket14plus: {
    label: "14+ days",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

interface PriorityAgingChartProps {
  chartData: PriorityAging[];
  onPriorityClick?: (priority: string) => void;
}

export function PriorityAgingChart({
  chartData,
  onPriorityClick,
}: PriorityAgingChartProps) {
  const handleBarClick = (data: { priority: string }) => {
    if (onPriorityClick && data?.priority) {
      onPriorityClick(data.priority.toLowerCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Aging</CardTitle>
        <CardDescription>
          Open tasks by priority and age bucket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="priority"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="bucket0to3"
              stackId="a"
              fill={chartConfig.bucket0to3.color}
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar
              dataKey="bucket3to7"
              stackId="a"
              fill={chartConfig.bucket3to7.color}
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar
              dataKey="bucket7to14"
              stackId="a"
              fill={chartConfig.bucket7to14.color}
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar
              dataKey="bucket14plus"
              stackId="a"
              fill={chartConfig.bucket14plus.color}
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Shows age distribution of open tasks by priority
      </CardFooter>
    </Card>
  );
}
