"use client";

import { Label, Pie, PieChart } from "recharts";

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
import { AssetClassDistribution } from "@/src/lib/actions/analytics";

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

interface AssetClassPortfolioChartProps {
  chartData: AssetClassDistribution[];
  onAssetClassClick?: (assetClass: string) => void;
}

export function AssetClassPortfolioChart({
  chartData,
  onAssetClassClick,
}: AssetClassPortfolioChartProps) {
  const totalTasks = chartData.reduce((acc, curr) => acc + curr.count, 0);

  const handlePieClick = (data: { assetClass: string }) => {
    if (onAssetClassClick && data?.assetClass) {
      onAssetClassClick(data.assetClass);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asset Class Portfolio</CardTitle>
        <CardDescription>Distribution by asset class</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="assetClass"
              innerRadius={50}
              strokeWidth={5}
              onClick={handlePieClick}
              className="cursor-pointer"
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
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalTasks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Total
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
    </Card>
  );
}
