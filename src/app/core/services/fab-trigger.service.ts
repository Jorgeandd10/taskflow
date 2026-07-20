import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FabTriggerService {
  readonly trigger$ = new Subject<void>();
  emit(): void { this.trigger$.next(); }
}
