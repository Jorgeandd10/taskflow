import { Routes } from '@angular/router';
import { appReadyGuard } from './core/guards/app-ready.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    canActivate: [appReadyGuard],
    loadComponent: () =>
      import('./features/tasks/pages/task-list/task-list.page').then(m => m.TaskListPage),
  },
  {
    path: 'categories',
    canActivate: [appReadyGuard],
    loadComponent: () =>
      import('./features/categories/pages/category-list/category-list.page').then(m => m.CategoryListPage),
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
