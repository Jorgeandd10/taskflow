import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AppInitService } from '../services/app-init.service';

/**
 * Ensures the app (storage + data) is fully initialized before
 * any route renders. Prevents components from reading empty state
 * while storage.create() is still pending.
 */
export const appReadyGuard: CanActivateFn = async () => {
  const appInit = inject(AppInitService);
  await appInit.initialize();
  return true;
};
