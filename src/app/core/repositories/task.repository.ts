import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Task } from '../models/task.model';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

@Injectable({ providedIn: 'root' })
export class TaskRepository {
  private readonly storage = inject(Storage);

  async getAll(): Promise<Task[]> {
    try {
      const tasks = await this.storage.get(STORAGE_KEYS.TASKS);
      return tasks ?? [];
    } catch (error) {
      console.error('[TaskRepository] Error reading tasks:', error);
      return [];
    }
  }

  async saveAll(tasks: Task[]): Promise<void> {
    try {
      await this.storage.set(STORAGE_KEYS.TASKS, tasks);
    } catch (error) {
      console.error('[TaskRepository] Error saving tasks:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.storage.remove(STORAGE_KEYS.TASKS);
    } catch (error) {
      console.error('[TaskRepository] Error clearing tasks:', error);
      throw error;
    }
  }
}
