import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Category } from '../../core/models/api.models';
import { catchError, of } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-4xl font-display font-extrabold tracking-tight text-primary leading-none">Categories</h1>
        <button routerLink="/app/categories/new" class="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <span class="material-symbols-rounded">add</span>
          New Category
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (category of categories(); track category.id) {
          <div 
            [routerLink]="['/app/categories', category.id]"
            class="bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-neutral-200/50 transition-all cursor-pointer group animate-item opacity-0 relative overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-50/50 pointer-events-none"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-neutral-50 rounded-[1.5rem] flex items-center justify-center text-neutral-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6 group-hover:scale-110">
                <span class="material-symbols-rounded">category</span>
              </div>
              <h3 class="text-xl font-bold text-primary mb-2 line-clamp-1 group-hover:text-accent transition-colors">{{ category.name }}</h3>
              <p class="text-sm font-medium text-neutral-400 line-clamp-2 leading-relaxed">{{ category.description }}</p>
            </div>
            <div class="absolute top-8 right-8 w-10 h-10 border border-neutral-100 rounded-full flex items-center justify-center text-neutral-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
               <span class="material-symbols-rounded translate-x-px">arrow_forward_ios</span>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-20 text-center animate-item opacity-0">
             <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-neutral-50">
               <span class="material-symbols-rounded text-4xl text-neutral-300">category</span>
             </div>
             <p class="text-lg font-bold text-neutral-400">No categories found</p>
             <p class="text-sm font-medium text-neutral-400 mt-2">Create one to get started.</p>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.inventoryService.getAllCategories().pipe(
      catchError(err => {
        console.error('Error fetching categories:', err);
        return of([]);
      })
    ).subscribe(data => {
      this.categories.set(data);
      this.animateList();
    });
  }

  private animateList() {
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
