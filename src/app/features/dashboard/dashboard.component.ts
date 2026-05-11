import { Component, ChangeDetectionStrategy, inject, OnInit, signal, effect, computed, untracked, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { DashboardStats, Alert, Article } from '../../core/models/api.models';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of, catchError } from 'rxjs';
import gsap from 'gsap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatIconModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-10 dashboard-container">
      
      <div class="flex items-center justify-between animate-item opacity-0">
        <div>
          <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Dashboard</h1>
          <p class="text-neutral-400 font-medium text-sm mt-2 uppercase tracking-widest">Business Intelligence Suite</p>
        </div>
        <div class="flex gap-4">
          <button (click)="downloadReport()" class="px-6 py-3 bg-white border border-neutral-100 text-primary text-sm font-bold rounded-2xl hover:bg-neutral-50 hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-3">
            <mat-icon class="scale-90">file_download</mat-icon>
            Export PDF
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        @if (stats()) {
          <div routerLink="/app/articles" class="group bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 animate-item opacity-0 transform translate-y-8 relative overflow-hidden cursor-pointer active:scale-95">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
            <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <mat-icon class="text-2xl">inventory_2</mat-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Articles</p>
              <h3 class="text-4xl font-display font-extrabold text-primary">{{ stats()?.numberOfArticles }}</h3>
            </div>
          </div>
          
          <div routerLink="/app/categories" class="group bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 animate-item opacity-0 transform translate-y-8 relative overflow-hidden cursor-pointer active:scale-95">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
            <div class="w-14 h-14 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-accent mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <mat-icon class="text-2xl">category</mat-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Categories</p>
              <h3 class="text-4xl font-display font-extrabold text-primary">{{ stats()?.numberOfCategorys }}</h3>
            </div>
          </div>

          <div routerLink="/app/suppliers" class="group bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 animate-item opacity-0 transform translate-y-8 relative overflow-hidden cursor-pointer active:scale-95">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-neutral-100 rounded-full blur-2xl group-hover:bg-neutral-200 transition-colors"></div>
            <div class="w-14 h-14 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <mat-icon class="text-2xl">local_shipping</mat-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Suppliers</p>
              <h3 class="text-4xl font-display font-extrabold text-primary">{{ stats()?.numberOfSuppliers }}</h3>
            </div>
          </div>

          <div routerLink="/app/alerts" class="group bg-white rounded-[2.5rem] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 animate-item opacity-0 transform translate-y-8 relative overflow-hidden cursor-pointer active:scale-95">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full blur-2xl group-hover:bg-red-100 transition-colors"></div>
            <div class="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <mat-icon class="text-2xl">error_outline</mat-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Stock Alerts</p>
              <h3 class="text-4xl font-display font-extrabold text-primary">{{ stats()?.outOfStock }}</h3>
            </div>
          </div>
        } @else {
          <!-- Skeletons -->
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-[2.5rem] p-8 h-48 animate-pulse shadow-sm border border-neutral-50 flex flex-col justify-end">
              <div class="w-14 h-14 rounded-2xl bg-neutral-50 mb-auto"></div>
              <div class="h-4 bg-neutral-50 rounded w-24 mb-2"></div>
              <div class="h-8 bg-neutral-50 rounded w-16"></div>
            </div>
          }
        }
      </div>

      <!-- Low Stock Alerts Summary Section -->
      <div 
        class="border rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-item opacity-0 transform translate-y-4"
        [class.bg-red-50]="lowStockCount() > 0"
        [class.border-red-100]="lowStockCount() > 0"
        [class.bg-emerald-50]="lowStockCount() === 0"
        [class.border-emerald-100]="lowStockCount() === 0">
        
        <div class="flex items-center gap-6">
          <div 
            class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0"
            [class.text-red-500]="lowStockCount() > 0"
            [class.text-emerald-500]="lowStockCount() === 0">
            <mat-icon>{{ lowStockCount() > 0 ? 'warning' : 'check_circle' }}</mat-icon>
          </div>
          <div>
            <h3 class="text-xl font-display font-extrabold text-primary">Low Stock Summary</h3>
            @if (lowStockCount() > 0) {
              <p class="text-sm text-neutral-500 mt-1 flex flex-wrap items-center gap-1">
                There are currently <span class="font-bold text-red-500 bg-red-100/50 px-2 py-0.5 rounded-lg">{{ lowStockCount() }}</span> articles running low on inventory.
              </p>
            } @else {
              <p class="text-sm text-neutral-500 mt-1">All articles have sufficient stock levels.</p>
            }
          </div>
        </div>
        
        <a routerLink="/app/alerts" 
          class="px-6 py-3 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
          [class.bg-red-500]="lowStockCount() > 0"
          [class.shadow-red-500/20]="lowStockCount() > 0"
          [class.bg-emerald-500]="lowStockCount() === 0"
          [class.shadow-emerald-500/20]="lowStockCount() === 0">
          View Alerts <mat-icon class="scale-75">arrow_forward</mat-icon>
        </a>
      </div>

      <!-- Charts & Alerts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-item opacity-0">
        <!-- Main Chart -->
        <div class="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col">
          <div class="mb-10 flex justify-between items-end">
            <div>
              <h2 class="text-2xl font-display font-extrabold tracking-tight text-primary">Inventory Flow</h2>
              <p class="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">Real-time Movement Analytics</p>
            </div>
            <div class="flex items-center gap-4 bg-neutral-50 p-1.5 rounded-2xl">
              <button class="px-4 py-2 text-xs font-bold rounded-xl bg-white shadow-sm text-primary transition-all">Yearly</button>
              <button class="px-4 py-2 text-xs font-bold rounded-xl text-neutral-400 hover:text-primary transition-all">Monthly</button>
            </div>
          </div>
          <div class="flex-1 w-full h-[400px]">
            @if (lineChartData()) {
              <canvas baseChart #chartCanvas
                [data]="lineChartData()!" 
                [options]="lineChartOptions" 
                [type]="'line'">
              </canvas>
            }
          </div>
        </div>

        <!-- Recent Alerts -->
        <div class="bg-white rounded-[3rem] p-10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col h-[550px]">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-display font-extrabold tracking-tight text-primary">Open Alerts</h2>
              <p class="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Critical Priority</p>
            </div>
            <span class="w-8 h-8 rounded-full bg-red-50 text-red-500 text-[10px] font-black flex items-center justify-center">{{ alerts().length }}</span>
          </div>
          
          <div class="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            @for (alert of alerts(); track alert.id) {
              <div [routerLink]="['/app/alerts', alert.id]" class="flex gap-5 alert-card group cursor-pointer animate-item opacity-0">
                <div [class]="'w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center transition-all group-hover:scale-110 ' + getAlertColor(alert.severity)">
                  <mat-icon class="scale-90">
                    {{ alert.type === 'LOW_STOCK' ? 'inventory_2' : 'priority_high' }}
                  </mat-icon>
                </div>
                <div class="flex-1 min-w-0 border-b border-neutral-50 pb-6 group-last:border-none">
                  <div class="flex justify-between items-start mb-1">
                    <h4 class="text-sm font-bold text-primary truncate pr-2 group-hover:text-accent transition-colors">{{ alert.title }}</h4>
                  </div>
                  <p class="text-xs text-neutral-400 font-medium leading-relaxed line-clamp-2">{{ alert.content }}</p>
                  <div class="mt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button (click)="resolveAlert(alert.id, $event)" class="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-xl hover:bg-neutral-800 transition-colors uppercase tracking-widest">Mark Resolved</button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center text-center py-20">
                <div class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6 group">
                   <mat-icon class="text-4xl group-hover:rotate-12 transition-transform">verified</mat-icon>
                </div>
                <h5 class="text-sm font-bold text-primary">All Clear!</h5>
                <p class="text-xs text-neutral-400 mt-2 font-medium">No inventory discrepancies found.</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Secondary Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-item opacity-0">
        <!-- Category Distribution -->
        <div class="bg-white rounded-[3rem] p-10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col">
          <h2 class="text-2xl font-display font-extrabold tracking-tight text-primary mb-2">Stock by Category</h2>
          <p class="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-8">Article Distribution Across Units</p>
          <div class="flex-1 h-[300px]">
            @if (doughnutChartData()) {
              <canvas baseChart 
                [data]="doughnutChartData()!" 
                [options]="doughnutChartOptions" 
                [type]="'doughnut'">
              </canvas>
            }
          </div>
        </div>

        <!-- Top Articles -->
        <div class="bg-white rounded-[3rem] p-10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col">
          <h2 class="text-2xl font-display font-extrabold tracking-tight text-primary mb-2">Top Stock Articles</h2>
          <p class="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-8">Highest Quantity Items in Inventory</p>
          <div class="flex-1 h-[300px]">
            @if (barChartData()) {
              <canvas baseChart 
                [data]="barChartData()!" 
                [options]="barChartOptions" 
                [type]="'bar'">
              </canvas>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private datePipe = inject(DatePipe);

  stats = signal<DashboardStats | null>(null);
  alerts = signal<Alert[]>([]);
  articles = signal<Article[]>([]);
  lowStockCount = computed(() => this.alerts().filter(alert => alert.type === 'LOW_STOCK').length);
  
  lineChartData = signal<ChartConfiguration<'line'>['data'] | null>(null);
  doughnutChartData = signal<ChartConfiguration<'doughnut'>['data'] | null>(null);
  barChartData = signal<ChartConfiguration<'bar'>['data'] | null>(null);

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#171717',
        bodyColor: '#525252',
        borderColor: '#e5e5e5',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6
      }
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#f5f5f5' } },
      x: { grid: { display: false } }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 0, hitRadius: 10, hoverRadius: 6 }
    }
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } }
    }
  };

  private cd = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      // Trigger whenever core data updates
      this.stats();
      this.alerts();
      this.lineChartData();
      
      untracked(() => {
        this.animateEntrance();
      });
    });
  }

  ngOnInit() {
    this.fetchData();
  }

  resolveAlert(id: number, event?: Event) {
    if (event) event.stopPropagation();
    this.inventoryService.resolveAlert(id).subscribe({
      next: () => {
        this.alerts.update(alerts => alerts.filter(a => a.id !== id));
      },
      error: (err) => console.error('Error resolving alert:', err)
    });
  }

  downloadReport() {
    const doc = new jsPDF();
    const currentDate = this.datePipe.transform(new Date(), 'longDate');
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('Vanguard Inventory OS', 14, 22);
    
    // Add subtitle
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${currentDate}`, 14, 30);
    doc.text(`Role: Administrator`, 14, 36);

    // Add Stats Overview
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text('Dashboard Overview', 14, 50);

    const s = this.stats();
    if (s) {
      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Count']],
        body: [
          ['Total Articles', s.numberOfArticles.toString()],
          ['Categories', s.numberOfCategorys.toString()],
          ['Suppliers', s.numberOfSuppliers.toString()],
          ['Out of Stock', s.outOfStock.toString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });
    }

    // Add Open Alerts
    const openAlerts = this.alerts();
    const finalY = (doc as any).lastAutoTable?.finalY || 60;
    
    if (openAlerts.length > 0) {
      doc.setFontSize(16);
      doc.text('Active Alerts', 14, finalY + 20);
      
      const body = openAlerts.map(a => [
        a.severity,
        a.type.replace('_', ' '),
        a.title,
        a.content
      ]);

      autoTable(doc, {
        startY: finalY + 25,
        head: [['Severity', 'Type', 'Title', 'Details']],
        body: body,
        theme: 'plain',
        headStyles: { textColor: [220, 38, 38] },
        styles: { cellWidth: 'wrap' },
        columnStyles: { 3: { cellWidth: 80 } } // Give details more space
      });
    }

    doc.save('Vanguard-Inventory-Report.pdf');
  }

  getAlertColor(severity: string) {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-600';
      case 'HIGH': return 'bg-orange-100 text-orange-600';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  }

  private fetchData() {
    forkJoin({
      stats: this.inventoryService.getDashboardStats().pipe(catchError((err) => {
        console.error('Stats failed:', err);
        return of(null);
      })),
      alerts: this.inventoryService.getOpenAlerts().pipe(catchError((err) => {
        console.error('Alerts failed:', err);
        return of([]);
      })),
      entries: this.inventoryService.getEntriesProgress().pipe(catchError((err) => {
        console.error('Entries failed:', err);
        return of([]);
      })),
      exits: this.inventoryService.getExitProgress().pipe(catchError((err) => {
        console.error('Exits failed:', err);
        return of([]);
      })),
      articles: this.inventoryService.getAllArticles().pipe(catchError((err) => {
        console.error('Articles failed:', err);
        return of([]);
      }))
    }).subscribe({
      next: (result) => {
        this.stats.set(result.stats);
        this.alerts.set(result.alerts);
        this.articles.set(result.articles);
        this.processChartData(result.entries, result.exits);
        this.processArticleCharts(result.articles);
        this.animateEntrance();
      },
      error: () => {
        this.animateEntrance();
      }
    });
  }

  private animateEntrance() {
    // Ensure CD has run so elements are in DOM
    this.cd.detectChanges();
    
    // Use a slightly longer delay to ensure DOM is ready
    setTimeout(() => {
      const items = document.querySelectorAll('.animate-item');
      if (items.length) {
        // Kill existing animations on these items to avoid conflicts
        gsap.killTweensOf(items);
        
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power4.out',
          overwrite: true
        });
      }
    }, 100);
  }

  private processChartData(entries: any[], exits: any[]) {
    // Extract unique months for labels and sort them
    const monthOrder = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const allRawMonths = Array.from(new Set([
      ...entries.map(e => e.month),
      ...exits.map(e => e.month)
    ]));

    let labels: string[] = [];
    if (allRawMonths.length > 0) {
      labels = allRawMonths.sort((a, b) => {
        const idxA = monthOrder.indexOf(a.toUpperCase());
        const idxB = monthOrder.indexOf(b.toUpperCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.localeCompare(b);
      });
    } else {
      labels = shortMonths.slice(0, 6);
    }

    const getVal = (arr: any[], m: string) => 
      arr.find(x => x.month.toUpperCase() === m.toUpperCase())?.totalQuantity || 0;

    this.lineChartData.set({
      labels: labels,
      datasets: [
        {
          label: 'Stock Entries',
          data: labels.map(m => getVal(entries, m)),
          fill: true,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.05)',
          tension: 0.4,
          pointBackgroundColor: '#4f46e5'
        },
        {
          label: 'Stock Exits',
          data: labels.map(m => getVal(exits, m)),
          fill: true,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.05)',
          tension: 0.4,
          pointBackgroundColor: '#059669'
        }
      ]
    });
  }

  private processArticleCharts(articles: Article[]) {
    // 1. Category Distribution
    const catMap = new Map<string, number>();
    articles.forEach(art => {
      const catName = art.category?.name || 'Uncategorized';
      catMap.set(catName, (catMap.get(catName) || 0) + 1);
    });

    this.doughnutChartData.set({
      labels: Array.from(catMap.keys()),
      datasets: [{
        data: Array.from(catMap.values()),
        backgroundColor: [
          '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
        ]
      }]
    });

    // 2. Top Articles by Quantity
    const topArticles = [...articles]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    this.barChartData.set({
      labels: topArticles.map(a => a.name),
      datasets: [{
        label: 'Stock Quantity',
        data: topArticles.map(a => a.quantity),
        backgroundColor: '#4f46e5',
        borderRadius: 8
      }]
    });
  }
}
