import {
  Component, inject, signal, computed, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonRefresher, IonRefresherContent,
  IonCard, IonCardContent, IonProgressBar, IonNote,
  IonButton, IonButtons,
  IonModal, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';

import { TaskService } from '../../../../core/services/task.service';
import { CategoryService } from '../../../../core/services/category.service';
import { RemoteConfigService } from '../../../../core/services/remote-config.service';
import { FabTriggerService } from '../../../../core/services/fab-trigger.service';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { Task, CreateTaskDTO } from '../../../../core/models/task.model';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
    IonRefresher, IonRefresherContent,
    IonCard, IonCardContent, IonProgressBar, IonNote,
    IonButton, IonButtons,
    IonModal,
    TaskItemComponent,
    TaskFormModalComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>TaskFlow</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="refreshRemoteConfig()" aria-label="Actualizar configuración remota">
            <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      @if (categories().length > 0) {
        <ion-toolbar>
          <div class="chips-scroll">
            <button
              class="filter-chip"
              [class.active]="selectedCategoryId() === 'all'"
              (click)="setFilter('all')">
              Todas
            </button>
            @for (cat of categories(); track cat.id) {
              <button
                class="filter-chip"
                [class.active]="selectedCategoryId() === cat.id"
                [style.background]="selectedCategoryId() === cat.id ? cat.color : ''"
                [style.color]="selectedCategoryId() === cat.id ? '#fff' : ''"
                (click)="setFilter(cat.id)">
                {{ cat.name }}
              </button>
            }
          </div>
        </ion-toolbar>
      }
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Statistics panel — feature flag: show_statistics_panel -->
      @if (showStats()) {
        <ion-card class="stats-card">
          <ion-card-content>
            <div class="stats-row">
              <div class="stat">
                <span class="stat-value">{{ taskService.totalCount() }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ taskService.completedCount() }}</span>
                <span class="stat-label">Hechas</span>
              </div>
              <div class="stat pending">
                <span class="stat-value">{{ pendingCount() }}</span>
                <span class="stat-label">Pendientes</span>
              </div>
            </div>
            <ion-progress-bar
              [value]="progressValue()"
              color="success"
              class="progress-bar">
            </ion-progress-bar>
            <ion-note class="progress-note">
              {{ completionPercent() }}% completado
            </ion-note>
          </ion-card-content>
        </ion-card>
      }

      <!-- Lista de tareas — HTML nativo para evitar shadow DOM anidado en ion-router-outlet -->
      <div class="tasks-list">
        @for (task of filteredTasks(); track task.id) {
          <app-task-item
            [task]="task"
            [category]="getCategory(task.categoryId)"
            (toggle)="toggleTask($event)"
            (edit)="openEditModal($event)"
            (delete)="confirmDelete($event)">
          </app-task-item>
        } @empty {
          <div class="empty-state">
            <p class="empty-icon">📋</p>
            <h3>{{ emptyMessage() }}</h3>
            <p>{{ emptySubtitle() }}</p>
          </div>
        }
      </div>

      <div class="fab-spacer"></div>
    </ion-content>

    <!-- Inline modal — evita ModalController y problemas de animación en standalone -->
    <ion-modal
      [isOpen]="isModalOpen()"
      [breakpoints]="[0, 0.6, 1]"
      [initialBreakpoint]="0.6"
      [handle]="true"
      (ionModalDidDismiss)="onModalDismiss()">
      <ng-template>
        <app-task-form-modal
          [task]="taskToEdit()"
          [categories]="categories()"
          (confirm)="onFormConfirm($event)"
          (cancel)="onModalDismiss()">
        </app-task-form-modal>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .chips-scroll {
      display: flex;
      overflow-x: auto;
      padding: 6px 8px;
      gap: 4px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .chips-scroll::-webkit-scrollbar { display: none; }

    .filter-chip {
      flex-shrink: 0;
      border: none;
      background: rgba(0,0,0,0.07);
      color: #374151;
      font-size: 13px;
      font-weight: 500;
      padding: 5px 14px;
      border-radius: 16px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s, font-weight 0.15s;
      white-space: nowrap;
    }
    .filter-chip.active { font-weight: 700; background: var(--ion-color-primary); color: #fff; }

    .tasks-list {
      background: white;
      border-radius: 12px;
      margin: 8px 0;
      overflow: hidden;
    }

    .stats-card {
      margin: 12px 16px 4px;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .stats-row {
      display: flex;
      justify-content: space-around;
      margin-bottom: 16px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--ion-color-primary);
      line-height: 1;
    }
    .stat.pending .stat-value { color: var(--ion-color-warning); }
    .stat-label {
      font-size: 11px;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
    }
    .progress-bar { border-radius: 4px; height: 6px; margin: 0; }
    .progress-note {
      display: block;
      text-align: right;
      margin-top: 6px;
      font-size: 12px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 72px 32px;
      text-align: center;
      color: var(--ion-color-medium);
    }
    .empty-icon { font-size: 52px; margin: 0 0 12px; }
    .empty-state h3 { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: var(--ion-color-dark); }
    .empty-state p { margin: 0; font-size: 14px; }

    .fab-spacer { height: 80px; }
  `]
})
export class TaskListPage implements OnDestroy {
  readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly remoteConfig = inject(RemoteConfigService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly fabTrigger = inject(FabTriggerService);
  private fabSub?: Subscription;

  readonly categories = this.categoryService.categories;
  readonly showStats = this.remoteConfig.showStatisticsPanel;

  readonly selectedCategoryId = signal<string>('all');
  readonly isModalOpen   = signal(false);
  readonly taskToEdit    = signal<Task | null>(null);

  readonly pendingCount = computed(() => this.taskService.pendingTasks().length);

  readonly progressValue = computed(() => {
    const total = this.taskService.totalCount();
    return total === 0 ? 0 : this.taskService.completedCount() / total;
  });

  readonly completionPercent = computed(() =>
    Math.round(this.progressValue() * 100)
  );

  readonly filteredTasks = computed(() => {
    const id  = this.selectedCategoryId();
    const all = this.taskService.tasks();
    return id === 'all' ? all : all.filter(t => t.categoryId === id);
  });

  readonly emptyMessage = computed(() =>
    this.selectedCategoryId() === 'all'
      ? 'Sin tareas aún'
      : 'Sin tareas en esta categoría'
  );

  readonly emptySubtitle = computed(() =>
    this.selectedCategoryId() === 'all'
      ? 'Toca + para agregar tu primera tarea'
      : 'Toca + para agregar una tarea aquí'
  );

  constructor() {
    addIcons({ refreshOutline });
  }

  ionViewWillEnter(): void {
    this.fabSub = this.fabTrigger.trigger$.subscribe(() => this.openCreateModal());
  }

  ionViewWillLeave(): void {
    this.fabSub?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.fabSub?.unsubscribe();
  }

  getCategory(categoryId: string | null): Category | undefined {
    if (!categoryId) return undefined;
    return this.categoryService.findById(categoryId);
  }

  setFilter(id: string): void {
    this.selectedCategoryId.set(id);
  }

  async toggleTask(id: string): Promise<void> {
    await this.taskService.toggleComplete(id);
  }

  openCreateModal(): void {
    this.taskToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    this.taskToEdit.set(task);
    this.isModalOpen.set(true);
  }

  onModalDismiss(): void {
    this.isModalOpen.set(false);
    this.taskToEdit.set(null);
  }

  async onFormConfirm(data: CreateTaskDTO): Promise<void> {
    const editing = this.taskToEdit();
    this.onModalDismiss();
    if (editing) {
      await this.taskService.update(editing.id, data);
      this.showToast('Tarea actualizada ✓');
    } else {
      await this.taskService.create(data);
      this.showToast('Tarea agregada ✓');
    }
  }

  async confirmDelete(id: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-danger',
          handler: async () => {
            await this.taskService.delete(id);
            this.showToast('Tarea eliminada');
          },
        },
      ],
    });
    await alert.present();
  }

  async refreshRemoteConfig(): Promise<void> {
    await this.remoteConfig.refresh();
    this.showToast('Configuración remota actualizada');
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.remoteConfig.refresh();
    (event.target as HTMLIonRefresherElement).complete();
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
