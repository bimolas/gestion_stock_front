import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { Message } from '../../core/models/api.models';
import { MatIconModule } from '@angular/material/icon';
import { of, catchError, map } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 detail-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item opacity-0">
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <button routerLink="/app/notifications" class="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <p class="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.3em]">Communication Center</p>
          </div>
          <h1 class="text-5xl font-display font-extrabold tracking-tight text-primary leading-none">
            {{ notification()?.title || 'Loading...' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
          @if (notification() && !notification()?.read) {
            <button (click)="markAsRead()" class="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <mat-icon class="scale-90">done_all</mat-icon>
              Mark as Read
            </button>
          } @else {
             <div class="px-6 py-4 bg-neutral-100 text-neutral-400 rounded-2xl font-bold text-sm flex items-center gap-3">
               <mat-icon class="scale-90">read_more</mat-icon>
               Already Read
             </div>
          }
        </div>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-[3rem] p-12 shadow-sm animate-item opacity-0 space-y-10">
          <div class="flex items-center gap-6 pb-10 border-b border-neutral-50">
             <div class="w-16 h-16 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <mat-icon class="text-3xl">notifications_active</mat-icon>
             </div>
             <div>
                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Received On</p>
                <p class="text-lg font-bold text-primary">{{ notification()?.createdAt | date:'long' }}</p>
             </div>
          </div>

          <div class="prose prose-neutral max-w-none">
             <p class="text-xl font-medium text-neutral-600 leading-loose whitespace-pre-wrap">
               {{ notification()?.content }}
             </p>
          </div>

          <div class="pt-10 border-t border-neutral-50 flex flex-wrap gap-4">
             <div class="px-5 py-3 bg-neutral-50 rounded-xl flex items-center gap-3">
                <mat-icon class="text-neutral-400 scale-75">fingerprint</mat-icon>
                <span class="text-xs font-bold text-neutral-500 uppercase tracking-widest">ID: #MSG-{{ notification()?.id }}</span>
             </div>
             <div class="px-5 py-3 bg-neutral-50 rounded-xl flex items-center gap-3">
                <mat-icon class="text-neutral-400 scale-75">security</mat-icon>
                <span class="text-xs font-bold text-neutral-500 uppercase tracking-widest">System Broadcast</span>
             </div>
          </div>
        </div>
        
        <div class="mt-8 flex justify-center animate-item opacity-0">
           <button routerLink="/app/notifications" class="text-xs font-black text-neutral-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
              Back to Inbox
              <mat-icon class="scale-75">east</mat-icon>
           </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  
  notification = signal<Message | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadNotificationData(id);
    }
  }

  private loadNotificationData(id: number) {
    this.inventoryService.getAllMessages().pipe(
      map(msgs => msgs.find(m => m.id === id) || null),
      catchError(err => {
        console.error('Error finding notification:', err);
        return of(null);
      })
    ).subscribe(msg => {
      if (msg) {
        this.notification.set(msg);
        this.animateEntrance();
      }
    });
  }

  markAsRead() {
    const id = this.notification()?.id;
    if (id) {
      this.inventoryService.markMessageAsRead(id).subscribe(updated => {
        this.notification.set(updated);
      });
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
