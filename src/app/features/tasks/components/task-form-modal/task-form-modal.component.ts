import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Task, CreateTaskDTO } from '../../../../core/models/task.model';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IonSelect, IonSelectOption],
  template: `
    <div class="modal-container">

      <div class="modal-header">
        <button class="action-btn" (click)="onCancel()">Cancelar</button>
        <span class="modal-title">{{ isEditing ? 'Editar tarea' : 'Nueva tarea' }}</span>
        <button class="action-btn action-btn-bold" (click)="onSubmit()" [disabled]="form.invalid">
          {{ isEditing ? 'Guardar' : 'Agregar' }}
        </button>
      </div>

      <div class="modal-body">
        <form [formGroup]="form">

          <div class="field-card">
            <span class="field-label">Nombre de la tarea *</span>
            <input
              class="field-input"
              type="text"
              formControlName="title"
              placeholder="¿Qué necesitas hacer?"
              autocapitalize="sentences"
              autocomplete="off">
          </div>

          @if (categories.length > 0) {
            <div class="field-card">
              <span class="field-label">Categoría</span>
              <ion-select
                class="field-select"
                formControlName="categoryId"
                placeholder="Sin categoría"
                interface="popover">
                <ion-select-option [value]="null">Sin categoría</ion-select-option>
                @for (cat of categories; track cat.id) {
                  <ion-select-option [value]="cat.id">{{ cat.name }}</ion-select-option>
                }
              </ion-select>
            </div>
          }

        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }

    .modal-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f0f2ff;
      border-radius: 16px 16px 0 0;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px;
      background: var(--ion-color-primary, #6366f1);
      height: 56px;
      flex-shrink: 0;
      border-radius: 16px 16px 0 0;
    }

    .modal-title {
      font-size: 17px;
      font-weight: 600;
      color: white;
    }

    .action-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.9);
      font-size: 15px;
      cursor: pointer;
      padding: 8px 14px;
      border-radius: 8px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.12); }
    .action-btn-bold { font-weight: 700; color: white; }
    .action-btn:disabled { opacity: 0.35; cursor: default; }

    .modal-body {
      flex: 1;
      overflow-y: auto;
    }

    .field-card {
      background: white;
      border-radius: 14px;
      margin: 16px 16px 10px;
      padding: 14px 16px 14px;
      box-shadow: 0 1px 8px rgba(99, 102, 241, 0.09);
    }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--ion-color-primary, #6366f1);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 10px;
    }

    .field-input {
      display: block;
      width: 100%;
      border: none;
      outline: none;
      font-size: 16px;
      color: #111827;
      background: transparent;
      font-family: inherit;
      padding: 0;
      box-sizing: border-box;
      min-height: 36px;
    }
    .field-input::placeholder { color: #9ca3af; }

    .field-select {
      --placeholder-color: #9ca3af;
      --padding-start: 0;
      --padding-end: 0;
      font-size: 16px;
      width: 100%;
      min-height: 36px;
      color: #111827;
    }
  `]
})
export class TaskFormModalComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() categories: Category[] = [];

  @Output() confirm = new EventEmitter<CreateTaskDTO>();
  @Output() cancel  = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEditing = false;

  ngOnInit(): void {
    this.isEditing = !!this.task;
    this.form = this.fb.group({
      title:      [this.task?.title ?? '',  [Validators.required, Validators.minLength(1)]],
      categoryId: [this.task?.categoryId ?? null],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.confirm.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
