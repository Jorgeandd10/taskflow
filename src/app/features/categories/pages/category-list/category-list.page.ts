import {
  Component, inject, signal, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonModal, AlertController, ToastController
} from '@ionic/angular/standalone';

import { CategoryService } from '../../../../core/services/category.service';
import { FabTriggerService } from '../../../../core/services/fab-trigger.service';
import { CategoryFormModalComponent } from '../../components/category-form-modal/category-form-modal.component';
import { Category, CreateCategoryDTO } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonModal,
    CategoryFormModalComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Categorías</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="cat-list">
        @for (cat of categories(); track cat.id) {
          <div class="cat-row">
            <div class="color-dot" [style.background]="cat.color"></div>
            <div class="cat-info">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ taskCount(cat.id) }} tarea(s)</span>
            </div>
            <div class="cat-actions">
              <button class="act-btn" (click)="openEditModal(cat)" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="act-btn danger" (click)="confirmDelete(cat)" aria-label="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p class="empty-icon">🏷️</p>
            <h3>Sin categorías aún</h3>
            <p>Toca + para crear tu primera categoría</p>
          </div>
        }
      </div>
    </ion-content>

    <ion-modal
      [isOpen]="isModalOpen()"
      [breakpoints]="[0, 0.7, 1]"
      [initialBreakpoint]="0.7"
      [handle]="true"
      (ionModalDidDismiss)="onModalDismiss()">
      <ng-template>
        <app-category-form-modal
          [category]="catToEdit()"
          (confirm)="onFormConfirm($event)"
          (cancel)="onModalDismiss()">
        </app-category-form-modal>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .cat-list {
      background: white;
      border-radius: 12px;
      margin: 8px 0;
      overflow: hidden;
    }

    .cat-row {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      gap: 14px;
      border-bottom: 1px solid rgba(0,0,0,0.07);
    }
    .cat-row:last-child { border-bottom: none; }

    .color-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .cat-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cat-name { font-size: 15px; font-weight: 500; color: #1f2937; }
    .cat-count { font-size: 12px; color: #9ca3af; }

    .cat-actions { display: flex; gap: 2px; flex-shrink: 0; }

    .act-btn {
      width: 34px;
      height: 34px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      padding: 7px;
      transition: background 0.15s, color 0.15s;
    }
    .act-btn:hover { background: #f3f4f6; color: var(--ion-color-primary, #6366f1); }
    .act-btn.danger:hover { background: #fef2f2; color: #ef4444; }
    .act-btn svg { width: 16px; height: 16px; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
      color: var(--ion-color-medium);
    }
    .empty-icon { font-size: 48px; margin: 0 0 8px; }
    .empty-state h3 { margin: 0 0 8px; font-size: 18px; color: #1f2937; }
    .empty-state p { margin: 0; font-size: 14px; }
  `]
})
export class CategoryListPage implements OnDestroy {
  private readonly categoryService = inject(CategoryService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly fabTrigger = inject(FabTriggerService);
  private fabSub?: Subscription;

  readonly categories = this.categoryService.categories;
  readonly isModalOpen = signal(false);
  readonly catToEdit   = signal<Category | null>(null);

  ionViewWillEnter(): void {
    this.fabSub = this.fabTrigger.trigger$.subscribe(() => this.openCreateModal());
  }

  ionViewWillLeave(): void {
    this.fabSub?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.fabSub?.unsubscribe();
  }

  taskCount(categoryId: string): number {
    return this.categoryService.getTaskCount(categoryId);
  }

  openCreateModal(): void {
    this.catToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.catToEdit.set(category);
    this.isModalOpen.set(true);
  }

  onModalDismiss(): void {
    this.isModalOpen.set(false);
    this.catToEdit.set(null);
  }

  async onFormConfirm(data: CreateCategoryDTO): Promise<void> {
    const editing = this.catToEdit();
    this.onModalDismiss();
    if (editing) {
      await this.categoryService.update(editing.id, data);
      this.showToast('¡Categoría actualizada!');
    } else {
      await this.categoryService.create(data);
      this.showToast('¡Categoría creada!');
    }
  }

  async confirmDelete(category: Category): Promise<void> {
    const taskCount = this.taskCount(category.id);
    const message = taskCount > 0
      ? `"${category.name}" tiene ${taskCount} tarea(s). Se desvincularán pero no se eliminarán.`
      : `¿Eliminar la categoría "${category.name}"?`;

    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.categoryService.delete(category.id);
            this.showToast('Categoría eliminada');
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }
}
