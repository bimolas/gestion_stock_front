import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { StockEntry } from '../../core/models/api.models';
import { of, catchError } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-entry-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/entries" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">Stock Inbound Receipt</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            Entry #{{ entry()?.id || '...' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
          <button class="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <span class="material-symbols-rounded">print</span>
            Print Receipt
          </button>
        </div>
      </div>

      <!-- Main Info Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Status & Stats -->
        <div class="lg:col-span-1 space-y-8">
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 flex flex-col gap-8">
            <div class="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <span class="material-symbols-rounded text-4xl">inventory_2</span>
            </div>
            
            <div class="space-y-6">
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Reception Date</span>
                <p class="text-lg font-bold text-primary">{{ entry()?.date | date:'longDate' }}</p>
                <p class="text-xs text-neutral-400">{{ entry()?.date | date:'shortTime' }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Quantity Received</span>
                <p class="text-3xl font-display font-extrabold text-emerald-600">+{{ entry()?.quantity }} Units</p>
              </div>
              <div class="pt-4">
                <div class="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                   <span class="material-symbols-rounded">verified</span>
                   <span class="text-[10px] font-black uppercase tracking-widest">Entry Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Linked Entities -->
        <div class="lg:col-span-2 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Article Card -->
            <div [routerLink]="['/app/articles', entry()?.article?.id]" class="group bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
              <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-8">Article Received</h4>
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                  <span class="material-symbols-rounded text-3xl">shopping_bag</span>
                </div>
                <div class="flex-1">
                  <h5 class="text-xl font-bold text-primary group-hover:text-accent transition-colors">{{ entry()?.article?.name }}</h5>
                  <p class="text-xs text-neutral-400 font-medium">{{ entry()?.article?.category?.name }}</p>
                </div>
                <span class="material-symbols-rounded text-neutral-200 group-hover:text-primary transition-all">arrow_forward</span>
              </div>
            </div>

            <!-- Supplier Card -->
            <div [routerLink]="['/app/suppliers', entry()?.supplier?.id]" class="group bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
              <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-8">Origin Supplier</h4>
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                  <span class="material-symbols-rounded text-3xl">business</span>
                </div>
                <div class="flex-1">
                  <h5 class="text-xl font-bold text-primary group-hover:text-accent transition-colors">{{ entry()?.supplier?.name }}</h5>
                  <p class="text-xs text-neutral-400 font-medium">{{ entry()?.supplier?.contact }}</p>
                </div>
                <span class="material-symbols-rounded text-neutral-200 group-hover:text-primary transition-all">arrow_forward</span>
              </div>
            </div>
          </div>

          <!-- Documentation / Details -->
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0">
             <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Internal Documentation</h4>
             <div class="space-y-6">
               <div class="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-neutral-500 text-sm leading-relaxed">
                 "Inventory successfully updated from manual reception. Stock levels incremented for {{ entry()?.article?.name }}. Quality check passed at reception desk."
               </div>
               
               <div class="grid grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                 <div>
                   <p class="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Batch Identifier</p>
                   <p class="text-sm font-bold text-primary">#BTCH-{{ entry()?.id }}-ENT</p>
                 </div>
                 <div>
                   <p class="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Stock Impact</p>
                   <p class="text-sm font-bold text-emerald-600">+{{ entry()?.quantity }} Available</p>
                 </div>
                 <div>
                   <p class="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Unit Value</p>
                   <p class="text-sm font-bold text-primary">{{ (entry()?.article?.price || 0) | currency }}</p>
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
export class EntryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  
  entry = signal<StockEntry | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadEntryData(id);
    }
  }

  private loadEntryData(id: number) {
    this.inventoryService.getStockEntryById(id).pipe(
      catchError(err => {
        console.error('Error loading entry:', err);
        return of(null);
      })
    ).subscribe(entry => {
      if (entry) {
        this.entry.set(entry);
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
