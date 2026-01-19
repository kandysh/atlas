"use client";

import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";

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
import { HoursEfficiency } from "@/src/lib/actions/analytics";

const chartConfig = {
  currentHrs: {
    label: "Estimated Hrs",
    color: "var(--chart-1)",
  },
  workedHrs: {
    label: "Worked Hrs",
    color: "var(--chart-2)",
  },
  efficiency: {
    label: "Efficiency %",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface HoursEfficiencyChartProps {
  chartData: HoursEfficiency[];
}

export function HoursEfficiencyChart({
  chartData,
}: HoursEfficiencyChartProps) {
  // Calculate average efficiency
  const avgEfficiency =
    chartData.length > 0
      ? chartData.reduce((acc, curr) => acc + curr.efficiency, 0) /
        chartData.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours Efficiency</CardTitle>
        <CardDescription>
          Estimated vs actual hours worked over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value + "-01").toLocaleDateString("en-US", {
                  month: "short",
                })
              }
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value + "-01").toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  }
                  formatter={(value, name) => {
                    if (name === "efficiency") {
                      return `${Number(value).toFixed(1)}%`;
                    }
                    return `${Number(value).toFixed(1)}h`;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="currentHrs"
              type="monotone"
              fill={chartConfig.currentHrs.color}
              fillOpacity={0.2}
              stroke={chartConfig.currentHrs.color}
              strokeWidth={2}
            />
            <Area
              dataKey="workedHrs"
              type="monotone"
              fill={chartConfig.workedHrs.color}
              fillOpacity={0.2}
              stroke={chartConfig.workedHrs.color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Avg efficiency:</span>
          <span className={avgEfficiency <= 100 ? "text-green-600" : "text-amber-600"}>
            {avgEfficiency.toFixed(1)}%
          </span>
          <span className="text-xs">
            ({avgEfficiency <= 100 ? "under budget" : "over budget"})
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
