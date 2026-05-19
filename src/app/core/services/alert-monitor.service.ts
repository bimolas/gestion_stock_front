import { Injectable, inject, OnDestroy } from '@angular/core';
import { InventoryService } from './inventory.service';
import { ToastService } from './toast.service';
import { interval, Subscription, switchMap, catchError, of, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertMonitorService implements OnDestroy {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  
  private knownAlertIds = new Set<number>();
  private sub?: Subscription;

  startMonitoring() {
    if (this.sub) return;
    
    // Check immediately, then every 30 seconds
    this.sub = timer(0, 30000).pipe(
      switchMap(() => this.inventoryService.getOpenAlerts().pipe(
        catchError(() => of([]))
      ))
    ).subscribe(alerts => {
      alerts.forEach(alert => {
        if (!this.knownAlertIds.has(alert.id)) {
          this.knownAlertIds.add(alert.id);
          
          // Only pop toasts for newly discovered alerts
          if (alert.type === 'LOW_STOCK') {
             this.toastService.warning('Low Stock Alert', alert.title);
          } else if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
             this.toastService.error('Critical Alert', alert.title);
          } else {
             this.toastService.info('System Alert', alert.title);
          }
        }
      });
      
      // Cleanup resolved alerts from known set
      const currentIds = new Set(alerts.map(a => a.id));
      for (const id of this.knownAlertIds) {
        if (!currentIds.has(id)) {
          this.knownAlertIds.delete(id);
        }
      }
    });
  }

  stopMonitoring() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }

  ngOnDestroy() {
    this.stopMonitoring();
  }
}
