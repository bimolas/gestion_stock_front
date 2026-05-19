import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Alert } from '../../core/models/api.models';
import { forkJoin, catchError, of } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';

type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">System Alerts</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Inventory Intelligence</p>
        </div>
        <button (click)="loadAll()" class="w-10 h-10 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary hover:border-neutral-200 transition-all" title="Refresh">
          <span class="material-symbols-rounded text-lg">refresh</span>
        </button>
      </div>

      <!-- Stat cards / tab switcher -->
      <div class="grid grid-cols-3 gap-4">
        @for (tab of tabs; track tab.value) {
          <button (click)="setTab(tab.value)"
            class="bg-white rounded-[2rem] p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] text-center transition-all hover:shadow-md relative overflow-hidden"
            [class.ring-2]="activeTab() === tab.value"
            [class]="activeTab() === tab.value ? tab.ringClass : ''">
            <p class="text-3xl font-display font-extrabold" [class]="tab.countClass">{{ tabCount(tab.value) }}</p>
            <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">{{ tab.label }}</p>
            @if (activeTab() === tab.value) {
              <div class="absolute bottom-0 left-0 right-0 h-0.5" [class]="tab.barClass"></div>
            }
          </button>
        }
      </div>

      <!-- List -->
      <div class="bg-white rounded-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        @if (isLoading()) {
          <div class="p-20 flex flex-col items-center justify-center">
            <div class="w-12 h-12 border-4 border-neutral-100 border-t-primary rounded-full animate-spin mb-4"></div>
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading...</p>
          </div>
        } @else if (pagedAlerts().length === 0) {
          <div class="p-20 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <span class="material-symbols-rounded text-3xl text-neutral-300">{{ activeTab() === 'OPEN' ? 'check_circle' : 'inbox' }}</span>
            </div>
            <h3 class="text-base font-bold text-primary">{{ activeTab() === 'OPEN' ? 'All clear' : 'Nothing here' }}</h3>
            <p class="text-sm text-neutral-400 mt-1">No {{ activeTab().toLowerCase() }} alerts.</p>
          </div>
        } @else {
          <div class="divide-y divide-neutral-50">
            @for (alert of pagedAlerts(); track alert.id) {
              <div class="flex items-start gap-5 px-8 py-6 hover:bg-neutral-50/60 transition-colors group">

                <!-- Severity dot + icon -->
                <div class="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                  <div class="w-2 h-2 rounded-full" [class]="severityDot(alert.severity)"></div>
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center" [class]="severityIcon(alert.severity)">
                    <span class="material-symbols-rounded text-base">{{ alert.type === 'LOW_STOCK' ? 'inventory_2' : 'link_off' }}</span>
                  </div>
                </div>

                <!-- Content -->
                <div [routerLink]="['/app/alerts', alert.id]" class="flex-1 min-w-0 cursor-pointer">
                  <div class="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 class="text-sm font-bold text-primary group-hover:text-accent transition-colors truncate">{{ alert.title }}</h3>
                    <span class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0" [class]="severityBadge(alert.severity)">
                      {{ alert.severity }}
                    </span>
                    <span class="text-[10px] text-neutral-400 font-medium shrink-0 ml-auto">{{ alert.createdAt | date:'MMM d, HH:mm' }}</span>
                  </div>
                  <p class="text-xs text-neutral-500 leading-relaxed line-clamp-1">{{ alert.content }}</p>
                </div>

                <!-- Actions -->
                <div class="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  @if (alert.status === 'OPEN') {
                    <button (click)="acknowledge(alert.id)" title="Acknowledge"
                      class="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-amber-100 hover:text-amber-700 transition-all flex items-center justify-center">
                      <span class="material-symbols-rounded text-sm">visibility</span>
                    </button>
                    <button (click)="resolve(alert.id)" title="Resolve"
                      class="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center justify-center">
                      <span class="material-symbols-rounded text-sm">check</span>
                    </button>
                  }
                  @if (alert.status === 'ACKNOWLEDGED') {
                    <button (click)="resolve(alert.id)" title="Resolve"
                      class="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center justify-center">
                      <span class="material-symbols-rounded text-sm">check_circle</span>
                    </button>
                  }
                  @if (alert.status === 'RESOLVED') {
                    <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                      <span class="material-symbols-rounded text-sm">verified</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-8 py-5 border-t border-neutral-50 flex items-center justify-between">
              <p class="text-xs text-neutral-400 font-medium">
                Showing {{ pageStart() }}–{{ pageEnd() }} of {{ filteredAlerts().length }}
              </p>
              <div class="flex items-center gap-2">
                <button (click)="prevPage()" [disabled]="page() === 0"
                  class="w-8 h-8 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary hover:border-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <span class="material-symbols-rounded text-sm">chevron_left</span>
                </button>
                @for (p of pageNumbers(); track p) {
                  <button (click)="setPage(p)"
                    class="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                    [class.bg-primary]="page() === p"
                    [class.text-white]="page() === p"
                    [class.border]="page() !== p"
                    [class.border-neutral-100]="page() !== p"
                    [class.text-neutral-400]="page() !== p"
                    [class.hover:border-neutral-200]="page() !== p">
                    {{ p + 1 }}
                  </button>
                }
                <button (click)="nextPage()" [disabled]="page() === totalPages() - 1"
                  class="w-8 h-8 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary hover:border-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <span class="material-symbols-rounded text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);

  allAlerts = signal<Alert[]>([]);
  isLoading = signal(true);
  activeTab = signal<AlertStatus>('OPEN');
  page = signal(0);

  tabs = [
    { value: 'OPEN' as AlertStatus,         label: 'Open',         countClass: 'text-red-500',     ringClass: 'ring-red-300',     barClass: 'bg-red-400' },
    { value: 'ACKNOWLEDGED' as AlertStatus, label: 'Acknowledged', countClass: 'text-amber-500',   ringClass: 'ring-amber-300',   barClass: 'bg-amber-400' },
    { value: 'RESOLVED' as AlertStatus,     label: 'Resolved',     countClass: 'text-emerald-600', ringClass: 'ring-emerald-300', barClass: 'bg-emerald-500' },
  ];

  tabCount(status: AlertStatus) { return this.allAlerts().filter(a => a.status === status).length; }

  filteredAlerts = computed(() =>
    this.allAlerts()
      .filter(a => a.status === this.activeTab())
      .sort((a, b) => {
        const s: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (s[b.severity] || 0) - (s[a.severity] || 0);
      })
  );

  totalPages = computed(() => Math.ceil(this.filteredAlerts().length / PAGE_SIZE));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));
  pagedAlerts = computed(() => this.filteredAlerts().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  pageStart = computed(() => this.page() * PAGE_SIZE + 1);
  pageEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredAlerts().length));

  ngOnInit() { this.loadAll(); }

  setTab(tab: AlertStatus) { this.activeTab.set(tab); this.page.set(0); }
  setPage(p: number) { this.page.set(p); }
  prevPage() { if (this.page() > 0) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }

  loadAll() {
    this.isLoading.set(true);
    forkJoin({
      open:     this.inventoryService.getOpenAlerts().pipe(catchError(() => of([]))),
      ack:      this.inventoryService.getAlertsByStatus('ACKNOWLEDGED').pipe(catchError(() => of([]))),
      resolved: this.inventoryService.getAlertsByStatus('RESOLVED').pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ open, ack, resolved }) => {
        this.allAlerts.set([...open, ...ack, ...resolved]);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  acknowledge(id: number) {
    this.inventoryService.acknowledgeAlert(id).subscribe({
      next: (updated) => {
        this.allAlerts.update(a => a.map(x => x.id === id ? updated : x));
        this.toastService.info('Acknowledged', 'Alert marked as acknowledged.');
      }
    });
  }

  resolve(id: number) {
    this.inventoryService.resolveAlert(id).subscribe({
      next: (updated) => {
        this.allAlerts.update(a => a.map(x => x.id === id ? updated : x));
        this.toastService.success('Resolved', 'Alert marked as resolved.');
      }
    });
  }

  severityDot(s: string) {
    return { CRITICAL: 'bg-red-500', HIGH: 'bg-orange-400', MEDIUM: 'bg-amber-400', LOW: 'bg-blue-400' }[s] ?? 'bg-neutral-300';
  }
  severityIcon(s: string) {
    return { CRITICAL: 'bg-red-50 text-red-500', HIGH: 'bg-orange-50 text-orange-500', MEDIUM: 'bg-amber-50 text-amber-600', LOW: 'bg-blue-50 text-blue-500' }[s] ?? 'bg-neutral-50 text-neutral-400';
  }
  severityBadge(s: string) {
    return { CRITICAL: 'bg-red-50 text-red-600', HIGH: 'bg-orange-50 text-orange-600', MEDIUM: 'bg-amber-50 text-amber-700', LOW: 'bg-blue-50 text-blue-600' }[s] ?? 'bg-neutral-50 text-neutral-500';
  }
}
