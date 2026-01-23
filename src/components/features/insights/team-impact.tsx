'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

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
  ChartTooltipContent,
  type ChartConfig,
} from '@/src/components/ui/chart';

import { TeamImpactQuadrantData } from '@/src/lib/types';

export const description =
  'A grouped bar chart showing team impact metrics';

const chartConfig = {
  hoursSaved: {
    label: 'Hours Saved',
    color: 'var(--chart-1)',
  },
  processesDemised: {
    label: 'Processes Demised',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface TeamImpactChartProps {
  data: TeamImpactQuadrantData[];
  onTeamClick?: (team: string) => void;
}

export function TeamImpactChart({ data, onTeamClick }: TeamImpactChartProps) {
  const metrics = useMemo(() => {
    if (data.length === 0) return null;

    const totalHoursSaved = data.reduce(
      (acc, d) => acc + (d.totalSavedHrs || 0),
      0,
    );
    const totalProcessesDemised = data.reduce(
      (acc, d) => acc + (d.totalProcessesDemised || 0),
      0,
    );

    const topTeam = data.reduce(
      (max, d) =>
        (d.totalSavedHrs || 0) > (max.totalSavedHrs || 0) ? d : max,
      data[0],
    );

    return {
      totalHoursSaved,
      totalProcessesDemised,
      topTeam: topTeam.team,
      topHoursSaved: topTeam.totalSavedHrs || 0,
      teamCount: data.length,
    };
  }, [data]);

  // Limit to top 10 teams for better visualization
  const topTeams = useMemo(() => {
    return data
      .sort((a, b) => (b.totalSavedHrs || 0) - (a.totalSavedHrs || 0))
      .slice(0, 10);
  }, [data]);

  const handleBarClick = (data: any) => {
    if (onTeamClick && data?.payload) {
      const team = data.payload as TeamImpactQuadrantData;
      onTeamClick(team.team);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Team Impact
        </CardTitle>
        <CardDescription>
          {metrics
            ? `${metrics.teamCount} teams - ${metrics.totalHoursSaved.toFixed(0)}hrs saved, ${metrics.totalProcessesDemised} processes eliminated`
            : 'Team performance and impact metrics'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <BarChart
            data={topTeams}
            margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="team"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                value.length > 10 ? value.slice(0, 10) + '…' : value
              }
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, item) => {
                    const team = item?.payload as TeamImpactQuadrantData;
                    if (name === 'totalSavedHrs') {
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium capitalize">
                            {team.team}
                          </span>
                          <span>{value} hours saved</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium capitalize">
                            {team.team}
                          </span>
                          <span>{value} processes demised</span>
                        </div>
                      );
                    }
                  }}
                />
              }
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="totalSavedHrs"
              fill={chartConfig.hoursSaved.color}
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor={onTeamClick ? 'pointer' : 'default'}
            />
            <Bar
              dataKey="totalProcessesDemised"
              fill={chartConfig.processesDemised.color}
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor={onTeamClick ? 'pointer' : 'default'}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {metrics && (
        <CardFooter className="flex-col gap-1.5 text-xs pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">Top team:</span>
            <span className="font-medium capitalize flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              {metrics.topTeam} ({metrics.topHoursSaved.toFixed(0)}hrs)
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">Total impact:</span>
            <span className="font-medium">
              {metrics.totalHoursSaved.toFixed(0)}hrs saved •{' '}
              {metrics.totalProcessesDemised} processes
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
