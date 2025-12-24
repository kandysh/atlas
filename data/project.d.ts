export interface Task {
  id: string;
  owner: string;
  title: string;
  assetClass: string;
  teamsInvolved: string[];
  theme: string[];
  problemStatement: string;
  solutionDesign: string;
  status: "pending" | "in-progress" | "completed";
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
