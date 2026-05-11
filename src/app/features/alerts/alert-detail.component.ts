import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Alert, Article, Supplier } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { of, catchError, map } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/dashboard" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">System Intelligence Alert</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ alert()?.title || 'Loading Alert...' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
          @if (alert()?.status !== 'RESOLVED') {
            <button (click)="resolve()" class="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <mat-icon class="scale-90">check_circle</mat-icon>
              Mark Resolved
            </button>
            <button (click)="acknowledge()" class="px-6 py-4 bg-white border border-neutral-100 text-primary rounded-2xl font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all flex items-center gap-3">
              <mat-icon class="scale-90">visibility</mat-icon>
              Acknowledge
            </button>
          } @else {
            <div class="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm flex items-center gap-3">
              <mat-icon class="scale-90">verified</mat-icon>
              Issue Resolved
            </div>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Alert Status Card -->
        <div class="lg:col-span-1 space-y-8">
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 flex flex-col gap-8">
            <div [class]="severityClass()" class="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner">
              <mat-icon class="text-4xl">{{ alert()?.type === 'LOW_STOCK' ? 'inventory' : 'analytics' }}</mat-icon>
            </div>
            
            <div class="space-y-6">
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Severity Level</span>
                <p class="text-lg font-bold" [class]="severityTextClass()">{{ alert()?.severity }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Current Status</span>
                <p class="text-lg font-bold text-primary">{{ alert()?.status }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Detected At</span>
                <p class="text-sm font-bold text-primary">{{ alert()?.createdAt | date:'medium' }}</p>
              </div>
              @if (alert()?.resolvedAt) {
                <div class="space-y-1">
                  <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Resolved At</span>
                  <p class="text-sm font-bold text-emerald-600">{{ alert()?.resolvedAt | date:'medium' }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Issue Context -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0">
             <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Alert Details</h4>
             <p class="text-lg font-medium text-neutral-600 leading-relaxed">
               {{ alert()?.content }}
             </p>
          </div>

          <!-- Related Entities -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             @if (article()) {
               <div [routerLink]="['/app/articles', article()?.id]" class="group bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 cursor-pointer hover:shadow-xl transition-all">
                  <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Impacted Article</h4>
                  <div class="flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                      <mat-icon class="text-3xl">shopping_bag</mat-icon>
                    </div>
                    <div>
                      <h5 class="text-lg font-bold text-primary group-hover:text-accent transition-colors">{{ article()?.name }}</h5>
                      <p class="text-xs text-neutral-400">Current Stock: {{ article()?.quantity }}</p>
                    </div>
                  </div>
               </div>
             }

             @if (supplier()) {
               <div [routerLink]="['/app/suppliers', supplier()?.id]" class="group bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 cursor-pointer hover:shadow-xl transition-all">
                  <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Primary Supplier</h4>
                  <div class="flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                      <mat-icon class="text-3xl">business</mat-icon>
                    </div>
                    <div>
                      <h5 class="text-lg font-bold text-primary group-hover:text-accent transition-colors">{{ supplier()?.name }}</h5>
                      <p class="text-xs text-neutral-400">{{ supplier()?.contact }}</p>
                    </div>
                  </div>
               </div>
             }
          </div>

          <!-- Suggested Action -->
          <div class="bg-primary rounded-[3rem] p-10 shadow-xl shadow-primary/20 animate-item opacity-0 text-white flex flex-col md:flex-row items-center gap-10">
             <div class="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <mat-icon class="text-5xl">lightbulb</mat-icon>
             </div>
             <div>
               <h4 class="text-xl font-display font-extrabold mb-2">Recommended System Action</h4>
               <p class="text-primary-foreground/80 font-medium leading-relaxed">
                 @if (alert()?.type === 'LOW_STOCK') {
                   Initiate a new stock entry request from <strong>{{ supplier()?.name || 'the primary supplier' }}</strong> for at least <strong>{{ article()?.quantity ? (50 - article()!.quantity) : 20 }}</strong> units to restore healthy inventory levels.
                 } @else {
                   Verify external logistics for supply chain delays and update the expected delivery date for pending orders.
                 }
               </p>
               <button [routerLink]="alert()?.type === 'LOW_STOCK' ? '/app/entries' : null" class="mt-8 px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all">
                  {{ alert()?.type === 'LOW_STOCK' ? 'Start Stock Entry' : 'Check External Logs' }}
               </button>
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
  
  alert = signal<Alert | null>(null);
  article = signal<Article | null>(null);
  supplier = signal<Supplier | null>(null);

  severityClass = computed(() => {
    const s = this.alert()?.severity;
    if (s === 'CRITICAL' || s === 'HIGH') return 'bg-red-50 text-red-600';
    if (s === 'MEDIUM') return 'bg-amber-50 text-amber-600';
    return 'bg-blue-50 text-blue-600';
  });

  severityTextClass = computed(() => {
    const s = this.alert()?.severity;
    if (s === 'CRITICAL' || s === 'HIGH') return 'text-red-600';
    if (s === 'MEDIUM') return 'text-amber-600';
    return 'text-blue-600';
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadAlertData(id);
    }
  }

  private loadAlertData(id: number) {
    this.inventoryService.getOpenAlerts().pipe(
      map(alerts => alerts.find(a => a.id === id) || null),
      catchError(err => {
        console.error('Error finding alert:', err);
        return of(null);
      })
    ).subscribe(alert => {
      if (alert) {
        this.alert.set(alert);
        this.loadLinkedData(alert);
        this.animateEntrance();
      }
    });
  }

  private loadLinkedData(alert: Alert) {
    if (alert.articleId) {
      this.inventoryService.getArticleById(alert.articleId)
        .pipe(catchError(() => of(null)))
        .subscribe(art => this.article.set(art));
    }
    if (alert.supplierId) {
      this.inventoryService.getSupplierById(alert.supplierId)
        .pipe(catchError(() => of(null)))
        .subscribe(sup => this.supplier.set(sup));
    }
  }

  resolve() {
    const id = this.alert()?.id;
    if (id) {
      this.inventoryService.resolveAlert(id).subscribe(updated => {
        this.alert.set(updated);
      });
    }
  }

  acknowledge() {
    const id = this.alert()?.id;
    if (id) {
      this.inventoryService.acknowledgeAlert(id).subscribe(updated => {
        this.alert.set(updated);
      });
    }
  }

  private animateEntrance() {
    setTimeout(() => {
      const items = document.querySelectorAll('.animate-item');
      if (items.length > 0) {
        gsap.fromTo(items, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
        );
      }
    }, 50);
  }
}
