import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Article } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of, catchError } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/articles" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">{{ article()?.category?.name || 'Category' }}</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ article()?.name || 'Loading Article...' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
          <button (click)="editArticle()" class="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <mat-icon class="scale-90">edit</mat-icon>
            Edit Article
          </button>
          <button class="px-6 py-4 bg-white border border-neutral-100 text-primary rounded-2xl font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all flex items-center gap-3">
            <mat-icon class="scale-90">qr_code</mat-icon>
            Print Label
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-[2rem] p-6 shadow-sm animate-item opacity-0">
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Stock Level</p>
          <div class="flex items-end gap-2">
            <h3 class="text-3xl font-display font-extrabold text-primary">{{ article()?.quantity || 0 }}</h3>
            <span class="text-xs font-bold text-neutral-400 mb-1">Units</span>
          </div>
        </div>
        <div class="bg-white rounded-[2rem] p-6 shadow-sm animate-item opacity-0">
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Unit Price</p>
          <div class="flex items-end gap-2">
            <h3 class="text-3xl font-display font-extrabold text-primary">{{ article()?.price | currency }}</h3>
          </div>
        </div>
        <div class="bg-white rounded-[2rem] p-6 shadow-sm animate-item opacity-0">
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Inventory Value</p>
          <div class="flex items-end gap-2">
            <h3 class="text-3xl font-display font-extrabold text-emerald-600">{{ (article()?.price || 0) * (article()?.quantity || 0) | currency }}</h3>
          </div>
        </div>
        <div class="bg-white rounded-[2rem] p-6 shadow-sm animate-item opacity-0">
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Turnover</p>
          <div class="flex items-end gap-2 text-amber-600 font-bold">
            <mat-icon class="scale-75">trending_up</mat-icon>
            <span>High</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Details Column -->
        <div class="space-y-8 lg:col-span-1">
          <!-- Description -->
          <div class="bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0">
            <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Product Description</h4>
            <p class="text-neutral-500 font-medium leading-relaxed italic">
              "{{ article()?.description || 'No description provided for this article.' }}"
            </p>
          </div>

          <!-- Supplier Info -->
          <div [routerLink]="['/app/suppliers', article()?.supplier?.id]" class="group bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0 cursor-pointer transition-all hover:shadow-xl active:scale-[0.98]">
            <h4 class="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Master Supplier</h4>
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <mat-icon class="text-3xl">business</mat-icon>
              </div>
              <div>
                <h5 class="text-lg font-bold text-primary">{{ article()?.supplier?.name }}</h5>
                <p class="text-xs text-neutral-400 font-medium">{{ article()?.supplier?.contact }}</p>
              </div>
              <mat-icon class="ml-auto text-neutral-200 group-hover:text-primary transition-colors">arrow_forward</mat-icon>
            </div>
          </div>
        </div>

        <!-- History Timeline -->
        <div class="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm animate-item opacity-0">
          <div class="flex items-center justify-between mb-10">
            <div>
              <h2 class="text-2xl font-display font-extrabold tracking-tight text-primary">Transaction History</h2>
              <p class="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Audit Trail & Movement</p>
            </div>
            <div class="flex gap-2">
              <button (click)="filterMode.set('all')" 
                      [class.bg-primary]="filterMode() === 'all'" 
                      [class.text-white]="filterMode() === 'all'" 
                      [class.border-transparent]="filterMode() === 'all'" 
                      [class.border-neutral-100]="filterMode() !== 'all'"
                      [class.text-neutral-500]="filterMode() !== 'all'"
                      [class.bg-white]="filterMode() !== 'all'"
                      [class.hover:bg-neutral-50]="filterMode() !== 'all'"
                      class="px-6 py-2 text-[11px] font-bold rounded-full border outline-none transition-all tracking-widest uppercase">
                All
              </button>
              <button (click)="filterMode.set('in')" 
                      [class.bg-primary]="filterMode() === 'in'" 
                      [class.text-white]="filterMode() === 'in'" 
                      [class.border-transparent]="filterMode() === 'in'" 
                      [class.border-neutral-100]="filterMode() !== 'in'"
                      [class.text-neutral-500]="filterMode() !== 'in'"
                      [class.bg-white]="filterMode() !== 'in'"
                      [class.hover:bg-neutral-50]="filterMode() !== 'in'"
                      class="px-6 py-2 text-[11px] font-bold rounded-full border outline-none transition-all tracking-widest uppercase">
                In
              </button>
              <button (click)="filterMode.set('out')" 
                      [class.bg-primary]="filterMode() === 'out'" 
                      [class.text-white]="filterMode() === 'out'" 
                      [class.border-transparent]="filterMode() === 'out'" 
                      [class.border-neutral-100]="filterMode() !== 'out'"
                      [class.text-neutral-500]="filterMode() !== 'out'"
                      [class.bg-white]="filterMode() !== 'out'"
                      [class.hover:bg-neutral-50]="filterMode() !== 'out'"
                      class="px-6 py-2 text-[11px] font-bold rounded-full border outline-none transition-all tracking-widest uppercase">
                Out
              </button>
            </div>
          </div>

          <div class="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-50">
            @for (item of filteredTimeline(); track item.id + item.type) {
              <div class="relative pl-12 group">
                <!-- Dot -->
                <div [class]="item.type === 'ENTRY' ? 'bg-emerald-500 ring-emerald-100' : 'bg-red-500 ring-red-100'" 
                  class="absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center text-white ring-4 transition-all group-hover:scale-110 z-10 shadow-lg">
                  <mat-icon class="scale-75">{{ item.type === 'ENTRY' ? 'add_shopping_cart' : 'local_shipping' }}</mat-icon>
                </div>
                
                <div class="bg-neutral-50/50 p-6 rounded-[2rem] border border-transparent hover:border-neutral-100 hover:bg-white transition-all">
                  <div class="flex justify-between items-start mb-2">
                    <h5 class="text-sm font-bold text-primary">{{ item.title }}</h5>
                    <span class="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{{ item.date | date:'MMM d, y, HH:mm' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-neutral-500 font-medium">{{ item.description }}</p>
                    <div class="flex items-center gap-2">
                      <span [class]="item.type === 'ENTRY' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'" class="px-3 py-1 rounded-full text-xs font-black">
                        {{ item.type === 'ENTRY' ? '+' : '-' }}{{ item.quantity }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center py-20 text-center">
                 <div class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6">
                   <mat-icon class="text-4xl text-neutral-200">manage_search</mat-icon>
                 </div>
                 <h4 class="text-sm font-bold text-neutral-400">No activity recorded</h4>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);

  article = signal<Article | null>(null);
  history = signal<Record<string, unknown>[]>([]);
  filterMode = signal<'all' | 'in' | 'out'>('all');
  isDeleting = signal(false);

  timeline = computed(() => {
    const raw = this.history();
    if (!raw.length) return [];

    return raw.map(item => {
      // Determine if it's an entry or exit based on fields
      // StockEntry usually has a 'supplier' field, StockExit has 'destination'
      const isEntry = 'supplier' in item;
      
      return {
        id: item['id'] as number,
        type: isEntry ? 'ENTRY' as const : 'EXIT' as const,
        title: isEntry ? 'Stock Inbound' : 'Stock Outbound',
        description: isEntry 
          ? `Received from ${(item['supplier'] as {name: string})?.name || 'Partner'}` 
          : `Dispatched to ${String(item['destination']) || 'External'}`,
        quantity: item['quantity'] as number,
        date: item['date'] as string
      };
    });
  });

  filteredTimeline = computed(() => {
    const mode = this.filterMode();
    const data = this.timeline();
    if (mode === 'all') return data;
    return data.filter(item => item.type === (mode === 'in' ? 'ENTRY' : 'EXIT'));
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadArticleData(id);
    }
  }

  private loadArticleData(id: number) {
    forkJoin({
      article: this.inventoryService.getArticleById(id).pipe(
        catchError(err => {
          console.warn(`Article detail lookup failed for ID ${id}`, err);
          return of(null);
        })
      ),
      history: this.inventoryService.getArticleHistory(id).pipe(
        catchError(err => {
          console.error('Error fetching article history:', err);
          return of([]);
        })
      )
    }).subscribe(result => {
      if (result.article) {
        this.article.set(result.article);
        this.history.set(result.history);
        this.animateEntrance();
      } else {
        this.toastService.error('Error', 'Article not found');
        this.router.navigate(['/app/articles']);
      }
    });
  }

  editArticle() {
    if (confirm('Are you sure you want to change this article?')) {
      const art = this.article();
      if (!art || !art.id) return;
      const newName = prompt('Enter new article name:', art.name);
      if (newName !== null && newName.trim() !== '') {
        this.inventoryService.updateArticle(art.id, { 
           ...art,
           name: newName,
           // Keep category/supplier bindings correctly
           category: { id: art.category?.id },
           supplier: { id: art.supplier?.id } 
        }).subscribe({
           next: () => {
             this.toastService.success('Article Updated', 'The article name was successfully updated.');
             this.loadArticleData(art.id!);
           },
           error: (err) => {
             console.error(err);
             this.toastService.error('Update Failed', 'Failed to update article details.');
           }
        });
      }
    }
  }

  private animateEntrance() {
    setTimeout(() => {
      const items = document.querySelectorAll('.animate-item');
      gsap.fromTo(items, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, 50);
  }
}
