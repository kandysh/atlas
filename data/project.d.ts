export interface Task {
  id: string;
  owner: string;
  title: string;
  assetClass: string;
  teamsInvolved: string[];
  theme: string[];
  problemStatement: string;
  solutionDesign: string;
  status: "todo" | "pending" | "in-progress" | "completed" | "blocked";
  priority?: "low" | "medium" | "high" | "urgent";
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

// export type Task = Omit<
//   Project,
//   | "problemStatement"
//   | "solutionDesign"
//   | "benefits"
//   | "teamsInvolved"
//   | "otherUseCases"
//   | "createdAt"
//   | "updatedAt"
// >;
