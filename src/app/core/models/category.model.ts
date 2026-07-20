export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export type CreateCategoryDTO = Pick<Category, 'name' | 'color'>;
export type UpdateCategoryDTO = Partial<Pick<Category, 'name' | 'color'>>;

export const DEFAULT_CATEGORY_COLORS: string[] = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#64748b', // slate
];
