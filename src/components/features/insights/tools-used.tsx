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

import { ToolsUsed } from "@/src/lib/types";

export const description = "A radar chart";

const chartConfig = {
  tool: {
    label: "Tool",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ToolsUsedChart({ chartData }: { chartData: ToolsUsed[] }) {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Tools Used</CardTitle>
        <CardDescription>
          Showing tools used by users in the projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="tool" />
            <PolarGrid />
            <Radar
              dataKey="count"
              fill={chartConfig.tool.color}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {/*<CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          January - June 2024
        </div>
      </CardFooter>*/}
    </Card>
  );
}
