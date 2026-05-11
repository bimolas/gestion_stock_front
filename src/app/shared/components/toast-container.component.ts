import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl shadow-xl border animate-in slide-in-from-right-8 duration-300"
             [ngClass]="{
               'bg-white border-emerald-100': toast.type === 'success',
               'bg-white border-red-100': toast.type === 'error',
               'bg-white border-amber-100': toast.type === 'warning',
               'bg-neutral-900 border-neutral-800': toast.type === 'info'
             }">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               [ngClass]="{
                 'bg-emerald-50 text-emerald-500': toast.type === 'success',
                 'bg-red-50 text-red-500': toast.type === 'error',
                 'bg-amber-50 text-amber-500': toast.type === 'warning',
                 'bg-neutral-800 text-white': toast.type === 'info'
               }">
               <mat-icon>{{ getIcon(toast.type) }}</mat-icon>
          </div>
          <div class="flex-1 min-w-0 py-1">
            <h4 class="text-sm font-bold truncate"
                [ngClass]="{
                  'text-emerald-700': toast.type === 'success',
                  'text-red-700': toast.type === 'error',
                  'text-amber-700': toast.type === 'warning',
                  'text-white': toast.type === 'info'
                }">{{ toast.title }}</h4>
            <p class="text-xs mt-1 leading-snug"
               [ngClass]="{
                  'text-emerald-600': toast.type === 'success',
                  'text-red-600': toast.type === 'error',
                  'text-amber-600': toast.type === 'warning',
                  'text-neutral-400': toast.type === 'info'
                }">{{ toast.message }}</p>
          </div>
          <button (click)="toastService.remove(toast.id)" class="text-neutral-400 hover:text-neutral-600 transition-colors p-1 flex-shrink-0">
            <mat-icon class="scale-75">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }
}
