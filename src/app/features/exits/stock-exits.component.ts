import { Component, ChangeDetectionStrategy, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';
import { StockExit, Article } from '../../core/models/api.models';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-stock-exits',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-10 pb-20">
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Stock Exits</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Outbound Logistics</p>
        </div>
        <button 
          (click)="showModal.set(true)"
          class="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 relative overflow-hidden group">
          <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <mat-icon class="scale-110">local_shipping</mat-icon>
          <span class="relative">Register Exit</span>
        </button>
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
                   <th class="px-10 py-6">Destination</th>
                   <th class="px-10 py-6 text-center">Volume</th>
                   <th class="px-10 py-6">Timestamp</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-neutral-50">
                 @for (exit of exits(); track exit.id) {
                    <tr [routerLink]="['/app/exits', exit.id]" class="hover:bg-neutral-50/50 transition-all group exit-row opacity-0 translate-y-4 cursor-pointer">
                     <td class="px-10 py-8 text-[10px] font-black text-neutral-400 tracking-widest uppercase">TXN_{{ exit.id }}</td>
                     <td class="px-10 py-8">
                        <div class="flex items-center gap-4">
                           <div class="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-primary">
                              <mat-icon class="scale-75">article</mat-icon>
                           </div>
                           <span class="font-bold text-primary">{{ exit.article.name || 'Unknown' }}</span>
                        </div>
                     </td>
                     <td class="px-10 py-8">
                        <div class="flex items-center gap-2">
                           <mat-icon class="scale-75 text-neutral-300">room</mat-icon>
                           <span class="text-sm font-medium text-neutral-600">{{ exit.destination }}</span>
                        </div>
                     </td>
                     <td class="px-10 py-8 text-center">
                        <span class="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-600 font-display font-black text-xs rounded-xl">
                          -{{ exit.quantity }} units
                        </span>
                     </td>
                     <td class="px-10 py-8 text-neutral-400 font-medium text-xs">{{ exit.date | date:'MMM d, y, h:mm a' }}</td>
                   </tr>
                 } @empty {
                   <tr>
                     <td colspan="5" class="px-10 py-32 text-center">
                        <div class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6 mx-auto">
                           <mat-icon class="text-4xl">inventory_2</mat-icon>
                        </div>
                        <h3 class="text-lg font-bold text-primary">No exit records</h3>
                        <p class="text-sm text-neutral-400 font-medium mt-1">Outgoing stock movements will appear here.</p>
                     </td>
                   </tr>
                 }
               </tbody>
             </table>
           </div>
        }
      </div>

      <!-- Add Exit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/5 backdrop-blur-md transition-all">
          <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-neutral-100">
            <div class="p-10 border-b border-neutral-50 flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-3xl font-display font-extrabold tracking-tighter">Manifest</h2>
                <p class="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Stock Dispatch</p>
              </div>
              <button (click)="showModal.set(false)" class="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-50 rounded-2xl transition-all">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="p-10 overflow-y-auto custom-scrollbar">
              <form [formGroup]="exitForm" (ngSubmit)="onSubmit()" class="space-y-8">
                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Target Article</span>
                    <div class="relative">
                      <button type="button" 
                        (click)="toggleDropdown('article', $event)"
                        class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold flex items-center justify-between transition-all hover:bg-white hover:shadow-lg hover:border-accent group/btn active:scale-[0.98]">
                        <span [class.text-neutral-400]="!exitForm.get('articleId')?.value" class="truncate">{{ getSelectedLabel() }}</span>
                        <mat-icon class="text-neutral-400 group-hover/btn:text-accent transition-transform duration-300" [class.rotate-180]="openDropdown() === 'article'">expand_more</mat-icon>
                      </button>
                      
                      @if (openDropdown() === 'article') {
                        <div class="absolute top-full left-0 right-0 mt-3 z-[60] glass rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-neutral-100 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                          <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 bg-white/80">
                            @for (a of articles(); track a.id) {
                              <button type="button"
                                (click)="selectOption('articleId', a.id)"
                                [class.bg-neutral-900]="isSelected(a.id)"
                                [class.text-white]="isSelected(a.id)"
                                [class.shadow-md]="isSelected(a.id)"
                                class="w-full px-5 py-4 rounded-2xl text-left font-bold text-sm hover:translate-x-1 transition-all flex items-center justify-between group/item mb-1 last:mb-0"
                                [class.hover:bg-neutral-50]="!isSelected(a.id)">
                                <div class="flex items-center gap-4">
                                  <div class="w-1.5 h-1.5 rounded-full transition-all duration-300" 
                                    [class]="isSelected(a.id) ? 'bg-accent w-3 shadow-[0_0_10px_#3b82f6]' : 'bg-neutral-200 group-hover/item:bg-neutral-400'"></div>
                                  <span class="tracking-tight">{{ a.name }}</span>
                                </div>
                                @if (isSelected(a.id)) {
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
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Destination</span>
                    <input type="text" formControlName="destination" placeholder="E.g. Retail Store A" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Dispatch Quantity</span>
                    <div class="flex items-center bg-[#F9F9F8] border border-neutral-100 rounded-2xl overflow-hidden group focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <button type="button" (click)="adjustQuantity(-1)" class="w-14 h-14 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-all border-r border-neutral-50 active:scale-95">
                        <mat-icon class="text-sm">remove</mat-icon>
                      </button>
                      <input type="number" formControlName="quantity" class="w-full bg-transparent border-none px-4 py-4 font-black text-center focus:outline-none">
                      <button type="button" (click)="adjustQuantity(1)" class="w-14 h-14 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 transition-all border-l border-neutral-50 active:scale-95">
                        <mat-icon class="text-sm">add</mat-icon>
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Dispatch Timing</span>
                    <div class="relative group">
                      <mat-icon class="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 text-sm z-20 group-focus-within:text-primary transition-colors">schedule</mat-icon>
                      <input type="datetime-local" formControlName="date" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-sm transition-all focus:outline-none">
                    </div>
                  </div>
                </div>
                
                <div class="pt-6 flex gap-6">
                  <button type="button" (click)="showModal.set(false)" class="flex-1 px-8 py-5 border border-neutral-100 text-neutral-400 rounded-[2rem] font-bold hover:bg-neutral-50 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                  <button 
                    type="submit" 
                    [disabled]="exitForm.invalid || isSubmitting()" 
                    class="flex-1 px-8 py-5 bg-primary text-white rounded-[2rem] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    @if (isSubmitting()) {
                      <div class="flex items-center justify-center gap-2">
                        <mat-icon class="animate-spin text-sm">sync</mat-icon>
                        <span>Finalizing...</span>
                      </div>
                    } @else {
                      <span>{{ exitForm.invalid ? 'Check Fields' : 'Finalize Dispatch' }}</span>
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
export class StockExitsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  exits = signal<StockExit[]>([]);
  articles = signal<Article[]>([]);
  
  isLoading = signal(true);
  isSubmitting = signal(false);
  showModal = signal(false);

  exitForm = this.fb.group({
    articleId: ['', Validators.required],
    destination: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().slice(0, 16), Validators.required]
  });

  isSelected(id: number): boolean {
    return Number(this.exitForm.get('articleId')?.value) === id;
  }

  adjustQuantity(amount: number) {
    const current = Number(this.exitForm.get('quantity')?.value) || 0;
    this.exitForm.patchValue({ quantity: Math.max(0, current + amount) });
  }

  openDropdown = signal<string | null>(null);

  toggleDropdown(name: string, event: Event) {
    event.stopPropagation();
    this.openDropdown.update(current => current === name ? null : name);
  }

  selectOption(field: string, id: string | number) {
    this.exitForm.patchValue({ [field]: id });
    this.openDropdown.set(null);
  }

  getSelectedLabel(): string {
    const id = this.exitForm.get('articleId')?.value;
    if (!id) return 'Select Item';
    return this.articles().find(a => a.id === Number(id))?.name || 'Select Item';
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
      const rows = document.querySelectorAll('.exit-row');
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
    this.inventoryService.getAllStockExits().subscribe({
      next: (data) => {
        this.exits.set(data);
        this.isLoading.set(false);
        this.animateEntrance();
      },
      error: () => this.isLoading.set(false)
    });

    this.inventoryService.getAllArticles().subscribe({
      next: (data) => this.articles.set(data)
    });
  }

  onSubmit() {
    if (this.exitForm.valid) {
      this.isSubmitting.set(true);
      const val = this.exitForm.getRawValue();
      const payload = {
        destination: val.destination,
        articleId: Number(val.articleId),
        quantity: Number(val.quantity),
        date: new Date(val.date as string).toISOString()
      };
      
      this.inventoryService.createStockExit(payload).subscribe({
        next: () => {
          this.showModal.set(false);
          this.toastService.success('Stock Dispatched', `Successfully recorded dispatch of ${payload.quantity} units.`);
          
          this.exitForm.reset({
            articleId: '',
            destination: '',
            quantity: 0,
            date: new Date().toISOString().slice(0, 16)
          });
          this.isSubmitting.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error('Error finalizing dispatch:', err);
          this.toastService.error('Dispatch Failed', 'Failed to register the outbound stock entry.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
