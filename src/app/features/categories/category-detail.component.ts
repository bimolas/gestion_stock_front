import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Category } from '../../core/models/api.models';
import { of, catchError } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex items-end justify-between animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/categories" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">Category Workspace</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ isNew() ? 'New Category' : (category()?.name || 'Loading...') }}
          </h1>
        </div>
      </div>

      <div class="bg-white rounded-[3rem] p-12 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] animate-item opacity-0">
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-12">
          
          <div class="grid grid-cols-1 gap-12">
            
            <div class="space-y-6">
              <div class="flex items-center gap-4 border-b border-neutral-50 pb-6">
                <div class="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                  <span class="material-symbols-rounded">info</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-primary">Basic Identity</h3>
                  <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Naming & Description</p>
                </div>
              </div>

              <!-- Name Field -->
              <div class="group relative">
                <label for="categoryName" class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 ml-2 transition-colors group-focus-within:text-accent">
                   Category Name <span class="text-accent">*</span>
                </label>
                <div class="relative flex items-center">
                  <span class="material-symbols-rounded absolute left-6 text-neutral-300 transition-colors group-focus-within:text-accent z-10">label</span>
                  <input id="categoryName" type="text" formControlName="name" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-3xl pl-16 pr-6 py-5 font-bold text-primary transition-all focus:bg-white focus:shadow-xl focus:shadow-accent/5 focus:border-accent focus:outline-none placeholder:text-neutral-300 placeholder:font-medium" placeholder="e.g. Electronics">
                </div>
              </div>

              <!-- Description Field -->
              <div class="group relative">
                <label for="categoryDescription" class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 ml-2 transition-colors group-focus-within:text-accent">
                   Description
                </label>
                <div class="relative flex items-start">
                  <span class="material-symbols-rounded absolute left-6 top-6 text-neutral-300 transition-colors group-focus-within:text-accent z-10">description</span>
                  <textarea id="categoryDescription" formControlName="description" rows="3" class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-3xl pl-16 pr-6 py-5 font-bold text-primary transition-all focus:bg-white focus:shadow-xl focus:shadow-accent/5 focus:border-accent focus:outline-none placeholder:text-neutral-300 placeholder:font-medium resize-none" placeholder="Enter a brief description..."></textarea>
                </div>
              </div>

            </div>
          </div>

          <div class="pt-10 border-t border-neutral-50 flex justify-end gap-4">
             <button type="button" routerLink="/app/categories" class="px-8 py-4 bg-white border border-neutral-100 text-neutral-600 rounded-2xl font-bold text-sm hover:bg-neutral-50 transition-all active:scale-95">
               Cancel
             </button>
             <button type="submit" [disabled]="categoryForm.invalid || isSaving()" class="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3">
               @if (isSaving()) {
                 <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               } @else {
                 <span class="material-symbols-rounded">save</span>
               }
               {{ isNew() ? 'Create Category' : 'Save Changes' }}
             </button>
          </div>
          
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  
  isNew = signal(true);
  category = signal<Category | null>(null);
  isSaving = signal(false);
  isDeleting = signal(false);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew.set(false);
      this.loadCategoryData(Number(id));
    } else {
      this.animateEntrance();
    }
  }

  private loadCategoryData(id: number) {
    this.inventoryService.getCategoryById(id).pipe(
      catchError(err => {
        console.error('Error fetching category:', err);
        return of(null);
      })
    ).subscribe(cat => {
      if (cat) {
        this.category.set(cat);
        this.categoryForm.patchValue({ name: cat.name, description: cat.description });
        this.animateEntrance();
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    
    this.isSaving.set(true);
    const { name, description } = this.categoryForm.value;
    
    if (this.isNew()) {
      this.inventoryService.createCategory({ name: name!, description: description ?? '' }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/app/categories']);
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
        }
      });
    } else {
      const catId = this.category()?.id;
      if (catId) {
        this.inventoryService.updateCategory(catId, { name: name!, description: description ?? '' }).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/app/categories']);
          },
          error: (err) => {
            console.error(err);
            this.isSaving.set(false);
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
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
        );
      }
    }, 50);
  }
}
