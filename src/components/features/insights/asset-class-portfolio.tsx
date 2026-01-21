'use client';

import { useMemo } from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import { Layers } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/src/components/ui/chart';
import { AssetClassDistribution } from '@/src/lib/actions/analytics';

const chartConfig = {
  savedHrs: {
    label: 'Hours Saved',
  },
} satisfies ChartConfig;

// Custom tooltip for asset class
function AssetClassTooltip({
  active,
  payload,
  chartData,
  metrics,
}: {
  active?: boolean;
  payload?: Array<{ payload: AssetClassDistribution }>;
  chartData: AssetClassDistribution[];
  metrics: { topAsset: string; topHoursSaved: number } | null;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const totalHoursSaved = chartData.reduce((acc, d) => acc + (d.savedHrs || 0), 0);
  const percentage =
    totalHoursSaved > 0 ? (((data.savedHrs || 0) / totalHoursSaved) * 100).toFixed(1) : 0;
  const isTopAsset = metrics && data.assetClass === metrics.topAsset;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <span className="font-semibold text-sm capitalize">
          {data.assetClass}
        </span>
        {isTopAsset && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            Top
          </span>
        )}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hours Saved:</span>
          <span className="font-medium">{(data.savedHrs || 0).toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Portfolio share:</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="pt-1 border-t mt-1 text-muted-foreground">
          Click to filter by this asset class
        </div>
      </div>
    </div>
  );
}

// Custom shape renderer with hover effect
interface SectorShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  isActive: boolean;
  payload?: AssetClassDistribution;
}

const renderSectorShape = (props: SectorShapeProps, topAsset: string) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    isActive,
    payload,
  } = props;
  const isTopAssetClass = payload?.assetClass === topAsset;

  // Expand sector on hover
  const hoverOffset = isActive ? 8 : 0;
  const topAssetOffset = isTopAssetClass && !isActive ? 2 : 0;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - (isActive ? 2 : topAssetOffset)}
        outerRadius={outerRadius + hoverOffset + topAssetOffset}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="var(--background)"
        strokeWidth={isActive ? 0 : 2}
        style={{
          filter: isActive
            ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            : undefined,
          transition: 'all 0.2s ease-out',
          cursor: 'pointer',
        }}
      />
    </g>
  );
};

interface AssetClassPortfolioChartProps {
  chartData: AssetClassDistribution[];
  onAssetClassClick?: (assetClass: string) => void;
}

export function AssetClassPortfolioChart({
  chartData,
  onAssetClassClick,
}: AssetClassPortfolioChartProps) {
  const totalHoursSaved = chartData.reduce((acc, curr) => acc + (curr.savedHrs || 0), 0);

  const metrics = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => (b.savedHrs || 0) - (a.savedHrs || 0));
    const topAsset = sorted[0];
    const topPercentage =
      totalHoursSaved > 0 ? ((topAsset?.savedHrs || 0) / totalHoursSaved) * 100 : 0;
    const diversityScore = chartData.length;

    // Concentration risk: if top asset > 60%, it's high concentration
    const concentrationRisk =
      topPercentage > 60
        ? 'high'
        : topPercentage > 40
          ? 'moderate'
          : 'balanced';

    return {
      topAsset: topAsset?.assetClass || 'N/A',
      topHoursSaved: topAsset?.savedHrs || 0,
      topPercentage,
      diversityScore,
      concentrationRisk,
    };
  }, [chartData, totalHoursSaved]);

  const handlePieClick = (data: { assetClass: string }) => {
    if (onAssetClassClick && data?.assetClass) {
      onAssetClassClick(data.assetClass);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Asset Class Portfolio
        </CardTitle>
        <CardDescription>
          {metrics.diversityScore} asset class
          {metrics.diversityScore !== 1 ? 'es' : ''} in portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <AssetClassTooltip chartData={chartData} metrics={metrics} />
              }
            />
            <Pie
              data={chartData}
              dataKey="savedHrs"
              nameKey="assetClass"
              innerRadius={50}
              outerRadius={75}
              strokeWidth={2}
              stroke="var(--background)"
              onClick={handlePieClick}
              shape={(props: unknown) =>
                renderSectorShape(props as SectorShapeProps, metrics.topAsset)
              }
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 6}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalHoursSaved.toFixed(0)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          Hours Saved
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
      <CardFooter className="flex-col gap-1.5 text-sm pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-muted-foreground text-xs">Top asset:</span>
          <span className="font-medium text-xs capitalize">
            {metrics.topAsset}
          </span>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-muted-foreground text-xs">Concentration:</span>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              metrics.concentrationRisk === 'high'
                ? 'bg-amber-500/10 text-amber-600'
                : metrics.concentrationRisk === 'moderate'
                  ? 'bg-blue-500/10 text-blue-600'
                  : 'bg-emerald-500/10 text-emerald-600'
            }`}
          >
            {metrics.topPercentage.toFixed(0)}% in top asset
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
