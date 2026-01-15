"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { AlertCircle, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";

export type InsightType = "warning" | "success" | "info";

interface InsightsCardProps {
  insights: Insight[];
}

interface Insight {
  type: InsightType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function InsightsCard({ insights }: InsightsCardProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight, index) => (
        <Card
          key={index}
          className={cn(
            "border-l-4 transition-all hover:shadow-md",
            insight.type === "warning" && "border-l-yellow-500",
            insight.type === "success" && "border-l-green-500",
            insight.type === "info" && "border-l-blue-500"
          )}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {insight.type === "warning" && (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              {insight.type === "success" && (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
              {insight.type === "info" && (
                <DollarSign className="h-5 w-5 text-blue-500" />
              )}
              <p className="text-sm">{insight.message}</p>
            </div>
            {insight.action && (
              <Button
                size="sm"
                variant="outline"
                onClick={insight.action.onClick}
              >
                {insight.action.label}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Generate intelligent insights from analytics data
 */
export function generateInsights(data: {
  kpis: {
    totalTasks: number;
    openTasks: number;
    avgCycleTime: number;
    hoursSaved: number;
  };
  priorityAging?: Array<{ priority: string; ageBucket: string; count: number }>;
  ownerProductivity?: Array<{
    owner: string;
    completed: number;
    avgCycleDays: number;
  }>;
}): Insight[] {
  const insights: Insight[] = [];

  // Check for stuck tasks
  const tasksOver30Days = data.priorityAging?.find(
    (p) => p.ageBucket === "30+ days"
  );
  if (tasksOver30Days && tasksOver30Days.count > 5) {
    insights.push({
      type: "warning",
      message: `${tasksOver30Days.count} tasks stuck >30 days - review blocking issues`,
      action: {
        label: "Show",
        // TODO: Implement filter action to show old tasks
        onClick: () => {},
      },
    });
  }

  // Check for high performer
  const topPerformer = data.ownerProductivity?.[0];
  const avgPerformer = data.ownerProductivity?.[1];
  if (
    topPerformer &&
    avgPerformer &&
    topPerformer.completed > avgPerformer.completed * 1.5
  ) {
    insights.push({
      type: "success",
      message: `${topPerformer.owner} completes ${Math.round((topPerformer.completed / avgPerformer.completed) * 100 - 100)}% faster than avg`,
      action: {
        label: "Compare",
        // TODO: Implement owner comparison view
        onClick: () => {},
      },
    });
  }

  // Check for hours saved
  if (data.kpis.hoursSaved > 100) {
    const dollarValue = Math.round(data.kpis.hoursSaved * 50); // $50/hour estimate
    insights.push({
      type: "info",
      message: `$${dollarValue.toLocaleString()} saved via automation`,
      action: {
        label: "Details",
        // TODO: Implement hours details modal
        onClick: () => {},
      },
    });
  }

  return insights;
}
