import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Message } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-4xl font-display font-extrabold tracking-tight text-primary leading-none">Notifications</h1>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        @if (isLoading()) {
          <div class="p-20 text-center flex flex-col items-center justify-center">
             <div class="w-16 h-16 border-4 border-neutral-100 border-t-primary rounded-full animate-spin mb-6"></div>
             <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Scanning Inbox...</p>
          </div>
        } @else if (messages().length === 0) {
          <div class="p-20 text-center flex flex-col items-center justify-center">
            <mat-icon class="text-6xl text-neutral-100 mb-6">notifications_off</mat-icon>
            <h3 class="text-lg font-bold text-primary">Inbox is Clear</h3>
            <p class="text-sm text-neutral-400 font-medium mt-1">You'll be notified when something happens.</p>
          </div>
        } @else {
          <div class="divide-y divide-neutral-50">
            @for (msg of messages(); track msg.id) {
              <div 
                [routerLink]="['/app/notifications', msg.id]"
                [class.bg-primary/5]="!msg.read"
                class="p-8 flex items-start gap-8 transition-all hover:bg-neutral-50 cursor-pointer group"
              >
                <div [class]="!msg.read ? 'bg-primary text-white' : 'bg-neutral-50 text-neutral-400'" class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                   <mat-icon>{{ !msg.read ? 'chat_bubble' : 'mail_outline' }}</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-4 mb-2">
                    <h3 class="text-lg font-bold text-primary truncate" [class.text-accent]="!msg.read">{{ msg.title }}</h3>
                    <span class="text-xs font-bold text-neutral-400 whitespace-nowrap">{{ msg.createdAt | date:'shortTime' }} • {{ msg.createdAt | date:'MMM d' }}</span>
                  </div>
                  <p class="text-neutral-500 font-medium leading-relaxed line-clamp-2">{{ msg.content }}</p>
                </div>
                @if (!msg.read) {
                  <button 
                    (click)="markAsRead(msg.id, $event)"
                    class="w-12 h-12 bg-white border border-neutral-100 text-primary hover:bg-primary hover:text-white rounded-2xl shadow-sm transition-all flex items-center justify-center shrink-0"
                    title="Quick Mark as Read"
                  >
                    <mat-icon class="scale-90">done</mat-icon>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  
  messages = signal<Message[]>([]);
  isLoading = signal(true);
  private refresh$ = new BehaviorSubject<void>(undefined);

  ngOnInit() {
    this.refresh$.pipe(
      switchMap(() => this.inventoryService.getAllMessages())
    ).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  markAsRead(id: number, event?: Event) {
    if (event) event.stopPropagation();
    this.inventoryService.markMessageAsRead(id).subscribe({
      next: () => this.refresh$.next()
    });
  }
}
