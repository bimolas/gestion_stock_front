import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Message } from '../../core/models/api.models';
import { BehaviorSubject, switchMap, catchError, of } from 'rxjs';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Audit & Messages</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Traceability Log</p>
        </div>
        @if (unreadCount() > 0) {
          <button (click)="markAllAsRead()"
            class="px-5 py-2.5 bg-white border border-neutral-100 text-primary rounded-2xl font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all flex items-center gap-2 shadow-card">
            <span class="material-symbols-rounded sym-sm">done_all</span>
            Mark all read
            <span class="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">{{ unreadCount() }}</span>
          </button>
        }
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-[2rem] p-5 shadow-card text-center">
          <p class="text-2xl font-display font-extrabold text-primary">{{ allMessages().length }}</p>
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Total</p>
        </div>
        <div class="bg-white rounded-[2rem] p-5 shadow-card text-center">
          <p class="text-2xl font-display font-extrabold text-primary">{{ unreadCount() }}</p>
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Unread</p>
        </div>
        <div class="bg-white rounded-[2rem] p-5 shadow-card text-center">
          <p class="text-2xl font-display font-extrabold text-neutral-400">{{ allMessages().length - unreadCount() }}</p>
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Read</p>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-card overflow-hidden">
        @if (isLoading()) {
          <div class="p-20 flex flex-col items-center justify-center">
            <div class="w-10 h-10 border-2 border-neutral-100 border-t-primary rounded-full animate-spin mb-4"></div>
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading...</p>
          </div>
        } @else if (allMessages().length === 0) {
          <div class="p-20 flex flex-col items-center justify-center text-center">
            <div class="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4">
              <span class="material-symbols-rounded sym-lg text-neutral-300">inbox</span>
            </div>
            <h3 class="text-base font-bold text-primary">No activity yet</h3>
            <p class="text-sm text-neutral-400 mt-1">Stock movements will be logged here automatically.</p>
          </div>
        } @else {
          <div class="divide-y divide-neutral-50">
            @for (msg of pagedMessages(); track msg.id) {
              <div [routerLink]="['/app/notifications', msg.id]"
                class="flex items-start gap-4 px-8 py-5 hover:bg-neutral-50/60 transition-colors cursor-pointer group"
                [class.bg-neutral-50/30]="!msg.read">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" [class]="getIconClass(msg)">
                  <span class="material-symbols-rounded sym-sm">{{ getIcon(msg) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-sm font-bold text-primary truncate group-hover:text-accent transition-colors">{{ parseTitle(msg) }}</p>
                    @if (!msg.read) {
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    }
                    <span class="text-[10px] text-neutral-400 font-medium ml-auto shrink-0">{{ msg.createdAt | date:'MMM d, HH:mm' }}</span>
                  </div>
                  <p class="text-xs text-neutral-500 leading-relaxed">{{ parseContent(msg) }}</p>
                </div>
                @if (!msg.read) {
                  <button (click)="markAsRead(msg.id, $event)" title="Mark as read"
                    class="w-8 h-8 rounded-xl border border-neutral-100 text-neutral-300 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center shrink-0">
                    <span class="material-symbols-rounded sym-sm">done</span>
                  </button>
                }
              </div>
            }
          </div>

          @if (totalPages() > 1) {
            <div class="px-8 py-5 border-t border-neutral-50 flex items-center justify-between">
              <p class="text-xs text-neutral-400 font-medium">
                Showing {{ pageStart() }}-{{ pageEnd() }} of {{ allMessages().length }}
              </p>
              <div class="flex items-center gap-2">
                <button (click)="prevPage()" [disabled]="page() === 0"
                  class="w-8 h-8 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <span class="material-symbols-rounded sym-sm">chevron_left</span>
                </button>
                @for (p of pageNumbers(); track p) {
                  <button (click)="setPage(p)"
                    class="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                    [class.bg-primary]="page() === p" [class.text-white]="page() === p"
                    [class.border]="page() !== p" [class.border-neutral-100]="page() !== p"
                    [class.text-neutral-400]="page() !== p">
                    {{ p + 1 }}
                  </button>
                }
                <button (click)="nextPage()" [disabled]="page() === totalPages() - 1"
                  class="w-8 h-8 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <span class="material-symbols-rounded sym-sm">chevron_right</span>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  allMessages = signal<Message[]>([]);
  isLoading = signal(true);
  page = signal(0);
  unreadCount = computed(() => this.allMessages().filter(m => !m.read).length);
  private refresh$ = new BehaviorSubject<void>(undefined);

  totalPages = computed(() => Math.ceil(this.allMessages().length / PAGE_SIZE));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));
  pagedMessages = computed(() => this.allMessages().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  pageStart = computed(() => this.page() * PAGE_SIZE + 1);
  pageEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.allMessages().length));

  ngOnInit() {
    this.refresh$.pipe(
      switchMap(() => this.inventoryService.getAllMessages().pipe(catchError(() => of([]))))
    ).subscribe({
      next: (msgs) => {
        const sorted = [...msgs].sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.allMessages.set(sorted);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setPage(p: number) { this.page.set(p); }
  prevPage() { if (this.page() > 0) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }

  markAsRead(id: number, event?: Event) {
    if (event) event.stopPropagation();
    this.inventoryService.markMessageAsRead(id).subscribe({ next: () => this.refresh$.next() });
  }

  markAllAsRead() {
    const unread = this.allMessages().filter(m => !m.read);
    let done = 0;
    unread.forEach(m => {
      this.inventoryService.markMessageAsRead(m.id).subscribe({
        next: () => { if (++done === unread.length) this.refresh$.next(); }
      });
    });
  }

  parseTitle(msg: Message): string {
    const m = (msg.content || '').match(/Movement=(\w+)/);
    if (m) return m[1] === 'ENTRY' ? 'Stock Inbound' : 'Stock Outbound';
    return msg.title || 'System Message';
  }

  parseContent(msg: Message): string {
    const raw = msg.content || '';
    const mov = raw.match(/Movement=(\w+)/);
    const art = raw.match(/ArticleId=(\d+)/);
    const qty = raw.match(/Quantity=(\d+)/);
    if (mov && art && qty) {
      const verb = mov[1] === 'ENTRY' ? 'received into' : 'dispatched from';
      return qty[1] + ' units ' + verb + ' inventory — Article #' + art[1];
    }
    return raw;
  }

  getIcon(msg: Message): string {
    const raw = msg.content || '';
    if (raw.includes('Movement=ENTRY')) return 'move_to_inbox';
    if (raw.includes('Movement=EXIT')) return 'outbox';
    return 'notifications';
  }

  getIconClass(msg: Message): string {
    const raw = msg.content || '';
    if (raw.includes('Movement=ENTRY')) return 'bg-emerald-50 text-emerald-600';
    if (raw.includes('Movement=EXIT')) return 'bg-red-50 text-red-500';
    return msg.read ? 'bg-neutral-100 text-neutral-400' : 'bg-primary/10 text-primary';
  }
}
