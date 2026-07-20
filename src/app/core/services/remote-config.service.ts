import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig,
} from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

/**
 * FEATURE FLAG: show_statistics_panel
 *
 * Purpose: Controls the visibility of the task statistics panel
 * on the home screen. When enabled, users see:
 *   - Total tasks count
 *   - Completed tasks count
 *   - Pending tasks count
 *   - Progress bar with completion percentage
 *
 * Default value: false (panel hidden by default)
 * Remote Config key: show_statistics_panel (Boolean)
 *
 * How to demonstrate during evaluation:
 *   1. Open Firebase Console → Remote Config
 *   2. Set show_statistics_panel = true → Publish
 *   3. In the app: tap the refresh icon (top-right) or pull-to-refresh
 *   4. The statistics panel appears immediately
 *   5. Set back to false → Publish → refresh → panel disappears
 *
 * PERFORMANCE NOTE:
 *   Remote Config is fetched AFTER the UI renders (non-blocking).
 *   The default value (false) is applied instantly via signal.
 *   This prevents Firebase latency from delaying the initial render.
 */

const RC_DEFAULTS = {
  show_statistics_panel: false,
} as const;

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private remoteConfig: RemoteConfig | null = null;
  private _fetchInProgress = false;

  /**
   * Public signal consumed directly in templates via @if(showStatisticsPanel()).
   * No subscription, no async pipe, no memory leak risk.
   */
  readonly showStatisticsPanel = signal<boolean>(RC_DEFAULTS.show_statistics_panel);

  async initialize(): Promise<void> {
    if (this._fetchInProgress) return;
    this._fetchInProgress = true;

    try {
      // Reuse existing Firebase app if already initialized
      const app: FirebaseApp = getApps().length > 0
        ? getApp()
        : initializeApp(environment.firebase);

      const rc = getRemoteConfig(app);

      // Development: 0ms cache (always fresh). Production: 1 hour (Firebase minimum).
      rc.settings.minimumFetchIntervalMillis = environment.production ? 3_600_000 : 0;
      rc.defaultConfig = { ...RC_DEFAULTS };

      await fetchAndActivate(rc);
      this.remoteConfig = rc;
      this._applyValues();
    } catch (error) {
      // Non-fatal: app works with defaults when offline or Firebase is misconfigured
      console.warn('[RemoteConfigService] Using defaults:', error);
    } finally {
      this._fetchInProgress = false;
    }
  }

  /** Manual refresh — used by pull-to-refresh and the toolbar button */
  async refresh(): Promise<void> {
    if (!this.remoteConfig) {
      // Firebase not yet initialized — try a full init
      await this.initialize();
      return;
    }
    try {
      await fetchAndActivate(this.remoteConfig);
      this._applyValues();
    } catch (error) {
      console.warn('[RemoteConfigService] Refresh failed:', error);
    }
  }

  private _applyValues(): void {
    if (!this.remoteConfig) return;
    const val = getValue(this.remoteConfig, 'show_statistics_panel').asBoolean();
    this.showStatisticsPanel.set(val);
  }
}
