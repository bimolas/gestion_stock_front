import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { StockExit } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { of, catchError, map } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-exit-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/exits" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">Stock Outbound Dispatch</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            Exit #{{ exit()?.id || '...' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
          <button class="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <mat-icon class="scale-90">local_shipping</mat-icon>
            Track Shipment
          </button>
        </div>
      </div>

      <!-- Main Info Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Status & Stats -->
        <div class="lg:col-span-1 space-y-8">
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 flex flex-col gap-8">
            <div class="w-20 h-20 rounded-[2rem] bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
              <mat-icon class="text-4xl">local_shipping</mat-icon>
            </div>
            
            <div class="space-y-6">
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Dispatch Date</span>
                <p class="text-lg font-bold text-primary">{{ exit()?.date | date:'longDate' }}</p>
                <p class="text-xs text-neutral-400">{{ exit()?.date | date:'shortTime' }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Quantity Dispatched</span>
                <p class="text-3xl font-display font-extrabold text-red-600">-{{ exit()?.quantity }} Units</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Target Destination</span>
                <p class="text-lg font-bold text-primary">{{ exit()?.destination }}</p>
              </div>
              <div class="pt-4">
                <div class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl w-fit">
                   <mat-icon class="scale-75">box</mat-icon>
                   <span class="text-[10px] font-black uppercase tracking-widest">Out for Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Linked Entities -->
        <div class="lg:col-span-2 space-y-8">
          <div class="grid grid-cols-1 gap-8">
            <!-- Article Card -->
            <div [routerLink]="['/app/articles', exit()?.article?.id]" class="group bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
              <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-8">Article Dispatched</h4>
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                  <mat-icon class="text-3xl">shopping_bag</mat-icon>
                </div>
                <div class="flex-1">
                  <h5 class="text-xl font-bold text-primary group-hover:text-accent transition-colors">{{ exit()?.article?.name }}</h5>
                  <p class="text-xs text-neutral-400 font-medium">{{ exit()?.article?.category?.name }}</p>
                </div>
                <div class="text-right">
                   <p class="text-sm font-black text-primary">{{ exit()?.article?.barcode }}</p>
                   <p class="text-[10px] font-bold text-neutral-400">SKU/BARCODE</p>
                </div>
                <mat-icon class="text-neutral-200 group-hover:text-primary transition-all">arrow_forward</mat-icon>
              </div>
            </div>
          </div>

          <!-- Logistics Details -->
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0">
             <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Logistics Tracking</h4>
             <div class="space-y-8">
               <div class="relative space-y-10 pl-6 before:absolute before:left-[35px] before:top-4 before:bottom-6 before:w-[2px] before:bg-neutral-100">
                  <div class="relative flex items-start gap-6">
                    <div class="w-6 h-6 mt-0.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 z-10 shrink-0"></div>
                    <div>
                      <h6 class="text-xs font-black text-primary uppercase mt-1">Order Picked</h6>
                      <p class="text-[10px] text-neutral-400 font-medium italic mt-1">Warehouse Section A-12</p>
                    </div>
                  </div>
                  <div class="relative flex items-start gap-6">
                    <div class="w-6 h-6 mt-0.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 z-10 shrink-0"></div>
                    <div>
                      <h6 class="text-xs font-black text-primary uppercase mt-1">Quality Check Passed</h6>
                      <p class="text-[10px] text-neutral-400 font-medium italic mt-1">Inspection completed by System Auto</p>
                    </div>
                  </div>
                  <div class="relative flex items-start gap-6">
                    <div class="w-6 h-6 mt-0.5 rounded-full bg-red-400 ring-4 ring-red-50 z-10 shrink-0 animate-pulse"></div>
                    <div>
                      <h6 class="text-xs font-black text-primary uppercase mt-1">In Transit to {{ exit()?.destination }}</h6>
                      <p class="text-[10px] text-neutral-400 font-medium italic mt-1">ETA: {{ exit()?.date | date:'shortDate' }} (End of day)</p>
                    </div>
                  </div>
               </div>

               <div class="grid grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-neutral-50 text-center">
                 <div>
                   <p class="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Exit ID</p>
                   <p class="text-sm font-bold text-primary">#EXIT-{{ exit()?.id }}</p>
                 </div>
                 <div>
                   <p class="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Total Weight</p>
                   <p class="text-sm font-bold text-primary">-- kg</p>
                 </div>
                 <div>
                   <p class="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Total Value</p>
                   <p class="text-sm font-bold text-red-600">-{{ ((exit()?.article?.price || 0) * (exit()?.quantity || 0)) | currency }}</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  
  exit = signal<StockExit | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadExitData(id);
    }
  }

  private loadExitData(id: number) {
    this.inventoryService.getAllStockExits().pipe(
      map(exits => exits.find(e => e.id === id) || null),
      catchError(err => {
        console.error('Error finding exit:', err);
        return of(null);
      })
    ).subscribe(exit => {
      if (exit) {
        this.exit.set(exit);
        this.animateEntrance();
      }
    });
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
