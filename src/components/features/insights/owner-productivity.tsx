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
  completedTasks: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  avgCycleDays: {
    label: "Avg Cycle (days)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface OwnerProductivityChartProps {
  chartData: OwnerProductivity[];
  onOwnerClick?: (owner: string) => void;
}

export function OwnerProductivityChart({
  chartData,
  onOwnerClick,
}: OwnerProductivityChartProps) {
  const handleBarClick = (data: { owner: string }) => {
    if (onOwnerClick && data?.owner) {
      onOwnerClick(data.owner);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Productivity</CardTitle>
        <CardDescription>
          Top 5 performers by completed tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="owner"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              tickFormatter={(value) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "avgCycleDays") {
                      return `${Number(value).toFixed(1)} days`;
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar
              dataKey="completedTasks"
              fill={chartConfig.completedTasks.color}
              radius={4}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
