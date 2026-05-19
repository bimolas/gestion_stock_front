import { Component, ChangeDetectionStrategy, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';
import { StockEntry, Article, Supplier } from '../../core/models/api.models';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-stock-entries',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-10 pb-20">
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Stock Entries</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Inbound Logistics</p>
        </div>
        
        @if (articles().length === 0 || suppliers().length === 0) {
          <div class="flex items-center gap-3 bg-amber-50 text-amber-700 px-6 py-4 rounded-2xl border border-amber-100">
            <span class="material-symbols-rounded text-amber-500">warning</span>
            <span class="text-xs font-bold uppercase tracking-wider">Add Articles & Suppliers first</span>
          </div>
        } @else {
          <button 
            (click)="showModal.set(true)"
            class="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 relative overflow-hidden group">
            <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span class="material-symbols-rounded">add_shopping_cart</span>
            <span class="relative">Register Entry</span>
          </button>
        }
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        @if (isLoading()) {
           <div class="p-20 text-center flex flex-col items-center justify-center">
             <div class="w-16 h-16 border-4 border-neutral-100 border-t-primary rounded-full animate-spin mb-6"></div>
             <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Processing Ledger...</p>
           </div>
        } @else {
           <div class="overflow-x-auto">
             <table class="w-full text-left border-collapse">
               <thead>
                 <tr class="border-b border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                   <th class="px-10 py-6">Transaction</th>
                   <th class="px-10 py-6">Article</th>
                   <th class="px-10 py-6">Origin</th>
                   <th class="px-10 py-6 text-center">Volume</th>
                   <th class="px-10 py-6">Timestamp</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-neutral-50">
                 @for (entry of entries(); track entry.id) {
                    <tr [routerLink]="['/app/entries', entry.id]" class="hover:bg-neutral-50/50 transition-all group entry-row opacity-0 translate-y-4 cursor-pointer">
                     <td class="px-10 py-8 text-[10px] font-black text-neutral-400 tracking-widest uppercase">TXN_{{ entry.id }}</td>
                     <td class="px-10 py-8">
                        <div class="flex items-center gap-4">
                           <div class="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-primary">
                              <span class="material-symbols-rounded">article</span>
                           </div>
                           <span class="font-bold text-primary">{{ entry.article.name || 'Unknown' }}</span>
                        </div>
                     </td>
                     <td class="px-10 py-8 text-neutral-600 font-medium">{{ entry.supplier.name || 'External' }}</td>
                     <td class="px-10 py-8 text-center">
                        <span class="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 font-display font-black text-xs rounded-xl">
                          +{{ entry.quantity }} units
                        </span>
                     </td>
                     <td class="px-10 py-8 text-neutral-400 font-medium text-xs">{{ entry.date | date:'MMM d, y, h:mm a' }}</td>
                   </tr>
                 } @empty {
                   <tr>
                     <td colspan="5" class="px-10 py-32 text-center">
                        <div class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6 mx-auto">
                           <span class="material-symbols-rounded text-4xl">inventory</span>
                        </div>
                        <h3 class="text-lg font-bold text-primary">No entry records</h3>
                        <p class="text-sm text-neutral-400 font-medium mt-1">Incoming stock movements will appear here.</p>
                     </td>
                   </tr>
                 }
               </tbody>
             </table>
           </div>
        }
      </div>

      <!-- Add Entry Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/5 backdrop-blur-md transition-all">
          <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-neutral-100">
            <div class="p-10 border-b border-neutral-50 flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-3xl font-display font-extrabold tracking-tighter">Manifest</h2>
                <p class="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Stock Reception</p>
              </div>
              <button (click)="showModal.set(false)" class="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-50 rounded-2xl transition-all">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
            <div class="p-10 overflow-y-auto custom-scrollbar">
              <form [formGroup]="entryForm" (ngSubmit)="onSubmit()" class="space-y-8">
                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Target Article</span>
                    <div class="relative">
                      <button type="button" 
                        (click)="toggleDropdown('article', $event)"
                        class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold flex items-center justify-between transition-all hover:bg-white hover:shadow-lg hover:border-accent group/btn active:scale-[0.98]">
                        <span [class.text-neutral-400]="!entryForm.get('articleId')?.value" class="truncate">{{ getSelectedLabel('article') }}</span>
                        <span class="material-symbols-rounded text-neutral-400" [class.rotate-180]="openDropdown() === 'article'">expand_more</span>
                      </button>
                      
                      @if (openDropdown() === 'article') {
                        <div class="absolute top-full left-0 right-0 mt-3 z-[60] glass rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-neutral-100 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                          <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 bg-white/80">
                            @for (a of articles(); track a.id) {
                              <button type="button"
                                (click)="selectOption('articleId', a.id)"
                                [class.bg-neutral-900]="isSelected('articleId', a.id)"
                                [class.text-white]="isSelected('articleId', a.id)"
                                [class.shadow-md]="isSelected('articleId', a.id)"
                                class="w-full px-5 py-4 rounded-2xl text-left font-bold text-sm hover:translate-x-1 transition-all flex items-center justify-between group/item mb-1 last:mb-0"
                                [class.hover:bg-neutral-50]="!isSelected('articleId', a.id)">
                                <div class="flex items-center gap-4">
                                  <div class="w-1.5 h-1.5 rounded-full transition-all duration-300" 
                                    [class]="isSelected('articleId', a.id) ? 'bg-accent w-3 shadow-[0_0_10px_#3b82f6]' : 'bg-neutral-200 group-hover/item:bg-neutral-400'"></div>
                                  <span class="tracking-tight">{{ a.name }}</span>
                                </div>
                                @if (isSelected('articleId', a.id)) {
                                  <div class="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center animate-in zoom-in duration-300">
                                    <span class="material-symbols-rounded text-accent" style="font-size:14px">check</span>
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
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Origin Supplier</span>
                    <div class="relative">
                      <button type="button" 
                        (click)="toggleDropdown('supplier', $event)"
                        class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold flex items-center justify-between transition-all hover:bg-white hover:shadow-lg hover:border-accent group/btn active:scale-[0.98]">
                        <span [class.text-neutral-400]="!entryForm.get('supplierId')?.value" class="truncate">{{ getSelectedLabel('supplier') }}</span>
                        <span class="material-symbols-rounded text-neutral-400" [class.rotate-180]="openDropdown() === 'supplier'">expand_more</span>
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
                                    <span class="material-symbols-rounded text-accent" style="font-size:14px">check</span>
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

                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Reception Quantity</span>
                    <div class="flex items-center bg-[#F9F9F8] border border-neutral-100 rounded-2xl overflow-hidden group focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <button type="button" (click)="adjustQuantity(-1)" class="w-14 h-14 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-all border-r border-neutral-50 active:scale-95">
                        <span class="material-symbols-rounded text-sm">remove</span>
                      </button>
                      <input type="number" formControlName="quantity" class="w-full bg-transparent border-none px-4 py-4 font-black text-center focus:outline-none">
                      <button type="button" (click)="adjustQuantity(1)" class="w-14 h-14 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-all border-l border-neutral-50 active:scale-95">
                        <span class="material-symbols-rounded text-sm">add</span>
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Arrival Timing</span>
                    <div class="relative group">
                      <span class="material-symbols-rounded absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 text-sm z-20 group-focus-within:text-primary transition-colors">schedule</span>
                      <input type="datetime-local" formControlName="date" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-sm transition-all focus:outline-none">
                    </div>
                  </div>
                </div>
                
                <div class="pt-6 flex gap-6">
                  <button type="button" (click)="showModal.set(false)" class="flex-1 px-8 py-5 border border-neutral-100 text-neutral-400 rounded-[2rem] font-bold hover:bg-neutral-50 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                  <button 
                    type="submit" 
                    [disabled]="entryForm.invalid || isSubmitting()" 
                    class="flex-1 px-8 py-5 bg-primary text-white rounded-[2rem] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    @if (isSubmitting()) {
                      <div class="flex items-center justify-center gap-2">
                        <span class="material-symbols-rounded animate-spin text-sm">sync</span>
                        <span>Finalizing...</span>
                      </div>
                    } @else {
                      <span>{{ entryForm.invalid ? 'Check Fields' : 'Finalize Reception' }}</span>
                    }
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
export class StockEntriesComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  entries = signal<StockEntry[]>([]);
  articles = signal<Article[]>([]);
  suppliers = signal<Supplier[]>([]);

  isLoading = signal(true);
  isSubmitting = signal(false);
  showModal = signal(false);

  entryForm = this.fb.group({
    articleId: ['', Validators.required],
    supplierId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().slice(0, 16), Validators.required]
  });

  isSelected(field: string, id: number): boolean {
    return Number(this.entryForm.get(field)?.value) === id;
  }

  adjustQuantity(amount: number) {
    const current = Number(this.entryForm.get('quantity')?.value) || 0;
    this.entryForm.patchValue({ quantity: Math.max(0, current + amount) });
  }

  openDropdown = signal<string | null>(null);

  toggleDropdown(name: string, event: Event) {
    event.stopPropagation();
    this.openDropdown.update(current => current === name ? null : name);
  }

  selectOption(field: string, id: string | number) {
    this.entryForm.patchValue({ [field]: id });
    this.openDropdown.set(null);
  }

  getSelectedLabel(type: 'article' | 'supplier'): string {
    const id = this.entryForm.get(type === 'article' ? 'articleId' : 'supplierId')?.value;
    if (!id) return type === 'article' ? 'Select Item' : 'Select Source';
    
    if (type === 'article') {
      return this.articles().find(a => a.id === Number(id))?.name || 'Select Item';
    } else {
      return this.suppliers().find(s => s.id === Number(id))?.name || 'Select Source';
    }
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.openDropdown.set(null);
  }

  ngOnInit() {
    this.loadData();
    this.animateEntrance();
  }

  animateEntrance() {
    setTimeout(() => {
      const rows = document.querySelectorAll('.entry-row');
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
    this.isLoading.set(true);
    this.inventoryService.getAllStockEntries().subscribe({
      next: (data) => {
        this.entries.set(data);
        this.isLoading.set(false);
        this.animateEntrance();
      },
      error: () => this.isLoading.set(false)
    });

    this.inventoryService.getAllArticles().subscribe({
      next: (data) => this.articles.set(data)
    });
    this.inventoryService.getAllSuppliers().subscribe({
      next: (data) => this.suppliers.set(data)
    });
  }

  onSubmit() {
    if (this.entryForm.valid) {
      this.isSubmitting.set(true);
      const val = this.entryForm.getRawValue();
      
      const payload = {
        articleId: Number(val.articleId),
        supplierId: Number(val.supplierId),
        quantity: Number(val.quantity),
        date: new Date(val.date as string).toISOString()
      };
      
      this.inventoryService.createStockEntry(payload).subscribe({
        next: () => {
          this.showModal.set(false);
          this.toastService.success('Stock Received', `Successfully recorded ${payload.quantity} units bound to inventory.`);
          
          this.entryForm.reset({
            articleId: '',
            supplierId: '',
            quantity: 0,
            date: new Date().toISOString().slice(0, 16)
          });
          this.isSubmitting.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error('Error finalizing reception:', err);
          this.toastService.error('Stock Entry Failed', 'Failed to register the inbound stock entry.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
