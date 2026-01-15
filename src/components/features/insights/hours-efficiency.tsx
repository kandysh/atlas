"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import { HoursEfficiency } from "@/src/lib/actions/analytics";

const chartConfig = {
  efficiency: {
    label: "Efficiency Ratio",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function HoursEfficiencyChart({
  chartData,
}: {
  chartData: HoursEfficiency[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours Efficiency</CardTitle>
        <CardDescription>
          Efficiency ratio (current/worked hours) over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
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
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                })
              }
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload as HoursEfficiency;
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {new Date(value).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>Current: {data.currentHrs.toFixed(1)}h</div>
                            <div>Worked: {data.workedHrs.toFixed(1)}h</div>
                            <div>Ratio: {data.efficiency.toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <Line
              dataKey="efficiency"
              type="monotone"
              stroke={chartConfig.efficiency.color}
              strokeWidth={2}
              dot={{
                fill: chartConfig.efficiency.color,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
