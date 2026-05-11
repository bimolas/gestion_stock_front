import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Alert, DashboardStats } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, switchMap, catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-4xl font-display font-extrabold tracking-tight text-primary leading-none">System Alerts</h1>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        @if (isLoading()) {
          <div class="p-20 text-center flex flex-col items-center justify-center">
             <div class="w-16 h-16 border-4 border-neutral-100 border-t-primary rounded-full animate-spin mb-6"></div>
             <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Scanning Intelligence...</p>
          </div>
        } @else if (alerts().length === 0) {
          <div class="p-20 text-center flex flex-col items-center justify-center">
            @if (stats() && stats()!.outOfStock > 0) {
              <mat-icon class="text-6xl text-amber-500 mb-6">warning_amber</mat-icon>
              <h3 class="text-lg font-bold text-primary">{{ stats()?.outOfStock }} Articles are Out of Stock</h3>
              <p class="text-sm text-neutral-400 font-medium mt-1">Alerts will be generated as stock watchdog triggers during movements.</p>
              <button routerLink="/app/articles" class="mt-8 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">
                Review Inventory
              </button>
            } @else {
              <mat-icon class="text-6xl text-emerald-500 mb-6">workspace_premium</mat-icon>
              <h3 class="text-lg font-bold text-primary">System is Healthy</h3>
              <p class="text-sm text-neutral-400 font-medium mt-1">No open alerts detected.</p>
            }
          </div>
        } @else {
          <div class="divide-y divide-neutral-50">
            @for (alert of alerts(); track alert.id) {
              <div 
                [routerLink]="['/app/alerts', alert.id]"
                class="p-8 flex items-start gap-8 transition-all hover:bg-neutral-50 cursor-pointer group"
              >
                <div [class]="getAlertBgClass(alert.severity)" class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner">
                   <mat-icon [class]="getAlertTextClass(alert.severity)">{{ alert.type === 'LOW_STOCK' ? 'inventory_2' : 'analytics' }}</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-4 mb-2">
                    <h3 class="text-lg font-bold text-primary truncate group-hover:text-accent transition-colors">{{ alert.title }}</h3>
                    <div class="flex items-center gap-3">
                       <span [class]="getAlertTextClass(alert.severity)" class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white border border-neutral-100 shadow-sm">{{ alert.severity }}</span>
                       <span class="text-xs font-bold text-neutral-400 whitespace-nowrap">{{ alert.createdAt | date:'shortTime' }} • {{ alert.createdAt | date:'MMM d' }}</span>
                    </div>
                  </div>
                  <p class="text-neutral-500 font-medium leading-relaxed line-clamp-2">{{ alert.content }}</p>
                </div>
                <!-- Action button stub -->
                <div class="shrink-0 flex items-center h-14 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div class="w-10 h-10 border border-neutral-100 rounded-full flex items-center justify-center text-neutral-300 group-hover:text-primary transition-colors bg-white">
                      <mat-icon class="scale-75 translate-x-px">arrow_forward_ios</mat-icon>
                   </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  
  alerts = signal<Alert[]>([]);
  isLoading = signal(true);
  stats = signal<DashboardStats | null>(null);
  private refresh$ = new BehaviorSubject<void>(undefined);

  ngOnInit() {
    this.refresh$.pipe(
      switchMap(() => forkJoin({
        alerts: this.inventoryService.getOpenAlerts().pipe(catchError(() => of([]))),
        stats: this.inventoryService.getDashboardStats().pipe(catchError(() => of(null)))
      }))
    ).subscribe({
      next: ({ alerts, stats }) => {
        const sorted = alerts.sort((a: Alert, b: Alert) => {
           const s: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
           return (s[b.severity] || 0) - (s[a.severity] || 0);
        });
        this.alerts.set(sorted);
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getAlertBgClass(severity: string) {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'bg-red-50';
    if (severity === 'MEDIUM') return 'bg-amber-50';
    return 'bg-blue-50';
  }

  getAlertTextClass(severity: string) {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'text-red-600';
    if (severity === 'MEDIUM') return 'text-amber-600';
    return 'text-blue-600';
  }
}
