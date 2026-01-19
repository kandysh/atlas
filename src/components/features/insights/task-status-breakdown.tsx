'use client';

import { useMemo } from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import { TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

import { DonutChartData } from '@/src/lib/types';

export const description = 'A donut chart with status insights';

const chartConfig = {
  count: {
    label: 'Count',
  },
  todo: {
    label: 'To Do',
    color: 'var(--status-todo)',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'var(--status-in-progress)',
  },
  testing: {
    label: 'Testing',
    color: 'var(--status-testing)',
  },
  done: {
    label: 'Done',
    color: 'var(--status-done)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--status-completed)',
  },
  blocked: {
    label: 'Blocked',
    color: 'var(--status-blocked)',
  },
} satisfies ChartConfig;

// Custom tooltip for status breakdown
function StatusTooltip({ active, payload, totalTasks }: { 
  active?: boolean; 
  payload?: Array<{ payload: DonutChartData }>; 
  totalTasks: number;
}) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  const percentage = totalTasks > 0 ? (data.count / totalTasks * 100).toFixed(1) : 0;
  
  // Status-specific context
  const statusContext: Record<string, string> = {
    'To Do': 'Waiting to be started',
    'In Progress': 'Currently being worked on',
    'Testing': 'Under review or QA',
    'Done': 'Completed and verified',
    'Completed': 'Fully delivered',
    'Blocked': 'Needs attention',
  };

  const isActiveStatus = data.status === 'In Progress' || data.status === 'Testing';

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: data.fill }}
        />
        <span className="font-semibold text-sm">{data.status}</span>
        {isActiveStatus && (
          <span className="text-xs bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">Active</span>
        )}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tasks:</span>
          <span className="font-medium">{data.count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Share:</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="pt-1 border-t mt-1">
          <span className="text-muted-foreground italic">
            {statusContext[data.status] || ''}
          </span>
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
}

const renderSectorShape = (props: SectorShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, isActive } = props;
  
  // Expand sector on hover only
  const hoverOffset = isActive ? 6 : 0;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - (isActive ? 2 : 0)}
        outerRadius={outerRadius + hoverOffset}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="var(--background)"
        strokeWidth={isActive ? 0 : 2}
        style={{
          filter: isActive ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : undefined,
          transition: 'all 0.2s ease-out',
        }}
      />
    </g>
  );
};

type TasksStatusBreakdownDonutProps = {
  chartData: DonutChartData[];
};

export function TasksStatusBreakdownDonut({
  chartData,
}: TasksStatusBreakdownDonutProps) {
  const totalTasks = chartData.reduce((acc, curr) => acc + curr.count, 0);

  // Compute health metrics
  const metrics = useMemo(() => {
    const completed = chartData.find(d => d.status === 'Completed')?.count || 0;
    const done = chartData.find(d => d.status === 'Done')?.count || 0;
    const blocked = chartData.find(d => d.status === 'Blocked')?.count || 0;
    const inProgress = chartData.find(d => d.status === 'In Progress')?.count || 0;
    const testing = chartData.find(d => d.status === 'Testing')?.count || 0;
    const todo = chartData.find(d => d.status === 'To Do')?.count || 0;

    const finishedCount = completed + done;
    const activeCount = inProgress + testing;
    const finishedRate = totalTasks > 0 ? (finishedCount / totalTasks) * 100 : 0;
    const blockedRate = totalTasks > 0 ? (blocked / totalTasks) * 100 : 0;

    // Health score: penalize blocked tasks, reward completed
    let healthStatus: 'good' | 'warning' | 'critical' = 'good';
    if (blockedRate > 10) healthStatus = 'critical';
    else if (blockedRate > 5 || finishedRate < 20) healthStatus = 'warning';

    return {
      finishedCount,
      finishedRate,
      activeCount,
      blockedCount: blocked,
      blockedRate,
      todoCount: todo,
      healthStatus,
    };
  }, [chartData, totalTasks]);

  const healthConfig = {
    good: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Healthy' },
    warning: { icon: TrendingDown, color: 'text-amber-500', label: 'Needs Attention' },
    critical: { icon: AlertTriangle, color: 'text-red-500', label: 'At Risk' },
  };

  const HealthIcon = healthConfig[metrics.healthStatus].icon;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          Task Status
          <span className={`inline-flex items-center gap-1 text-xs font-normal px-2 py-0.5 rounded-full ${
            metrics.healthStatus === 'good' ? 'bg-emerald-500/10 text-emerald-600' :
            metrics.healthStatus === 'warning' ? 'bg-amber-500/10 text-amber-600' :
            'bg-red-500/10 text-red-600'
          }`}>
            <HealthIcon className="h-3 w-3" />
            {healthConfig[metrics.healthStatus].label}
          </span>
        </CardTitle>
        <CardDescription>Distribution across workflow stages</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<StatusTooltip totalTasks={totalTasks} />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              stroke="var(--background)"
              shape={(props: unknown) => renderSectorShape(props as SectorShapeProps)}
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
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {metrics.finishedRate.toFixed(0)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-xs"
                        >
                          Complete
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
      <CardFooter className="flex-col gap-2 text-sm pt-0">
        <div className="grid grid-cols-3 gap-2 w-full text-center">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-emerald-600">{metrics.finishedCount}</span>
            <span className="text-xs text-muted-foreground">Done</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-blue-500">{metrics.activeCount}</span>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-lg font-semibold ${metrics.blockedCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {metrics.blockedCount}
            </span>
            <span className="text-xs text-muted-foreground">Blocked</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
