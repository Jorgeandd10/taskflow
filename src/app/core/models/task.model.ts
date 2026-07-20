export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type CreateTaskDTO = Pick<Task, 'title' | 'categoryId'>;
export type UpdateTaskDTO = Partial<Pick<Task, 'title' | 'completed' | 'categoryId'>>;
