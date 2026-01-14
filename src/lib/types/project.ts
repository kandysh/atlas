export type Status = "todo" | "in-progress" | "testing" | "done" | "completed" | "blocked";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  owner: string;
  title: string;
  assetClass: string;
  teamsInvolved: string[];
  theme: string[];
  problemStatement: string;
  solutionDesign: string;
  status: Status;
  priority: Priority;
  benefits: string;
  currentHrs: number;
  savedHrs: number;
  workedHrs: number;
  tools: string[];
  otherUseCases: string;
  tags: string[];
  completionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
