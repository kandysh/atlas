"use client"

import { Task } from "@/data/project"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, User, Wrench } from "lucide-react"

interface TaskCardProps {
  task: Task
}

const statusConfig = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-blue-500/10 text-blue-900" },
  completed: { label: "Done", className: "bg-green-500/10 text-green-900" },
  blocked: { label: "Blocked", className: "bg-red-500/10 text-red-900" },
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2">{task.title}</h3>
          <Badge
            variant="secondary"
            className={`${statusConfig[task.status].className} px-2 py-0.5 text-xs shrink-0`}
          >
            {statusConfig[task.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{task.owner}</span>
        </div>
        
        {task.assetClass && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {task.assetClass}
            </Badge>
          </div>
        )}
        
        {task.tools && task.tools.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            {task.tools.slice(0, 3).map((tool, i) => (
              <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs">
                {tool}
              </Badge>
            ))}
            {task.tools.length > 3 && (
              <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                +{task.tools.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {task.completionDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(task.completionDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
