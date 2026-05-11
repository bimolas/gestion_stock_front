import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Supplier, Article, StockEntry } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of, catchError, map } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/suppliers" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">Supplier Profile</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ supplier()?.name || 'Loading...' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
          <button (click)="editSupplier()" class="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <mat-icon class="scale-90">edit</mat-icon>
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1 bg-white rounded-[3rem] p-10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col gap-8 animate-item opacity-0">
          <div class="w-20 h-20 rounded-[2rem] bg-accent/10 text-accent flex items-center justify-center shadow-inner">
            <mat-icon class="text-4xl">business</mat-icon>
          </div>
          
          <div class="space-y-6">
            <div class="space-y-1">
              <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Contact Person</span>
              <p class="text-lg font-bold text-primary">{{ supplier()?.contact || '---' }}</p>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Phone Number</span>
              <p class="text-lg font-bold text-primary">{{ supplier()?.phone || '---' }}</p>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Address</span>
              <p class="text-sm font-medium text-neutral-500 leading-relaxed">{{ supplier()?.address || 'No address provided' }}</p>
            </div>
          </div>

          <div class="mt-auto pt-8 border-t border-neutral-50">
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
              <div class="flex items-center gap-3">
                <mat-icon class="text-emerald-500">verified</mat-icon>
                <span class="text-xs font-bold text-primary">Active Partner</span>
              </div>
              <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Since 2024</span>
            </div>
          </div>
        </div>

        <!-- Catalog & History -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Stats Summary -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] animate-item opacity-0">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                  <mat-icon class="scale-75">inventory_2</mat-icon>
                </div>
                <h4 class="text-sm font-bold text-primary">Supplied Articles</h4>
              </div>
              <h3 class="text-4xl font-display font-extrabold text-primary">{{ filteredArticles().length }}</h3>
            </div>
            
            <div class="bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] animate-item opacity-0">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <mat-icon class="scale-75">history</mat-icon>
                </div>
                <h4 class="text-sm font-bold text-primary">Total Deliveries</h4>
              </div>
              <h3 class="text-4xl font-display font-extrabold text-primary">{{ transactionHistory().length }}</h3>
            </div>
          </div>

          <!-- Tabs View -->
          <div class="bg-white rounded-[3rem] p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] animate-item opacity-0">
            <div class="flex p-2 bg-neutral-50 rounded-2xl mb-4">
              <button (click)="activeTab.set('articles')" 
                [class.bg-white]="activeTab() === 'articles'"
                [class.shadow-sm]="activeTab() === 'articles'"
                class="flex-1 py-3 text-xs font-bold rounded-xl transition-all">Articles Catalog</button>
              <button (click)="activeTab.set('history')" 
                [class.bg-white]="activeTab() === 'history'"
                [class.shadow-sm]="activeTab() === 'history'"
                class="flex-1 py-3 text-xs font-bold rounded-xl transition-all">Supply History</button>
            </div>

            <div class="px-4 pb-4">
              @if (activeTab() === 'articles') {
                <div class="space-y-4">
                  @for (article of filteredArticles(); track article.id) {
                    <div [routerLink]="['/app/articles', article.id]" class="group flex items-center justify-between p-5 rounded-[2rem] hover:bg-neutral-50 transition-all cursor-pointer">
                      <div class="flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-lg transition-all">
                          <mat-icon>shopping_bag</mat-icon>
                        </div>
                        <div>
                          <h5 class="text-sm font-bold text-primary">{{ article.name }}</h5>
                          <p class="text-xs text-neutral-400 font-medium">{{ article.category.name }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-black text-primary">{{ article.price | currency }}</p>
                        <p [class]="article.quantity < 10 ? 'text-red-500' : 'text-emerald-500'" class="text-[10px] font-bold uppercase tracking-widest mt-1">
                          Stock: {{ article.quantity }}
                        </p>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-20">
                      <div class="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mx-auto mb-4">
                        <mat-icon>inventory</mat-icon>
                      </div>
                      <p class="text-sm text-neutral-400 font-bold">No articles cataloged</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="space-y-4">
                  @for (entry of transactionHistory(); track entry.id) {
                    <div class="flex items-center justify-between p-5 rounded-[2rem] bg-neutral-20 px-6">
                      <div class="flex items-center gap-5">
                        <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <mat-icon class="scale-75">add_shopping_cart</mat-icon>
                        </div>
                        <div>
                          <h5 class="text-sm font-bold text-primary">{{ entry.article.name }}</h5>
                          <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{{ entry.date | date:'longDate' }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-black text-primary">+{{ entry.quantity }}</p>
                        <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Quantity</p>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-20">
                      <div class="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mx-auto mb-4">
                        <mat-icon>receipt_long</mat-icon>
                      </div>
                      <p class="text-sm text-neutral-400 font-bold">No recent transactions</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  
  supplier = signal<Supplier | null>(null);
  articles = signal<Article[]>([]);
  stockEntries = signal<StockEntry[]>([]);
  activeTab = signal<'articles' | 'history'>('articles');
  isDeleting = signal(false);

  filteredArticles = computed(() => {
    const s = this.supplier();
    if (!s) return [];
    return (this.articles() || []).filter(a => a?.supplier?.id === s.id);
  });

  transactionHistory = computed(() => {
    const s = this.supplier();
    if (!s) return [];
    return (this.stockEntries() || [])
      .filter(e => e?.supplier?.id === s.id)
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadSupplierData(id);
    }
  }

  private loadSupplierData(id: number) {
    const supplier$ = this.inventoryService.getSupplierById(id).pipe(
      catchError(err => {
        console.warn(`Supplier detail lookup failed for ID ${id}, falling back to full list search.`, err);
        return this.inventoryService.getAllSuppliers().pipe(
          map(suppliers => suppliers.find(s => s.id === id) || null)
        );
      })
    );

    forkJoin({
      supplier: supplier$,
      articles: this.inventoryService.getAllArticles().pipe(catchError(() => of([]))),
      entries: this.inventoryService.getAllStockEntries().pipe(catchError(() => of([])))
    }).subscribe(result => {
      if (result.supplier) {
        this.supplier.set(result.supplier);
        this.articles.set(result.articles);
        this.stockEntries.set(result.entries);
        this.animateEntrance();
      } else {
        console.error('Supplier not found even in full list');
      }
    });
  }

  editSupplier() {
    if (confirm('Are you sure you want to change this supplier?')) {
      const s = this.supplier();
      if (!s || !s.id) return;
      const newName = prompt('Enter new supplier name:', s.name);
      if (newName !== null && newName.trim() !== '') {
        this.inventoryService.updateSupplier(s.id, { 
           ...s,
           name: newName
        }).subscribe({
           next: () => {
             this.toastService.success('Supplier Updated', 'Supplier profile was updated successfully.');
             this.loadSupplierData(s.id!);
           },
           error: (err) => {
             console.error(err);
             this.toastService.error('Update Failed', 'Failed to update the supplier.');
           }
        });
      }
    }
  }

  private animateEntrance() {
    setTimeout(() => {
      const items = document.querySelectorAll('.animate-item');
      if (items.length > 0) {
        gsap.fromTo(items, 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: 'power4.out',
            clearProps: 'transform'
          }
        );
      }
    }, 100);
  }
}
