import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Message } from '../../core/models/api.models';
import { of, catchError } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-8">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 dash-item opacity-0 translate-y-4">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <a routerLink="/app/notifications"
              class="w-9 h-9 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all shadow-card">
              <span class="material-symbols-rounded sym-sm">arrow_back</span>
            </a>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">Audit Log</p>
          </div>
          <h1 class="text-4xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ parsedTitle() }}
          </h1>
        </div>

        <div class="flex gap-3">
          @if (notification() && !notification()!.read) {
            <button (click)="markAsRead()"
              class="px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2">
              <span class="material-symbols-rounded sym-sm">done_all</span>
              Mark as Read
            </button>
          } @else if (notification()) {
            <div class="px-5 py-3 bg-neutral-100 text-neutral-400 rounded-2xl font-bold text-sm flex items-center gap-2">
              <span class="material-symbols-rounded sym-sm">check</span>
              Read
            </div>
          }
        </div>
      </div>

      @if (notification()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Meta card -->
          <div class="bg-white rounded-[2.5rem] p-8 shadow-card dash-item opacity-0 translate-y-4 space-y-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center" [class]="iconBg()">
              <span class="material-symbols-rounded sym-lg" [class]="iconColor()">{{ icon() }}</span>
            </div>
            <div class="space-y-5">
              <div>
                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Type</p>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" [class]="typeBadge()">
                  {{ typeLabel() }}
                </span>
              </div>
              <div>
                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" [class]="notification()!.read ? 'bg-neutral-300' : 'bg-red-500'"></span>
                  <p class="text-sm font-bold text-primary">{{ notification()!.read ? 'Read' : 'Unread' }}</p>
                </div>
              </div>
              <div>
                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Received</p>
                <p class="text-sm font-bold text-primary">{{ notification()!.createdAt | date:'MMM d, y' }}</p>
                <p class="text-xs text-neutral-400 mt-0.5">{{ notification()!.createdAt | date:'HH:mm' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Message ID</p>
                <p class="text-xs font-mono font-bold text-neutral-500">#MSG-{{ notification()!.id }}</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="lg:col-span-2 space-y-5">

            <!-- Parsed summary card -->
            <div class="bg-white rounded-[2.5rem] p-8 shadow-card dash-item opacity-0 translate-y-4">
              <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-5">Summary</p>
              <p class="text-lg font-bold text-primary leading-relaxed">{{ parsedSummary() }}</p>
            </div>

            <!-- Raw details -->
            <div class="bg-white rounded-[2.5rem] p-8 shadow-card dash-item opacity-0 translate-y-4">
              <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-5">Full Details</p>
              <div class="space-y-3">
                @for (field of parsedFields(); track field.key) {
                  <div class="flex items-start gap-4 py-3 border-b border-neutral-50 last:border-none">
                    <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest w-28 shrink-0 mt-0.5">{{ field.key }}</p>
                    <p class="text-sm font-bold text-primary">{{ field.value }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between dash-item opacity-0 translate-y-4">
              <a routerLink="/app/notifications"
                class="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest hover:text-primary transition-colors">
                <span class="material-symbols-rounded sym-sm">arrow_back</span>
                Back to Inbox
              </a>
              @if (articleId()) {
                <a [routerLink]="['/app/articles', articleId()]"
                  class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition-all active:scale-95">
                  View Article
                  <span class="material-symbols-rounded sym-sm">arrow_forward</span>
                </a>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center py-32">
          <div class="w-8 h-8 border-2 border-neutral-100 border-t-primary rounded-full animate-spin"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);

  notification = signal<Message | null>(null);

  // ── Parsed fields ──────────────────────────────────────────────────────────

  private movType = computed(() => (this.notification()?.content || '').match(/Movement=(\w+)/)?.[1] ?? null);
  articleId = computed(() => {
    const m = (this.notification()?.content || '').match(/ArticleId=(\d+)/);
    return m ? Number(m[1]) : null;
  });
  private qty = computed(() => (this.notification()?.content || '').match(/Quantity=(\d+)/)?.[1] ?? null);

  parsedTitle = computed(() => {
    const mov = this.movType();
    const title = this.notification()?.title || '';
    if (mov === 'ENTRY') return 'Stock Inbound';
    if (mov === 'EXIT') return 'Stock Outbound';
    if (mov === 'CREATION') return 'Article Created';
    if (mov === 'UPDATE') return 'Article Updated';
    return title || 'System Message';
  });

  parsedSummary = computed(() => {
    const mov = this.movType();
    const art = this.articleId();
    const qty = this.qty();
    const raw = this.notification()?.content || '';

    if (mov === 'ENTRY' && art && qty) return `${qty} units were received into inventory for Article #${art}.`;
    if (mov === 'EXIT' && art && qty) return `${qty} units were dispatched from inventory for Article #${art}.`;
    if (mov === 'CREATION' && art) return `Article #${art} was registered in the system with ${qty ?? 0} initial units.`;
    if (mov === 'UPDATE' && art) return `Article #${art} was updated. Current quantity: ${qty ?? 'N/A'} units.`;
    return raw;
  });

  parsedFields = computed((): { key: string; value: string }[] => {
    const mov = this.movType();
    const art = this.articleId();
    const qty = this.qty();
    const fields: { key: string; value: string }[] = [];

    if (mov) fields.push({ key: 'Operation', value: mov });
    if (art) fields.push({ key: 'Article ID', value: `#${art}` });
    if (qty !== null) fields.push({ key: 'Quantity', value: `${qty} units` });

    // For non-movement messages, show raw content
    if (!mov) {
      const raw = this.notification()?.content || '';
      if (raw) fields.push({ key: 'Content', value: raw });
    }
    return fields;
  });

  typeLabel = computed(() => {
    const mov = this.movType();
    if (mov === 'ENTRY') return 'Stock Inbound';
    if (mov === 'EXIT') return 'Stock Outbound';
    if (mov === 'CREATION') return 'Article Created';
    if (mov === 'UPDATE') return 'Article Updated';
    return this.notification()?.title || 'System';
  });

  typeBadge = computed(() => {
    const mov = this.movType();
    if (mov === 'ENTRY') return 'bg-emerald-50 text-emerald-700';
    if (mov === 'EXIT') return 'bg-red-50 text-red-700';
    if (mov === 'CREATION') return 'bg-blue-50 text-blue-700';
    if (mov === 'UPDATE') return 'bg-amber-50 text-amber-700';
    return 'bg-neutral-100 text-neutral-600';
  });

  icon = computed(() => {
    const mov = this.movType();
    if (mov === 'ENTRY') return 'move_to_inbox';
    if (mov === 'EXIT') return 'outbox';
    if (mov === 'CREATION') return 'add_circle';
    if (mov === 'UPDATE') return 'edit';
    return 'notifications';
  });

  iconBg = computed(() => {
    const mov = this.movType();
    if (mov === 'ENTRY') return 'bg-emerald-50';
    if (mov === 'EXIT') return 'bg-red-50';
    if (mov === 'CREATION') return 'bg-blue-50';
    if (mov === 'UPDATE') return 'bg-amber-50';
    return 'bg-neutral-100';
  });

  iconColor = computed(() => {
    const mov = this.movType();
    if (mov === 'ENTRY') return 'text-emerald-600';
    if (mov === 'EXIT') return 'text-red-500';
    if (mov === 'CREATION') return 'text-blue-600';
    if (mov === 'UPDATE') return 'text-amber-600';
    return 'text-neutral-500';
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) this.load(id);
  }

  private load(id: number) {
    this.inventoryService.getMessageById(id).pipe(catchError(() => of(null))).subscribe(msg => {
      if (msg) {
        this.notification.set(msg);
        setTimeout(() => {
          const items = document.querySelectorAll('.dash-item');
          if (items.length) gsap.to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
        }, 60);
      }
    });
  }

  markAsRead() {
    const id = this.notification()?.id;
    if (id) this.inventoryService.markMessageAsRead(id).subscribe(u => this.notification.set(u));
  }
}
