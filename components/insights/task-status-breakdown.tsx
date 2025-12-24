"use client";

import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorShapeProps } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A donut chart with an active sector";

export type DonutChartData = {
  status: string;
  count: number;
  fill: string;
};

const chartConfig = {
  count: {
    label: "Count",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-1)",
  },
  completed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
  inprogress: {
    label: "In Progress",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type TasksStatusBreakdownDonutProps = {
  chartData: DonutChartData[];
};

export function TasksStatusBreakdownDonut({
  chartData,
}: TasksStatusBreakdownDonutProps) {
  const totalTasks = chartData.reduce((acc, curr) => acc + curr.count, 0);

  const maxIndex = chartData.reduce((max, item, index) => {
    return item.count > chartData[max].count ? index : max;
  }, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Status Breakdown</CardTitle>
        <CardDescription>Showing task status breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              shape={({ outerRadius = 0, ...props }: PieSectorShapeProps) => (
                <Sector
                  {...props}
                  outerRadius={
                    props.index === maxIndex ? outerRadius + 10 : outerRadius
                  }
                />
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTasks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Tasks
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {/*Completed Trend by 5.2% this month <TrendingUp className="h-4 w-4" />*/}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total tasks for the last 12 months
        </div>
      </CardFooter>
    </Card>
  );
}
