import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="task-row" [class.completed]="task.completed">

      <button class="check-btn" [class.checked]="task.completed"
              (click)="onToggle()" aria-label="Marcar como completada">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          @if (task.completed) {
            <polyline points="20 6 9 17 4 12"></polyline>
          }
        </svg>
      </button>

      <div class="task-info">
        <span class="task-title" [class.done]="task.completed">{{ task.title }}</span>
        @if (category) {
          <span class="cat-pill" [style.background]="category.color">{{ category.name }}</span>
        }
      </div>

      <div class="task-actions">
        <button class="act-btn" (click)="onEdit()" aria-label="Editar tarea">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="act-btn danger" (click)="onDelete()" aria-label="Eliminar tarea">
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
  `,
  styles: [`
    :host { display: block; }

    .task-row {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.07);
      background: white;
      transition: opacity 0.25s ease, background 0.25s ease;
    }
    .task-row.completed {
      background: #f8f9ff;
      opacity: 0.6;
    }

    .check-btn {
      width: 26px;
      height: 26px;
      min-width: 26px;
      border-radius: 50%;
      border: 2px solid var(--ion-color-primary, #6366f1);
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: background 0.15s, border-color 0.15s;
      color: white;
    }
    .check-btn.checked {
      background: var(--ion-color-primary, #6366f1);
    }
    .check-btn svg { width: 12px; height: 12px; }

    .task-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-title {
      font-size: 15px;
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .task-title.done {
      text-decoration: line-through;
      color: #9ca3af;
    }

    .cat-pill {
      align-self: flex-start;
      font-size: 10px;
      font-weight: 600;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      letter-spacing: 0.03em;
    }

    .task-actions { display: flex; gap: 2px; flex-shrink: 0; }

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
  `]
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() category: Category | undefined;

  @Output() toggle = new EventEmitter<string>();
  @Output() edit   = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();

  onToggle(): void { this.toggle.emit(this.task.id); }
  onEdit():   void { this.edit.emit(this.task); }
  onDelete(): void { this.delete.emit(this.task.id); }
}
