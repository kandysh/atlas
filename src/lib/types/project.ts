export type Status =
  | 'todo'
  | 'in-progress'
  | 'testing'
  | 'done'
  | 'completed'
  | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Dynamic task type - fields are driven by workspace field configurations
 * Required fields: id, createdAt, updatedAt
 * All other fields come from the task's JSONB data column
 */
export interface Task extends Record<string, unknown> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
