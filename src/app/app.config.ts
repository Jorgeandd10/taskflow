import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js — coalesced events reduce unnecessary CD cycles
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router with lazy-load preloading for faster subsequent navigation
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Ionic
    provideIonicAngular({ mode: 'md' }),

    // Storage — initialized by AppInitService on boot
    importProvidersFrom(IonicStorageModule.forRoot()),
  ],
};
