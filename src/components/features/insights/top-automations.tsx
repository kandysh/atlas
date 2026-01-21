'use client';

import { Trophy } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { TopAutomationData } from '@/src/lib/types/analytics';

interface TopAutomationsChartProps {
  data: TopAutomationData[];
  onTaskClick?: (taskId: string) => void;
}

export function TopAutomationsChart({ data, onTaskClick }: TopAutomationsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Top 10 Automations by Impact
          </CardTitle>
          <CardDescription>Highest performing automations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const topTen = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top 10 Automations by Impact
        </CardTitle>
        <CardDescription>Highest performing automations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Processes</TableHead>
                <TableHead className="text-right">Impact</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topTen.map((item, index) => (
                <TableRow
                  key={item.taskId}
                  className={onTaskClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onTaskClick?.(item.taskId)}
                >
                  <TableCell className="font-medium">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.displayId}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.title.length > 50
                      ? `${item.title.slice(0, 50)}...`
                      : item.title}
                  </TableCell>
                  <TableCell className="text-right">{item.savedHrs}</TableCell>
                  <TableCell className="text-right">{item.processesDemised}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.totalImpact.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.completionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
