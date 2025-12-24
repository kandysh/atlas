export interface Project {
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
  completionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task
  extends Omit<
    Project,
    | "problemStatement"
    | "solutionDesign"
    | "benefits"
    | "teamsInvolved"
    | "otherUseCases"
    | "createdAt"
    | "updatedAt"
  > {}
