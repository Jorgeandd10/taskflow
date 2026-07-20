import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../../core/models/task.model';

/**
 * Pure pipe for filtering tasks by category.
 * Pure = only re-evaluates when input references change.
 * Prevents repeated filtering on every change detection cycle.
 */
@Pipe({
  name: 'filterByCategory',
  standalone: true,
  pure: true,
})
export class FilterByCategoryPipe implements PipeTransform {
  transform(tasks: Task[], categoryId: string | null | 'all'): Task[] {
    if (categoryId === 'all' || categoryId === null) return tasks;
    return tasks.filter(t => t.categoryId === categoryId);
  }
}
