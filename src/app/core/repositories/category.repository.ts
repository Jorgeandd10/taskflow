import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Category } from '../models/category.model';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

@Injectable({ providedIn: 'root' })
export class CategoryRepository {
  private readonly storage = inject(Storage);

  async getAll(): Promise<Category[]> {
    try {
      const categories = await this.storage.get(STORAGE_KEYS.CATEGORIES);
      return categories ?? [];
    } catch (error) {
      console.error('[CategoryRepository] Error reading categories:', error);
      return [];
    }
  }

  async saveAll(categories: Category[]): Promise<void> {
    try {
      await this.storage.set(STORAGE_KEYS.CATEGORIES, categories);
    } catch (error) {
      console.error('[CategoryRepository] Error saving categories:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.storage.remove(STORAGE_KEYS.CATEGORIES);
    } catch (error) {
      console.error('[CategoryRepository] Error clearing categories:', error);
      throw error;
    }
  }
}
