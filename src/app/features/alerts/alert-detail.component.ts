import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Alert, Article, Supplier } from '../../core/models/api.models';
import { of, catchError } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-8">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 dash-item opacity-0 translate-y-4">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <a routerLink="/app/alerts"
              class="w-9 h-9 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-card">
              <span class="material-symbols-rounded sym-sm">arrow_back</span>
            </a>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">System Alert</p>
          </div>
          <h1 class="text-4xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ alert()?.title || 'Loading...' }}
          </h1>
        </div>

        <div class="flex gap-3">
          @if (alert()?.status === 'OPEN') {
            <button (click)="acknowledge()"
              class="px-5 py-3 bg-white border border-neutral-100 text-primary rounded-2xl font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all flex items-center gap-2 shadow-card">
              <span class="material-symbols-rounded sym-sm">visibility</span>
              Acknowledge
            </button>
            <button (click)="resolve()"
              class="px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-[0_4px_16px_rgba(10,10,10,0.2)] hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2">
              <span class="material-symbols-rounded sym-sm">check_circle</span>
              Mark Resolved
            </button>
          }
          @if (alert()?.status === 'ACKNOWLEDGED') {
            <button (click)="resolve()"
              class="px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-[0_4px_16px_rgba(10,10,10,0.2)] hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2">
              <span class="material-symbols-rounded sym-sm">check_circle</span>
              Mark Resolved
            </button>
          }
          @if (alert()?.status === 'RESOLVED') {
            <div class="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm flex items-center gap-2">
              <span class="material-symbols-rounded sym-sm filled">verified</span>
              Resolved
            </div>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Status card -->
        <div class="bg-white rounded-[2.5rem] p-8 shadow-card dash-item opacity-0 translate-y-4 space-y-6">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center" [class]="severityIconClass()">
            <span class="material-symbols-rounded sym-lg">{{ alert()?.type === 'LOW_STOCK' ? 'inventory_2' : 'link_off' }}</span>
          </div>

          <div class="space-y-5">
            <div>
              <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Severity</p>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" [class]="severityBadgeClass()">
                <span class="w-1.5 h-1.5 rounded-full" [class]="severityDotClass()"></span>
                {{ alert()?.severity }}
              </span>
            </div>
            <div>
              <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
              <p class="text-sm font-bold text-primary">{{ alert()?.status }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Detected</p>
              <p class="text-sm font-bold text-primary">{{ alert()?.createdAt | date:'MMM d, y' }}</p>
              <p class="text-xs text-neutral-400 mt-0.5">{{ alert()?.createdAt | date:'HH:mm' }}</p>
            </div>
            @if (alert()?.resolvedAt) {
              <div>
                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Resolved</p>
                <p class="text-sm font-bold text-emerald-600">{{ alert()?.resolvedAt | date:'MMM d, y, HH:mm' }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Detail + linked entities -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Content -->
          <div class="bg-white rounded-[2.5rem] p-8 shadow-card dash-item opacity-0 translate-y-4">
            <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Alert Details</p>
            <p class="text-base text-neutral-600 font-medium leading-relaxed">{{ alert()?.content }}</p>
          </div>

          <!-- Linked entities -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @if (article()) {
              <a [routerLink]="['/app/articles', article()?.id]"
                class="group bg-white rounded-[2.5rem] p-7 shadow-card hover:shadow-card-hover transition-all dash-item opacity-0 translate-y-4 flex items-center gap-5">
                <div class="w-12 h-12 rounded-2xl bg-neutral-50 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span class="material-symbols-rounded sym-md">inventory_2</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Impacted Article</p>
                  <p class="text-sm font-bold text-primary truncate group-hover:text-accent transition-colors">{{ article()?.name }}</p>
                  <p class="text-xs text-neutral-400 mt-0.5">Stock: {{ article()?.quantity }} units</p>
                </div>
                <span class="material-symbols-rounded sym-sm text-neutral-300 group-hover:text-primary transition-colors">arrow_forward</span>
              </a>
            }
            @if (supplier()) {
              <a [routerLink]="['/app/suppliers', supplier()?.id]"
                class="group bg-white rounded-[2.5rem] p-7 shadow-card hover:shadow-card-hover transition-all dash-item opacity-0 translate-y-4 flex items-center gap-5">
                <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <span class="material-symbols-rounded sym-md">business</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Primary Supplier</p>
                  <p class="text-sm font-bold text-primary truncate group-hover:text-accent transition-colors">{{ supplier()?.name }}</p>
                  <p class="text-xs text-neutral-400 mt-0.5">{{ supplier()?.contact }}</p>
                </div>
                <span class="material-symbols-rounded sym-sm text-neutral-300 group-hover:text-primary transition-colors">arrow_forward</span>
              </a>
            }
          </div>

          <!-- Recommendation -->
          <div class="bg-primary rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(10,10,10,0.15)] dash-item opacity-0 translate-y-4 flex gap-6 items-start">
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <span class="material-symbols-rounded sym-lg text-white">lightbulb</span>
            </div>
            <div>
              <p class="text-sm font-black text-white uppercase tracking-widest mb-2">Recommended Action</p>
              <p class="text-sm text-white/70 font-medium leading-relaxed">
                @if (alert()?.type === 'LOW_STOCK') {
                  Initiate a new stock entry from <strong class="text-white">{{ supplier()?.name || 'the primary supplier' }}</strong> to restore healthy inventory levels for this article.
                } @else {
                  Verify external logistics and update the expected delivery date for pending orders from this supplier.
                }
              </p>
              <a [routerLink]="alert()?.type === 'LOW_STOCK' ? '/app/entries' : '/app/suppliers'"
                class="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-white text-primary rounded-xl font-bold text-xs hover:bg-neutral-100 transition-all active:scale-95">
                {{ alert()?.type === 'LOW_STOCK' ? 'Create Stock Entry' : 'View Supplier' }}
                <span class="material-symbols-rounded sym-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);

  alert = signal<Alert | null>(null);
  article = signal<Article | null>(null);
  supplier = signal<Supplier | null>(null);

  severityIconClass = computed(() => {
    const s = this.alert()?.severity ?? 'LOW';
    return ({ CRITICAL: 'bg-red-50 text-red-500', HIGH: 'bg-orange-50 text-orange-500', MEDIUM: 'bg-amber-50 text-amber-600', LOW: 'bg-blue-50 text-blue-500' } as Record<string,string>)[s] ?? 'bg-neutral-50 text-neutral-400';
  });

  severityBadgeClass = computed(() => {
    const s = this.alert()?.severity ?? 'LOW';
    return ({ CRITICAL: 'bg-red-50 text-red-600', HIGH: 'bg-orange-50 text-orange-600', MEDIUM: 'bg-amber-50 text-amber-700', LOW: 'bg-blue-50 text-blue-600' } as Record<string,string>)[s] ?? 'bg-neutral-50 text-neutral-500';
  });

  severityDotClass = computed(() => {
    const s = this.alert()?.severity ?? 'LOW';
    return ({ CRITICAL: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-amber-500', LOW: 'bg-blue-500' } as Record<string,string>)[s] ?? 'bg-neutral-400';
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) this.loadAlert(id);
  }

  private loadAlert(id: number) {
    this.inventoryService.getAlertById(id).pipe(
      catchError(() => of(null))
    ).subscribe(alert => {
      if (!alert) return;
      this.alert.set(alert);
      if (alert.articleId) {
        this.inventoryService.getArticleById(alert.articleId).pipe(catchError(() => of(null))).subscribe(a => this.article.set(a));
      }
      if (alert.supplierId) {
        this.inventoryService.getSupplierById(alert.supplierId).pipe(catchError(() => of(null))).subscribe(s => this.supplier.set(s));
      }
      setTimeout(() => {
        const items = document.querySelectorAll('.dash-item');
        if (items.length) gsap.to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
      }, 60);
    });
  }

  resolve() {
    const id = this.alert()?.id;
    if (!id) return;
    this.inventoryService.resolveAlert(id).subscribe({
      next: (updated) => {
        this.alert.set(updated);
        this.toastService.success('Resolved', 'Alert marked as resolved.');
      }
    });
  }

  acknowledge() {
    const id = this.alert()?.id;
    if (!id) return;
    this.inventoryService.acknowledgeAlert(id).subscribe({
      next: (updated) => {
        this.alert.set(updated);
        this.toastService.info('Acknowledged', 'Alert marked as acknowledged.');
      }
    });
  }
}
