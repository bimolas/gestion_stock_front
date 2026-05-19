import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 w-[340px] pointer-events-none">
      @for (toast of visibleToasts(); track toast.id) {
        <div class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg border"
             [class]="toastClass(toast.type)">
          <!-- Icon -->
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
               [class]="iconClass(toast.type)">
            <span class="material-symbols-rounded text-base">{{ getIcon(toast.type) }}</span>
          </div>
          <!-- Text -->
          <div class="flex-1 min-w-0 py-0.5">
            <p class="text-sm font-bold leading-tight" [class]="titleClass(toast.type)">{{ toast.title }}</p>
            <p class="text-xs mt-0.5 leading-snug" [class]="msgClass(toast.type)">{{ toast.message }}</p>
          </div>
          <!-- Close -->
          <button (click)="toastService.remove(toast.id)"
            class="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-colors mt-0.5"
            [class]="closeClass(toast.type)">
            <span class="material-symbols-rounded text-sm">close</span>
          </button>
        </div>
      }
      @if (overflow() > 0) {
        <div class="pointer-events-auto text-center py-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-white rounded-xl border border-neutral-100 shadow-sm">
          +{{ overflow() }} more
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  private readonly MAX = 3;

  visibleToasts = computed(() => this.toastService.toasts().slice(-this.MAX));
  overflow = computed(() => Math.max(0, this.toastService.toasts().length - this.MAX));

  getIcon(type: string): string {
    return { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }[type] ?? 'info';
  }

  toastClass(type: string): string {
    return {
      success: 'bg-white border-emerald-200',
      error:   'bg-white border-red-200',
      warning: 'bg-white border-amber-200',
      info:    'bg-primary border-primary',
    }[type] ?? 'bg-white border-neutral-200';
  }

  iconClass(type: string): string {
    return {
      success: 'bg-emerald-100 text-emerald-600',
      error:   'bg-red-100 text-red-600',
      warning: 'bg-amber-100 text-amber-600',
      info:    'bg-white/10 text-white',
    }[type] ?? 'bg-neutral-100 text-neutral-500';
  }

  titleClass(type: string): string {
    return {
      success: 'text-neutral-900',
      error:   'text-neutral-900',
      warning: 'text-neutral-900',
      info:    'text-white',
    }[type] ?? 'text-neutral-900';
  }

  msgClass(type: string): string {
    return {
      success: 'text-neutral-500',
      error:   'text-neutral-500',
      warning: 'text-neutral-500',
      info:    'text-white/70',
    }[type] ?? 'text-neutral-500';
  }

  closeClass(type: string): string {
    return type === 'info'
      ? 'text-white/50 hover:text-white hover:bg-white/10'
      : 'text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100';
  }
}
