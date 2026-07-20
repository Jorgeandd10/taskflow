import { Injectable, inject, signal, computed } from '@angular/core';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly repository = inject(CategoryRepository);
  private readonly taskService = inject(TaskService);

  private readonly _categories = signal<Category[]>([]);
  private _initialized = false;

  readonly categories = this._categories.asReadonly();
  readonly totalCount = computed(() => this._categories().length);

  findById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;
    const categories = await this.repository.getAll();
    this._categories.set(categories);
    this._initialized = true;
  }

  async create(dto: CreateCategoryDTO): Promise<Category> {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      color: dto.color,
      createdAt: Date.now(),
    };
    const updated = [...this._categories(), newCategory];
    this._categories.set(updated);
    await this.repository.saveAll(updated);
    return newCategory;
  }

  async update(id: string, dto: UpdateCategoryDTO): Promise<void> {
    const updated = this._categories().map(c =>
      c.id === id ? { ...c, ...dto } : c
    );
    this._categories.set(updated);
    await this.repository.saveAll(updated);
  }

  // Option A: unlink tasks from deleted category before removing it
  async delete(id: string): Promise<void> {
    await this.taskService.unlinkCategory(id);
    const updated = this._categories().filter(c => c.id !== id);
    this._categories.set(updated);
    await this.repository.saveAll(updated);
  }

  getTaskCount(categoryId: string): number {
    return this.taskService.tasks().filter(t => t.categoryId === categoryId).length;
  }
}
