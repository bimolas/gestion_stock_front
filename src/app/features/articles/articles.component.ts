import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InventoryService } from '../../core/services/inventory.service';
import { Article, Category, Supplier } from '../../core/models/api.models';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-8 relative pb-20">
      

      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Articles</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Inventory Management</p>
        </div>
        <button 
          #addBtn
          (click)="showModal.set(true)"
          class="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 relative overflow-hidden group">
          <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <mat-icon class="scale-110">add</mat-icon>
          <span class="relative">Create Article</span>
        </button>
      </div>

      <!-- Controls -->
      <div class="bg-white p-6 rounded-[2rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] flex gap-6 items-center justify-between glass">
        <div class="relative w-full max-w-xl">
          <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">search</mat-icon>
          <input 
            type="text" 
            [formControl]="searchControl"
            placeholder="Filter by name, barcode or category..."
            class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all"
          >
        </div>
        <div class="flex gap-3">
          <button class="w-14 h-14 flex items-center justify-center text-neutral-400 border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-all hover:text-primary">
            <mat-icon>tune</mat-icon>
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                <th class="px-10 py-6">Identity</th>
                <th class="px-10 py-6">Category</th>
                <th class="px-10 py-6">Availability</th>
                <th class="px-10 py-6">Unit Price</th>
                <th class="px-10 py-6 text-right font-display text-primary/50">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-50">
              @for (article of filteredArticles(); track article.id) {
                <tr [attr.data-id]="article.id" class="hover:bg-neutral-50/50 transition-all group data-row opacity-0">
                  <td class="px-10 py-8">
                    <div class="flex items-center gap-5">
                      <div class="w-14 h-14 rounded-2xl bg-[#F9F9F8] border border-neutral-100 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <mat-icon class="text-xl">inventory_2</mat-icon>
                      </div>
                      <div [routerLink]="['/app/articles', article.id]" class="cursor-pointer">
                        <div class="font-bold text-primary group-hover:text-accent transition-colors">{{ article.name }}</div>
                        <div class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">{{ article.barcode }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <div class="inline-flex items-center px-4 py-2 bg-neutral-50 rounded-xl text-xs font-bold text-neutral-600">
                       {{ article.category.name || 'General' }}
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <div class="flex flex-col gap-2">
                       <div class="flex items-center justify-between gap-2">
                          <span class="text-lg font-display font-extrabold text-primary">{{ article.quantity }}</span>
                          <span [class]="'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ' + getStockBadgeClass(article.quantity)">
                            {{ article.quantity === 0 ? 'Stock Required' : article.quantity < 10 ? 'Low Volume' : 'Optimal' }}
                          </span>
                       </div>
                       <div class="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div [class]="'h-full rounded-full transition-all duration-1000 ' + getProgressColor(article.quantity)" 
                               [style.width.%]="calcProgress(article.quantity)"></div>
                       </div>
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <span class="text-lg font-display font-extrabold text-primary">{{ article.price | currency }}</span>
                  </td>
                  <td class="px-10 py-8 text-right">
                    <div class="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button class="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-white hover:shadow-lg rounded-xl transition-all">
                        <mat-icon class="text-lg">edit</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-10 py-32 text-center">
                    <div class="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6 mx-auto">
                       <mat-icon class="text-5xl">folder_off</mat-icon>
                    </div>
                    <h3 class="text-lg font-bold text-primary">No results found</h3>
                    <p class="text-sm text-neutral-400 font-medium mt-1">Adjust your search or filter parameters.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Article Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/5 backdrop-blur-md transition-all">
          <div #modalContent class="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-neutral-100">
            <div class="p-10 border-b border-neutral-50 flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-3xl font-display font-extrabold tracking-tighter">New Article</h2>
                <p class="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Product Registration</p>
              </div>
              <button (click)="closeModal()" class="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-50 rounded-2xl transition-all">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="p-10 overflow-y-auto custom-scrollbar">
              <form [formGroup]="articleForm" (ngSubmit)="onSubmit()" class="space-y-8">
                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Name</span>
                    <input type="text" formControlName="name" placeholder="E.g. Wireless Mouse" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
                  </div>
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Barcode</span>
                    <input type="text" formControlName="barcode" placeholder="123456789" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-4 col-span-2 bg-[#F9F9F8] p-6 rounded-2xl border border-neutral-100">
                    <div class="flex items-center gap-3 text-amber-600">
                      <mat-icon class="text-sm">info</mat-icon>
                      <span class="text-[10px] font-black uppercase tracking-widest">Procedural Note</span>
                    </div>
                    <p class="text-xs text-neutral-500 font-medium leading-relaxed">
                      New articles are registered with <strong class="text-primary">zero units</strong> by default. To add stock with full traceability, use the <strong class="text-primary">Inbound Stock</strong> tool after creation.
                    </p>
                  </div>
                  <div class="space-y-2 col-span-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Unit Price (Estimated)</span>
                    <div class="flex items-center bg-[#F9F9F8] border border-neutral-100 rounded-2xl overflow-hidden group focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <button type="button" (click)="adjustPrice(-10)" class="w-14 h-14 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-all border-r border-neutral-50 active:scale-95">
                        <mat-icon class="text-sm">remove</mat-icon>
                      </button>
                      <div class="flex-1 relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                        <input type="number" formControlName="price" class="w-full bg-transparent border-none pl-8 pr-4 py-4 font-black focus:outline-none">
                      </div>
                      <button type="button" (click)="adjustPrice(10)" class="w-14 h-14 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-all border-l border-neutral-50 active:scale-95">
                        <mat-icon class="text-sm">add</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Category</span>
                    <div class="relative">
                      <button type="button" 
                        (click)="toggleDropdown('category', $event)"
                        class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold flex items-center justify-between transition-all hover:bg-white hover:shadow-lg hover:border-accent group/btn active:scale-[0.98]">
                        <span [class.text-neutral-400]="!articleForm.get('categoryId')?.value" class="truncate">{{ getSelectedLabel('category') }}</span>
                        <mat-icon class="text-neutral-400 group-hover/btn:text-accent transition-transform duration-300" [class.rotate-180]="openDropdown() === 'category'">expand_more</mat-icon>
                      </button>
                      
                      @if (openDropdown() === 'category') {
                        <div class="absolute top-full left-0 right-0 mt-3 z-[60] glass rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-neutral-100 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                          <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 bg-white/80">
                            @for (c of categories(); track c.id) {
                              <button type="button"
                                (click)="selectOption('categoryId', c.id)"
                                [class.bg-neutral-900]="isSelected('categoryId', c.id)"
                                [class.text-white]="isSelected('categoryId', c.id)"
                                [class.shadow-md]="isSelected('categoryId', c.id)"
                                class="w-full px-5 py-4 rounded-2xl text-left font-bold text-sm hover:translate-x-1 transition-all flex items-center justify-between group/item mb-1 last:mb-0"
                                [class.hover:bg-neutral-50]="!isSelected('categoryId', c.id)">
                                <div class="flex items-center gap-4">
                                  <div class="w-1.5 h-1.5 rounded-full transition-all duration-300" 
                                    [class]="isSelected('categoryId', c.id) ? 'bg-accent w-3 shadow-[0_0_10px_#3b82f6]' : 'bg-neutral-200 group-hover/item:bg-neutral-400'"></div>
                                  <span class="tracking-tight">{{ c.name }}</span>
                                </div>
                                @if (isSelected('categoryId', c.id)) {
                                  <div class="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center animate-in zoom-in duration-300">
                                    <mat-icon class="text-[14px] w-auto h-auto text-accent font-bold">check</mat-icon>
                                  </div>
                                }
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Supplier</span>
                    <div class="relative">
                      <button type="button" 
                        (click)="toggleDropdown('supplier', $event)"
                        class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold flex items-center justify-between transition-all hover:bg-white hover:shadow-lg hover:border-accent group/btn active:scale-[0.98]">
                        <span [class.text-neutral-400]="!articleForm.get('supplierId')?.value" class="truncate">{{ getSelectedLabel('supplier') }}</span>
                        <mat-icon class="text-neutral-400 group-hover/btn:text-accent transition-transform duration-300" [class.rotate-180]="openDropdown() === 'supplier'">expand_more</mat-icon>
                      </button>
 
                      @if (openDropdown() === 'supplier') {
                        <div class="absolute top-full left-0 right-0 mt-3 z-[60] glass rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-neutral-100 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                          <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 bg-white/80">
                            @for (s of suppliers(); track s.id) {
                              <button type="button"
                                (click)="selectOption('supplierId', s.id)"
                                [class.bg-neutral-900]="isSelected('supplierId', s.id)"
                                [class.text-white]="isSelected('supplierId', s.id)"
                                [class.shadow-md]="isSelected('supplierId', s.id)"
                                class="w-full px-5 py-4 rounded-2xl text-left font-bold text-sm hover:translate-x-1 transition-all flex items-center justify-between group/item mb-1 last:mb-0"
                                [class.hover:bg-neutral-50]="!isSelected('supplierId', s.id)">
                                <div class="flex items-center gap-4">
                                  <div class="w-1.5 h-1.5 rounded-full transition-all duration-300" 
                                    [class]="isSelected('supplierId', s.id) ? 'bg-accent w-3 shadow-[0_0_10px_#3b82f6]' : 'bg-neutral-200 group-hover/item:bg-neutral-400'"></div>
                                  <span class="tracking-tight">{{ s.name }}</span>
                                </div>
                                @if (isSelected('supplierId', s.id)) {
                                  <div class="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center animate-in zoom-in duration-300">
                                    <mat-icon class="text-[14px] w-auto h-auto text-accent font-bold">check</mat-icon>
                                  </div>
                                }
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                
                <div class="pt-6 flex gap-6">
                  <button type="button" (click)="closeModal()" class="flex-1 px-8 py-5 border border-neutral-100 text-neutral-400 rounded-[2rem] font-bold hover:bg-neutral-50 transition-all uppercase tracking-widest text-[10px]">Abandon</button>
                  <button type="submit" [disabled]="articleForm.invalid || isSubmitting()" class="flex-1 px-8 py-5 bg-primary text-white rounded-[2rem] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] disabled:opacity-50">
                    {{ isSubmitting() ? 'Deploying...' : 'Confirm Entry' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlesComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  searchControl = new FormControl('');
  
  articles = signal<Article[]>([]);
  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);


  searchQuery = signal<string>('');
  showModal = signal(false);
  isSubmitting = signal(false);

  articleForm = this.fb.group({
    name: ['', Validators.required],
    barcode: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0], // Default 0
    categoryId: ['', Validators.required],
    supplierId: ['', Validators.required]
  });

  isSelected(field: string, id: number): boolean {
    return Number(this.articleForm.get(field)?.value) === id;
  }

  adjustPrice(amount: number) {
    const current = Number(this.articleForm.get('price')?.value) || 0;
    this.articleForm.patchValue({ price: Math.max(0, current + amount) });
  }

  openDropdown = signal<string | null>(null);

  toggleDropdown(name: string, event: Event) {
    event.stopPropagation();
    this.openDropdown.update(current => current === name ? null : name);
  }

  selectOption(field: string, id: string | number) {
    this.articleForm.patchValue({ [field]: id });
    this.openDropdown.set(null);
  }

  getSelectedLabel(type: 'category' | 'supplier'): string {
    const id = this.articleForm.get(type === 'category' ? 'categoryId' : 'supplierId')?.value;
    if (!id) return type === 'category' ? 'Choose Category' : 'Choose Supplier';
    
    if (type === 'category') {
      return this.categories().find(c => c.id === Number(id))?.name || 'Choose Category';
    } else {
      return this.suppliers().find(s => s.id === Number(id))?.name || 'Choose Supplier';
    }
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.openDropdown.set(null);
  }

  filteredArticles = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const articles = this.articles();
    if (!q) return articles;
    return articles.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.barcode && a.barcode.toLowerCase().includes(q)) ||
      (a.category?.name && a.category.name.toLowerCase().includes(q))
    );
  });

  constructor() {
    this.searchControl.valueChanges.subscribe(val => {
      this.searchQuery.set(val || '');
    });
  }

  ngOnInit() {
    this.loadData();
    this.animateEntrance();
  }

  animateEntrance() {
    setTimeout(() => {
      const rows = document.querySelectorAll('.data-row');
      if (rows.length > 0) {
        gsap.to(rows, {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    }, 100);
  }

  loadData() {
    this.inventoryService.getAllArticles().subscribe({
      next: (data) => {
        this.articles.set(data);
        this.animateEntrance();
      },
      error: () => this.articles.set([])
    });

    this.inventoryService.getAllCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([])
    });

    this.inventoryService.getAllSuppliers().subscribe({
      next: (data) => this.suppliers.set(data),
      error: () => this.suppliers.set([])
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.articleForm.reset({ quantity: 0, price: 0 });
  }

  onSubmit() {
    if (this.articleForm.valid) {
      this.isSubmitting.set(true);
      const val = this.articleForm.value;
      const payload = {
        ...val,
        quantity: 0, // Explicitly force 0 traceability
        categoryId: Number(val.categoryId),
        supplierId: Number(val.supplierId)
      };

      this.inventoryService.createArticle(payload).subscribe({
        next: (created) => {
          this.closeModal();
          this.isSubmitting.set(false);
          this.loadData();
          this.toastService.success('Article Created', `Article "${created.name}" registered successfully.`);
          
          if (created.quantity === 0) {
            this.toastService.warning('Stock Required', `Article "${created.name}" has 0 stock. Please create an inbound entry.`);
          }
        },
        error: (err) => {
           console.error(err);
           this.isSubmitting.set(false);
           this.toastService.error('Creation Failed', 'Failed to register the article.');
        }
      });
    }
  }

  getStockBadgeClass(quantity: number) {
    if (quantity === 0) return 'bg-red-50 text-red-600 border border-red-100';
    if (quantity < 10) return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  }

  calcProgress(qty: number) {
    return Math.min((qty / 100) * 100, 100);
  }

  getProgressColor(qty: number) {
    if (qty > 20) return 'bg-emerald-500';
    if (qty > 5) return 'bg-amber-500';
    return 'bg-red-500';
  }

  getStatusClass(quantity: number) {
    if (quantity > 10) return 'bg-emerald-100 text-emerald-700';
    if (quantity > 0) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  }

  getStatusText(quantity: number) {
    if (quantity > 10) return 'In Stock';
    if (quantity > 0) return 'Low Stock';
    return 'Out of Stock';
  }
}
