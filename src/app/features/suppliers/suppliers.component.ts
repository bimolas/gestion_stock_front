import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';
import { Supplier } from '../../core/models/api.models';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-10 pb-20">
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Partners</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Supplier Network</p>
        </div>
        <button 
          (click)="showModal.set(true)"
          class="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 relative overflow-hidden group">
          <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <span class="material-symbols-rounded">handshake</span>
          <span class="relative">Onboard Supplier</span>
        </button>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        @if (isLoading()) {
           <div class="p-20 text-center flex flex-col items-center justify-center">
             <div class="w-16 h-16 border-4 border-neutral-100 border-t-primary rounded-full animate-spin mb-6"></div>
             <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Synchronizing Network...</p>
           </div>
        } @else {
           <div class="overflow-x-auto">
             <table class="w-full text-left border-collapse">
               <thead>
                 <tr class="border-b border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                   <th class="px-10 py-6">Reference</th>
                   <th class="px-10 py-6">Organization</th>
                   <th class="px-10 py-6">Key Contact</th>
                   <th class="px-10 py-6">Channel</th>
                   <th class="px-10 py-6">Locality</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-neutral-50">
                 @for (supplier of suppliers(); track supplier.id) {
                   <tr class="hover:bg-neutral-50/50 transition-all group supplier-row opacity-0 translate-y-4">
                     <td class="px-10 py-8 text-[10px] font-black text-neutral-400 tracking-widest uppercase">ID_{{ supplier.id }}</td>
                     <td class="px-10 py-8">
                        <div [routerLink]="['/app/suppliers', supplier.id]" class="flex items-center gap-5 cursor-pointer group/link">
                          <div class="w-12 h-12 rounded-2xl bg-neutral-50 text-primary flex items-center justify-center font-display font-black text-xs group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                             {{ supplier.name.substring(0, 2).toUpperCase() }}
                          </div>
                          <span class="font-bold text-primary text-lg tracking-tight group-hover/link:text-accent transition-colors">{{ supplier.name }}</span>
                        </div>
                     </td>
                     <td class="px-10 py-8 font-medium text-neutral-600">{{ supplier.contact }}</td>
                     <td class="px-10 py-8">
                        <div class="flex items-center gap-2 font-mono text-xs text-neutral-500">
                           <span class="material-symbols-rounded">phone</span>
                           {{ supplier.phone }}
                        </div>
                     </td>
                     <td class="px-10 py-8">
                        <div class="flex items-center gap-2">
                           <span class="material-symbols-rounded text-neutral-300">location_on</span>
                           <span class="text-sm font-medium text-neutral-500">{{ supplier.address }}</span>
                        </div>
                     </td>
                   </tr>
                 } @empty {
                   <tr>
                     <td colspan="5" class="px-10 py-32 text-center">
                        <div class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6 mx-auto">
                           <span class="material-symbols-rounded text-4xl">business_center</span>
                        </div>
                        <h3 class="text-lg font-bold text-primary">No suppliers yet</h3>
                        <p class="text-sm text-neutral-400 font-medium mt-1">Start by adding your first business partner.</p>
                     </td>
                   </tr>
                 }
               </tbody>
             </table>
           </div>
        }
      </div>

      <!-- Add Supplier Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/5 backdrop-blur-md transition-all">
          <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-neutral-100">
            <div class="p-10 border-b border-neutral-50 flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-3xl font-display font-extrabold tracking-tighter">Onboarding</h2>
                <p class="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">New Supplier Data</p>
              </div>
              <button (click)="showModal.set(false)" class="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-50 rounded-2xl transition-all">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
            <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()" class="p-10 space-y-8">
              <div class="space-y-2">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Corporate Identity</span>
                <input type="text" formControlName="name" placeholder="E.g. Nexus Logistics" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
              </div>

              <div class="grid md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Representative</span>
                  <input type="text" formControlName="contact" placeholder="E.g. Sarah Jenkins" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Communication</span>
                  <input type="text" formControlName="phone" placeholder="+1 234 567 890" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
                </div>
              </div>

              <div class="space-y-2">
                <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Headquarters</span>
                <input type="text" formControlName="address" placeholder="E.g. Silicon Valley, CA" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all">
              </div>
              
              <div class="pt-6 flex gap-6">
                <button type="button" (click)="showModal.set(false)" class="flex-1 px-8 py-5 border border-neutral-100 text-neutral-400 rounded-[2rem] font-bold hover:bg-neutral-50 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" [disabled]="supplierForm.invalid || isSubmitting()" class="flex-1 px-8 py-5 bg-primary text-white rounded-[2rem] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] disabled:opacity-50">
                  {{ isSubmitting() ? 'Onboarding...' : 'Confim Registration' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuppliersComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  suppliers = signal<Supplier[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isSubmitting = signal(false);

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    contact: ['', Validators.required],
    phone: ['', Validators.required],
    address: ['', Validators.required]
  });

  ngOnInit() {
    this.loadSuppliers();
    this.animateEntrance();
  }

  animateEntrance() {
    setTimeout(() => {
      const rows = document.querySelectorAll('.supplier-row');
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

  loadSuppliers() {
    this.isLoading.set(true);
    this.inventoryService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers.set(data);
        this.isLoading.set(false);
        this.animateEntrance();
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit() {
    if (this.supplierForm.valid) {
      this.isSubmitting.set(true);
      this.inventoryService.createSupplier({
          name: this.supplierForm.value.name!,
          contact: this.supplierForm.value.contact!,
          phone: this.supplierForm.value.phone!,
          address: this.supplierForm.value.address!
        }).subscribe({
        next: (created) => {
          this.showModal.set(false);
          this.toastService.success('Supplier Onboarded', `Partner "${created.name}" onboarded successfully.`);
          
          this.supplierForm.reset();
          this.isSubmitting.set(false);
          this.loadSuppliers();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Onboarding Failed', 'Failed to register the new supplier.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
