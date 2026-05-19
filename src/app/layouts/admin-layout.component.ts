import { Component, ChangeDetectionStrategy, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../core/services/inventory.service';
import { AuthService } from '../core/services/auth.service';
import { AlertMonitorService } from '../core/services/alert-monitor.service';
import { Message } from '../core/models/api.models';
import { filter, Subject, takeUntil, timer } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-[#F9F9F8] overflow-hidden font-sans text-neutral-900">
      
      <!-- Sidebar -->
      <aside class="w-80 bg-white border-r border-neutral-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
        <div class="p-10 pb-6 shrink-0">
          <div class="flex items-center gap-3 group cursor-pointer" routerLink="/app/dashboard">
            <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <span class="material-symbols-rounded text-2xl">grid_view</span>
            </div>
            <div>
              <span class="text-2xl font-display font-extrabold tracking-tighter block leading-none">Vanguard</span>
              <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Inventory OS</span>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-6 space-y-1 mt-6 overflow-y-auto custom-scrollbar">
          <p class="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em] px-4 mb-3">Orchestration</p>
          
          @for (link of navLinks.slice(0, 4); track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active-link"
               class="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-200 group nav-link">
              <span class="material-symbols-rounded text-xl">{{ link.icon }}</span>
              <span class="text-sm font-bold">{{ link.label }}</span>
            </a>
          }

          <p class="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em] px-4 mb-3 mt-6">Operations</p>

          @for (link of navLinks.slice(4); track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active-link"
               class="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-200 group nav-link">
              <span class="material-symbols-rounded text-xl">{{ link.icon }}</span>
              <span class="text-sm font-bold">{{ link.label }}</span>
              @if (link.path === '/app/alerts' && openAlertCount() > 0) {
                <span class="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {{ openAlertCount() > 9 ? '9+' : openAlertCount() }}
                </span>
              }
              @if (link.path === '/app/notifications' && unreadCount() > 0) {
                <span class="ml-auto w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                </span>
              }
            </a>
          }
        </nav>

        <div class="p-6 mt-auto border-t border-neutral-50 shrink-0">
          <div class="bg-neutral-50 rounded-[2rem] p-5 flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display font-black text-sm shadow-sm">
              AD
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-primary truncate leading-none">Admin User</div>
              <div class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Manager</div>
            </div>
            <button (click)="logout()" title="Sign out"
              class="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <span class="material-symbols-rounded text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        
        <!-- Header -->
        <header class="h-20 bg-white border-b border-neutral-100 flex items-center justify-between px-10 z-20 sticky top-0">
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em] mb-0.5">
              <span>Admin</span>
              <span class="material-symbols-rounded" style="font-size:10px;width:12px;height:12px">chevron_right</span>
              <span class="text-neutral-500">{{ currentRoute() }}</span>
            </div>
            <h2 class="text-xl font-display font-extrabold capitalize leading-none tracking-tight text-primary">{{ currentRoute() }}</h2>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Notification bell with dropdown -->
            <div class="relative" (mouseenter)="showNotifDropdown.set(true)" (mouseleave)="showNotifDropdown.set(false)">
              <button routerLink="/app/notifications"
                class="relative w-11 h-11 rounded-2xl bg-[#F9F9F8] border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-primary hover:border-neutral-200 transition-all">
                <span class="material-symbols-rounded text-xl">notifications</span>
                @if (unreadCount() > 0) {
                  <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
                    {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                  </span>
                }
              </button>

              <!-- Dropdown -->
              @if (showNotifDropdown() && recentMessages().length > 0) {
                <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-[1.5rem] shadow-2xl shadow-neutral-200/80 border border-neutral-100 overflow-hidden z-50">
                  <div class="px-5 py-4 border-b border-neutral-50 flex items-center justify-between">
                    <span class="text-xs font-black text-neutral-400 uppercase tracking-widest">Recent Activity</span>
                    @if (unreadCount() > 0) {
                      <span class="text-[10px] font-bold text-accent">{{ unreadCount() }} unread</span>
                    }
                  </div>
                  <div class="divide-y divide-neutral-50">
                    @for (msg of recentMessages(); track msg.id) {
                      <a [routerLink]="['/app/notifications', msg.id]"
                         class="flex items-start gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                         (click)="showNotifDropdown.set(false)">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                             [class]="getDropdownIconClass(msg)">
                          <span class="material-symbols-rounded text-sm">{{ getDropdownIcon(msg) }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-bold text-primary truncate">{{ parseDropdownTitle(msg) }}</p>
                          <p class="text-[10px] text-neutral-400 font-medium mt-0.5 truncate">{{ parseDropdownContent(msg) }}</p>
                        </div>
                        @if (!msg.read) {
                          <div class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        }
                      </a>
                    }
                  </div>
                  <a routerLink="/app/notifications" (click)="showNotifDropdown.set(false)"
                     class="flex items-center justify-center gap-2 px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:text-primary hover:bg-neutral-50 transition-colors border-t border-neutral-50">
                    View all messages
                    <span class="material-symbols-rounded text-sm">arrow_forward</span>
                  </a>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-[#F9F9F8] p-10 scroll-smooth" id="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      
    </div>
  `,
  styles: [`
    :host { display: block; }
    .nav-link.active-link {
      background-color: var(--color-primary);
      color: white;
    }
    .nav-link.active-link span {
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertMonitor = inject(AlertMonitorService);
  
  unreadCount = signal(0);
  openAlertCount = signal(0);
  currentRoute = signal('dashboard');
  showNotifDropdown = signal(false);
  recentMessages = signal<Message[]>([]);
  private destroy$ = new Subject<void>();

  navLinks = [
    { path: '/app/dashboard',     icon: 'dashboard',       label: 'Dashboard' },
    { path: '/app/articles',      icon: 'inventory_2',     label: 'Articles' },
    { path: '/app/categories',    icon: 'category',        label: 'Categories' },
    { path: '/app/suppliers',     icon: 'local_shipping',  label: 'Suppliers' },
    { path: '/app/entries',       icon: 'move_to_inbox',   label: 'Inbound Stock' },
    { path: '/app/exits',         icon: 'outbox',          label: 'Outbound Stock' },
    { path: '/app/alerts',        icon: 'warning_amber',   label: 'System Alerts' },
    { path: '/app/notifications', icon: 'chat_bubble',     label: 'Audit & Messages' },
  ];

  ngOnInit() {
    gsap.from('aside', { x: -80, opacity: 0, duration: 0.6, ease: 'power3.out' });
    this.alertMonitor.startMonitoring();

    // Poll unread count + recent messages every 30s
    timer(0, 30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.inventoryService.getUnreadCount().subscribe({
        next: (count) => this.unreadCount.set(Number(count))
      });
      this.inventoryService.getAllMessages().subscribe({
        next: (msgs) => {
          const sorted = [...msgs].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.recentMessages.set(sorted.slice(0, 3));
        }
      });
      this.inventoryService.getOpenAlerts().subscribe({
        next: (alerts) => this.openAlertCount.set(alerts.length)
      });
    });

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((e: NavigationEnd) => {
      const parts = e.urlAfterRedirects.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || 'dashboard';
      // Map path segments to readable names
      const labels: Record<string, string> = {
        dashboard: 'Dashboard', articles: 'Articles', categories: 'Categories',
        suppliers: 'Suppliers', entries: 'Inbound Stock', exits: 'Outbound Stock',
        alerts: 'System Alerts', notifications: 'Audit & Messages'
      };
      this.currentRoute.set(labels[last] || last);
    });
  }

  parseDropdownTitle(msg: Message): string {
    const raw = msg.content || '';
    const m = raw.match(/Movement=(\w+)/);
    if (m) return m[1] === 'ENTRY' ? 'Stock Inbound' : 'Stock Outbound';
    return msg.title || 'System Message';
  }

  parseDropdownContent(msg: Message): string {
    const raw = msg.content || '';
    const mov = raw.match(/Movement=(\w+)/);
    const art = raw.match(/ArticleId=(\d+)/);
    const qty = raw.match(/Quantity=(\d+)/);
    if (mov && art && qty) {
      const verb = mov[1] === 'ENTRY' ? 'in' : 'out';
      return `${qty[1]} units ${verb} — Article #${art[1]}`;
    }
    return raw.slice(0, 50);
  }

  getDropdownIcon(msg: Message): string {
    const raw = msg.content || '';
    if (raw.includes('Movement=ENTRY')) return 'move_to_inbox';
    if (raw.includes('Movement=EXIT')) return 'outbox';
    return 'notifications';
  }

  getDropdownIconClass(msg: Message): string {
    const raw = msg.content || '';
    if (raw.includes('Movement=ENTRY')) return 'bg-emerald-50 text-emerald-600';
    if (raw.includes('Movement=EXIT')) return 'bg-red-50 text-red-500';
    return 'bg-neutral-100 text-neutral-500';
  }

  logout() { this.authService.logout(); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
