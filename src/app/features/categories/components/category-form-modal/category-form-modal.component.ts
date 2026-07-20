import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CreateCategoryDTO, DEFAULT_CATEGORY_COLORS } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="modal-container">

      <div class="modal-header">
        <button class="action-btn" (click)="onCancel()">Cancelar</button>
        <span class="modal-title">{{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}</span>
        <button class="action-btn action-btn-bold" (click)="onSubmit()" [disabled]="form.invalid">
          {{ isEditing ? 'Guardar' : 'Crear' }}
        </button>
      </div>

      <div class="modal-body">
        <form [formGroup]="form">

          <div class="field-card">
            <span class="field-label">Nombre *</span>
            <input
              class="field-input"
              type="text"
              formControlName="name"
              placeholder="p.ej. Trabajo, Personal, Compras..."
              autocapitalize="sentences"
              autocomplete="off">
          </div>

          <div class="field-card">
            <span class="field-label">Color</span>
            <div class="color-grid">
              @for (color of colors; track color) {
                <button
                  type="button"
                  class="color-swatch"
                  [class.selected]="form.get('color')?.value === color"
                  [style.background]="color"
                  (click)="selectColor(color)"
                  [attr.aria-label]="'Color ' + color">
                  @if (form.get('color')?.value === color) {
                    <span class="checkmark">✓</span>
                  }
                </button>
              }
            </div>
          </div>

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

    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      padding: 4px 0;
    }

    .color-swatch {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 3px solid transparent;
      outline: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .color-swatch.selected {
      border-color: rgba(0,0,0,0.25);
      transform: scale(1.2);
    }
    .checkmark {
      color: white;
      font-size: 18px;
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }
  `]
})
export class CategoryFormModalComponent implements OnInit {
  @Input() category: Category | null = null;

  @Output() confirm = new EventEmitter<CreateCategoryDTO>();
  @Output() cancel  = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEditing = false;
  readonly colors = DEFAULT_CATEGORY_COLORS;

  ngOnInit(): void {
    this.isEditing = !!this.category;
    this.form = this.fb.group({
      name:  [this.category?.name  ?? '',             [Validators.required, Validators.minLength(1)]],
      color: [this.category?.color ?? this.colors[0], Validators.required],
    });
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.confirm.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
