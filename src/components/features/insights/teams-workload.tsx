"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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
import { TeamsWorkload } from "@/src/lib/actions/analytics";

const chartConfig = {
  count: {
    label: "Tasks",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function TeamsWorkloadChart({
  chartData,
}: {
  chartData: TeamsWorkload[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams Workload</CardTitle>
        <CardDescription>Task distribution across teams</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload as TeamsWorkload;
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold">{value}</div>
                          <div className="text-xs text-muted-foreground">
                            Avg Hours: {data.avgHours.toFixed(1)}h
                          </div>
                        </div>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <PolarAngleAxis dataKey="team" />
            <PolarGrid />
            <Radar
              dataKey="count"
              fill={chartConfig.count.color}
              fillOpacity={0.6}
              stroke={chartConfig.count.color}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
