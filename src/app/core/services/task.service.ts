import { Injectable, inject, signal, computed } from '@angular/core';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

/**
 * PERFORMANCE NOTES:
 *
 * 1. Angular Signals instead of BehaviorSubject/Observable:
 *    - No subscriptions to create, track, or unsubscribe
 *    - Fine-grained reactivity: only components that READ a signal re-render
 *    - computed() values are memoized — recalculate only when source signal changes
 *
 * 2. In-memory cache (_tasks signal):
 *    - Storage is read ONCE on initialize(), then all operations go through memory
 *    - Writes go to storage asynchronously — UI updates immediately (optimistic)
 *
 * 3. Immutable updates via spread:
 *    - map/filter return new arrays → Angular detects reference change efficiently
 *    - No deep diffing required
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly repository = inject(TaskRepository);

  private readonly _tasks = signal<Task[]>([]);
  private _initialized = false;

  // Public read-only views — consumed by components as signals (zero subscriptions)
  readonly tasks = this._tasks.asReadonly();

  readonly pendingTasks = computed(() =>
    this._tasks().filter(t => !t.completed)
  );

  readonly completedTasks = computed(() =>
    this._tasks().filter(t => t.completed)
  );

  readonly totalCount    = computed(() => this._tasks().length);
  readonly completedCount = computed(() => this._tasks().filter(t => t.completed).length);

  /** Idempotent — safe to call multiple times from guards */
  async initialize(): Promise<void> {
    if (this._initialized) return;
    const tasks = await this.repository.getAll();
    this._tasks.set(tasks);
    this._initialized = true;
  }

  async create(dto: CreateTaskDTO): Promise<Task> {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: dto.title.trim(),
      completed: false,
      categoryId: dto.categoryId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Prepend so newest tasks appear first — O(n) but acceptable for task lists
    const updated = [newTask, ...this._tasks()];
    this._tasks.set(updated);
    await this.repository.saveAll(updated);
    return newTask;
  }

  async toggleComplete(id: string): Promise<void> {
    const updated = this._tasks().map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
    );
    this._tasks.set(updated);
    await this.repository.saveAll(updated);
  }

  async update(id: string, dto: UpdateTaskDTO): Promise<void> {
    const updated = this._tasks().map(t =>
      t.id === id ? { ...t, ...dto, updatedAt: Date.now() } : t
    );
    this._tasks.set(updated);
    await this.repository.saveAll(updated);
  }

  async delete(id: string): Promise<void> {
    const updated = this._tasks().filter(t => t.id !== id);
    this._tasks.set(updated);
    await this.repository.saveAll(updated);
  }

  /**
   * Called by CategoryService on category deletion (Option A: unlink, not delete).
   * Tasks with the deleted categoryId get categoryId set to null.
   */
  async unlinkCategory(categoryId: string): Promise<void> {
    const updated = this._tasks().map(t =>
      t.categoryId === categoryId
        ? { ...t, categoryId: null, updatedAt: Date.now() }
        : t
    );
    this._tasks.set(updated);
    await this.repository.saveAll(updated);
  }
}
