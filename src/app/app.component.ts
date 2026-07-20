import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar,
  IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, pricetagsOutline, addOutline } from 'ionicons/icons';
import { FabTriggerService } from './core/services/fab-trigger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-app>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>

        <!-- FAB aquí, fuera del shadow DOM de ion-router-outlet → click garantizado -->
        <button class="global-fab" (click)="onFabClick()" aria-label="Agregar">
          <ion-icon name="add-outline"></ion-icon>
        </button>

        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tasks" href="/tasks">
            <ion-icon name="checkmark-circle-outline"></ion-icon>
            <ion-label>Tareas</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="categories" href="/categories">
            <ion-icon name="pricetags-outline"></ion-icon>
            <ion-label>Categorías</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-app>
  `,
  styles: [`
    .global-fab {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--ion-color-primary, #6366f1);
      color: #fff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .global-fab:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    }
    .global-fab:active { transform: scale(0.95); }
    .global-fab ion-icon { font-size: 28px; pointer-events: none; }
  `]
})
export class AppComponent {
  private readonly fabTrigger = inject(FabTriggerService);

  constructor() {
    addIcons({ checkmarkCircleOutline, pricetagsOutline, addOutline });
  }

  onFabClick(): void {
    this.fabTrigger.emit();
  }
}
