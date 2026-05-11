import { Component, ChangeDetectionStrategy, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { InventoryService } from '../core/services/inventory.service';
import { AuthService } from '../core/services/auth.service';
import { AlertMonitorService } from '../core/services/alert-monitor.service';
import { filter, Subject, takeUntil, timer } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="flex h-screen bg-[#F9F9F8] overflow-hidden font-sans text-neutral-900">
      
      <!-- Sidebar -->
      <aside #sidebar class="w-80 bg-white border-r border-neutral-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
        <div class="p-10 pb-6 shrink-0">
          <div class="flex items-center gap-3 group cursor-pointer" routerLink="/app/dashboard">
            <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <mat-icon class="text-2xl">grid_view</mat-icon>
            </div>
            <div>
              <span class="text-2xl font-display font-extrabold tracking-tighter block leading-none">Vanguard</span>
              <span class="text-[10px] font-black text-neutral-400 border-b border-neutral-100 uppercase tracking-widest mt-1">Inventory OS</span>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-6 space-y-2 mt-8 overflow-y-auto custom-scrollbar">
          <div class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-6 mb-4">Orchestration</div>
          
          <a routerLink="/app/dashboard" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">dashboard</mat-icon>
            <span class="text-sm font-bold">Dashboard</span>
          </a>

          <a routerLink="/app/articles" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">inventory_2</mat-icon>
            <span class="text-sm font-bold">Articles</span>
          </a>

          <a routerLink="/app/categories" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">category</mat-icon>
            <span class="text-sm font-bold">Categories</span>
          </a>

          <a routerLink="/app/suppliers" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">local_shipping</mat-icon>
            <span class="text-sm font-bold">Suppliers</span>
          </a>

          <div class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-6 mb-4 mt-8">Operations</div>

          <a routerLink="/app/entries" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">move_to_inbox</mat-icon>
            <span class="text-sm font-bold">Inbound Stock</span>
          </a>

          <a routerLink="/app/exits" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">outbox</mat-icon>
            <span class="text-sm font-bold">Outbound stock</span>
          </a>

          <a routerLink="/app/alerts" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">warning</mat-icon>
            <span class="text-sm font-bold">System Alerts</span>
          </a>

          <a routerLink="/app/notifications" routerLinkActive="active-link" 
             class="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-neutral-50 hover:text-primary transition-all duration-300 group nav-link">
            <mat-icon class="text-xl transition-transform group-[.active-link]:scale-110">chat_bubble</mat-icon>
            <span class="text-sm font-bold">Audit & Messages</span>
          </a>
        </nav>

        <div class="p-6 mt-auto border-t border-neutral-50 shrink-0">
          <div class="bg-neutral-50 rounded-[2.5rem] p-6 flex items-center gap-4 group hover:bg-neutral-100 transition-colors cursor-pointer">
            <div class="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-primary font-display font-black text-lg group-hover:scale-110 transition-transform shadow-sm">
              AD
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-primary truncate leading-none">Admin User</div>
              <div class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1.5">Manager</div>
            </div>
            <button (click)="logout()" class="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm">
              <mat-icon class="scale-90">logout</mat-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        
        <!-- Header -->
        <header class="h-24 bg-white/50 backdrop-blur-xl border-b border-neutral-100 flex items-center justify-between px-10 z-10 sticky top-0">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">
              <span>Admin</span>
              <mat-icon class="text-[10px] !w-auto !h-auto flex items-center justify-center">chevron_right</mat-icon>
              <span class="text-primary">{{ currentRoute() }}</span>
            </div>
            <h2 class="text-2xl font-display font-extrabold capitalize leading-none tracking-tight">{{ currentRoute() }}</h2>
          </div>
          
          <div class="flex items-center gap-6">
            <button routerLink="/app/notifications" class="relative group">
              <div class="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-primary group-hover:border-accent group-hover:bg-accent/5 transition-all">
                <mat-icon>notifications</mat-icon>
              </div>
              @if (unreadCount() > 0) {
                 <span class="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full border-4 border-white text-[10px] font-bold text-white flex items-center justify-center">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
              }
            </button>
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
       box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
    }
    .nav-link.active-link mat-icon {
       color: white;
       transform: scale(1.1);
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
  currentRoute = signal('dashboard');
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.animateSidebar();
    this.alertMonitor.startMonitoring();

    timer(0, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.inventoryService.getUnreadCount().subscribe({
          next: (count) => this.unreadCount.set(count),
          error: (err: unknown) => console.error('Failed to get notification count', err)
        });
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const segments = event.urlAfterRedirects.split('/');
        const url = segments[segments.length - 1];
        this.currentRoute.set(url || 'dashboard');
      });
  }

  onMouseEnter(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    gsap.to(el, {
      x: 10,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  onMouseLeave(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    gsap.to(el, {
      x: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  private animateSidebar() {
    gsap.from('aside', {
      x: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out'
    });
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

