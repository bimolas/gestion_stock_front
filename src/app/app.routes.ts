import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ]
  },
  {
    path: 'app',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./features/articles/articles.component').then(m => m.ArticlesComponent)
      },
      {
        path: 'articles/:id',
        loadComponent: () => import('./features/articles/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent)
      },
      {
        path: 'suppliers/:id',
        loadComponent: () => import('./features/suppliers/supplier-detail.component').then(m => m.SupplierDetailComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'notifications/:id',
        loadComponent: () => import('./features/notifications/notification-detail.component').then(m => m.NotificationDetailComponent)
      },
      {
        path: 'entries',
        loadComponent: () => import('./features/entries/stock-entries.component').then(m => m.StockEntriesComponent)
      },
      {
        path: 'entries/:id',
        loadComponent: () => import('./features/entries/entry-detail.component').then(m => m.EntryDetailComponent)
      },
      {
        path: 'exits',
        loadComponent: () => import('./features/exits/stock-exits.component').then(m => m.StockExitsComponent)
      },
      {
        path: 'exits/:id',
        loadComponent: () => import('./features/exits/exit-detail.component').then(m => m.ExitDetailComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'categories/:id',
        loadComponent: () => import('./features/categories/category-detail.component').then(m => m.CategoryDetailComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./features/alerts/alerts.component').then(m => m.AlertsComponent)
      },
      {
        path: 'alerts/:id',
        loadComponent: () => import('./features/alerts/alert-detail.component').then(m => m.AlertDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
