import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TaskService } from './task.service';
import { CategoryService } from './category.service';
import { RemoteConfigService } from './remote-config.service';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  private readonly storage = inject(Storage);
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly remoteConfig = inject(RemoteConfigService);

  private _ready = false;
  private _initPromise: Promise<void> | null = null;

  /**
   * Idempotent: safe to call multiple times (e.g., from route guards).
   * Returns the same promise if initialization is already in progress.
   */
  initialize(): Promise<void> {
    if (this._ready) return Promise.resolve();
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._doInit().then(() => {
      this._ready = true;
    });

    return this._initPromise;
  }

  private async _doInit(): Promise<void> {
    // 1. Storage engine must be ready before any read/write
    await this.storage.create();

    // 2. Load persisted data in parallel — faster boot
    await Promise.all([
      this.taskService.initialize(),
      this.categoryService.initialize(),
    ]);

    // 3. Remote Config: non-blocking — defaults already set via signals
    this.remoteConfig.initialize().catch(err =>
      console.warn('[AppInit] Remote config failed (non-fatal):', err)
    );
  }
}
