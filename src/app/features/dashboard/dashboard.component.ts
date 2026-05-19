import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { DashboardStats, Alert, Article } from '../../core/models/api.models';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin, of, catchError } from 'rxjs';
import gsap from 'gsap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="space-y-5">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between di">
        <div>
          <h1 class="text-2xl font-display font-extrabold tracking-tight text-primary">Dashboard</h1>
          <p class="text-neutral-400 text-[10px] mt-0.5 uppercase tracking-widest font-bold">Business Intelligence</p>
        </div>
        <button (click)="downloadReport()"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-100 text-primary text-xs font-bold rounded-xl shadow-card hover:shadow-card-hover transition-all active:scale-95">
          <span class="material-symbols-rounded sym-sm">download</span>
          Export PDF
        </button>
      </div>

      <!-- ── Stat row ────────────────────────────────────────────────────── -->
      <div class="flex flex-wrap gap-3 di">
        @if (stats()) {
          @for (c of statCards(); track c.label) {
            <a [routerLink]="c.route"
              class="group bg-white rounded-2xl px-4 py-3 shadow-card hover:shadow-card-hover transition-all cursor-pointer active:scale-[0.97] flex items-center gap-3 min-w-[140px]">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" [class]="c.iconBg">
                <span class="material-symbols-rounded sym-sm" [class]="c.iconColor">{{ c.icon }}</span>
              </div>
              <div>
                <p class="text-[9px] font-black uppercase tracking-widest leading-none" [class]="c.labelColor">{{ c.label }}</p>
                <p class="text-2xl font-display font-extrabold text-primary leading-tight mt-0.5">{{ c.value }}</p>
              </div>
            </a>
          }
        } @else {
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-2xl px-4 py-3 min-w-[140px] animate-pulse shadow-card flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-neutral-50 shrink-0"></div>
              <div><div class="h-2 bg-neutral-50 rounded w-14 mb-2"></div><div class="h-5 bg-neutral-50 rounded w-8"></div></div>
            </div>
          }
        }
      </div>

      <!-- ── Stock health banner ─────────────────────────────────────────── -->
      @if (stats()) {
        <div class="rounded-xl px-4 py-3 flex items-center justify-between gap-4 di"
          [class]="lowStockCount() > 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-rounded sym-sm filled" [class]="lowStockCount() > 0 ? 'text-red-500' : 'text-emerald-500'">
              {{ lowStockCount() > 0 ? 'warning' : 'check_circle' }}
            </span>
            <p class="text-xs font-bold text-primary">
              @if (lowStockCount() > 0) {
                <span class="text-red-600">{{ lowStockCount() }}</span> articles running low on stock
              } @else {
                All stock levels are healthy
              }
            </p>
          </div>
          <a routerLink="/app/alerts"
            class="shrink-0 px-3 py-1 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all hover:opacity-90"
            [class]="lowStockCount() > 0 ? 'bg-red-500' : 'bg-emerald-500'">
            View <span class="material-symbols-rounded sym-sm">arrow_forward</span>
          </a>
        </div>
      }

      <!-- ── Main row: chart + alerts ────────────────────────────────────── -->
      <div class="grid grid-cols-3 gap-5 di">

        <!-- Inventory Flow — takes 2/3 width -->
        <div class="col-span-2 bg-white rounded-2xl p-5 shadow-card flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-display font-extrabold text-primary">Inventory Flow</h2>
              <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">Monthly stock movements</p>
            </div>
            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary inline-block"></span>Inbound</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent inline-block"></span>Outbound</span>
            </div>
          </div>
          <div class="flex-1" style="height:220px; position:relative;">
            @if (lineChartData()) {
              <canvas baseChart [data]="lineChartData()!" [options]="lineChartOptions" type="line" style="width:100%;height:100%;"></canvas>
            } @else {
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-neutral-100 border-t-primary rounded-full animate-spin"></div>
              </div>
            }
          </div>
        </div>

        <!-- Open Alerts — takes 1/3 width -->
        <div class="bg-white rounded-2xl p-5 shadow-card flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2 class="text-sm font-display font-extrabold text-primary">Open Alerts</h2>
              <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">Requires attention</p>
            </div>
            @if (alerts().length > 0) {
              <span class="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{{ alerts().length }}</span>
            }
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar space-y-1" style="max-height:200px;">
            @for (alert of alerts(); track alert.id) {
              <a [routerLink]="['/app/alerts', alert.id]"
                class="group flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" [class]="alertIconClass(alert.severity)">
                  <span class="material-symbols-rounded sym-sm">{{ alert.type === 'LOW_STOCK' ? 'inventory_2' : 'link_off' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-bold text-primary truncate group-hover:text-accent transition-colors">{{ alert.title }}</p>
                  <p class="text-[10px] text-neutral-400 mt-0.5 line-clamp-1 leading-snug">{{ alert.content }}</p>
                </div>
              </a>
            } @empty {
              <div class="flex flex-col items-center justify-center py-8 text-center">
                <div class="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
                  <span class="material-symbols-rounded sym-md text-emerald-500 filled">verified</span>
                </div>
                <p class="text-xs font-bold text-primary">All clear</p>
                <p class="text-[10px] text-neutral-400 mt-0.5">No open alerts</p>
              </div>
            }
          </div>

          @if (alerts().length > 0) {
            <a routerLink="/app/alerts"
              class="mt-3 pt-3 border-t border-neutral-50 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors">
              View all <span class="material-symbols-rounded sym-sm">arrow_forward</span>
            </a>
          }
        </div>
      </div>

      <!-- ── Bottom row: doughnut + bar ─────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-5 di">

        <!-- Category doughnut -->
        <div class="bg-white rounded-2xl p-5 shadow-card">
          <h2 class="text-sm font-display font-extrabold text-primary">Stock by Category</h2>
          <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5 mb-4">Article distribution</p>
          <!-- overflow-hidden clips the hover expansion -->
          <div style="height:200px; position:relative; overflow:hidden;">
            @if (doughnutChartData()) {
              <canvas baseChart [data]="doughnutChartData()!" [options]="doughnutChartOptions" type="doughnut" style="width:100%;height:100%;"></canvas>
            } @else {
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-neutral-100 border-t-primary rounded-full animate-spin"></div>
              </div>
            }
          </div>
        </div>

        <!-- Top articles bar -->
        <div class="bg-white rounded-2xl p-5 shadow-card">
          <h2 class="text-sm font-display font-extrabold text-primary">Top Articles</h2>
          <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5 mb-4">By stock quantity</p>
          <div style="height:200px; position:relative;">
            @if (barChartData()) {
              <canvas baseChart [data]="barChartData()!" [options]="barChartOptions" type="bar" style="width:100%;height:100%;"></canvas>
            } @else {
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-neutral-100 border-t-primary rounded-full animate-spin"></div>
              </div>
            }
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .di { opacity: 0; transform: translateY(12px); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private datePipe = inject(DatePipe);
  private cd = inject(ChangeDetectorRef);

  stats = signal<DashboardStats | null>(null);
  alerts = signal<Alert[]>([]);
  articles = signal<Article[]>([]);
  lowStockCount = computed(() => this.alerts().filter(a => a.type === 'LOW_STOCK').length);

  lineChartData = signal<ChartConfiguration<'line'>['data'] | null>(null);
  doughnutChartData = signal<ChartConfiguration<'doughnut'>['data'] | null>(null);
  barChartData = signal<ChartConfiguration<'bar'>['data'] | null>(null);

  statCards = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Articles',   value: s.numberOfArticles,  icon: 'inventory_2',    route: '/app/articles',   iconBg: 'bg-primary',     iconColor: 'text-white',       labelColor: 'text-neutral-400' },
      { label: 'Categories', value: s.numberOfCategorys, icon: 'category',       route: '/app/categories', iconBg: 'bg-blue-50',     iconColor: 'text-accent',      labelColor: 'text-neutral-400' },
      { label: 'Suppliers',  value: s.numberOfSuppliers, icon: 'local_shipping', route: '/app/suppliers',  iconBg: 'bg-neutral-100', iconColor: 'text-neutral-600', labelColor: 'text-neutral-400' },
      { label: 'Low Stock',  value: s.outOfStock,        icon: 'warning',        route: '/app/alerts',     iconBg: 'bg-red-50',      iconColor: 'text-red-500',     labelColor: 'text-red-400' },
    ];
  });

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, backgroundColor: '#fff', titleColor: '#0a0a0a', bodyColor: '#737373', borderColor: '#e5e5e5', borderWidth: 1, padding: 10, cornerRadius: 10, boxPadding: 4 }
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#f5f5f5' }, ticks: { padding: 8, font: { size: 11, family: 'Inter' }, color: '#a3a3a3' } },
      x: { grid: { display: false }, border: { display: false }, ticks: { padding: 8, font: { size: 11, family: 'Inter' }, color: '#a3a3a3' } }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 3, hitRadius: 10, hoverRadius: 5, borderWidth: 2, borderColor: '#fff' } }
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', padding: 10, font: { size: 11, family: 'Inter' }, color: '#737373' } },
      tooltip: { backgroundColor: '#fff', titleColor: '#0a0a0a', bodyColor: '#737373', borderColor: '#e5e5e5', borderWidth: 1, padding: 10, cornerRadius: 10 }
    },
    // hoverOffset 0 prevents segments from expanding outside the canvas
    animation: { animateRotate: true, animateScale: false }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#fff', titleColor: '#0a0a0a', bodyColor: '#737373', borderColor: '#e5e5e5', borderWidth: 1, padding: 10, cornerRadius: 10 }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#a3a3a3', padding: 4 } },
      y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#525252', padding: 4 } }
    }
  };

  ngOnInit() { this.fetchData(); }

  resolveAlert(id: number, event?: Event) {
    if (event) event.stopPropagation();
    this.inventoryService.resolveAlert(id).subscribe({ next: () => this.alerts.update(a => a.filter(x => x.id !== id)) });
  }

  alertIconClass(s: string): string {
    return ({ CRITICAL: 'bg-red-50 text-red-500', HIGH: 'bg-orange-50 text-orange-500', MEDIUM: 'bg-amber-50 text-amber-600', LOW: 'bg-blue-50 text-blue-500' } as Record<string,string>)[s] ?? 'bg-neutral-50 text-neutral-400';
  }

  downloadReport() {
    const doc = new jsPDF();
    const date = this.datePipe.transform(new Date(), 'longDate');
    doc.setFontSize(18); doc.setTextColor(40, 40, 40); doc.text('Vanguard Inventory OS', 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.text(`Generated: ${date}`, 14, 30);
    const s = this.stats();
    if (s) {
      autoTable(doc, { startY: 40, head: [['Metric', 'Value']], body: [['Articles', s.numberOfArticles.toString()], ['Categories', s.numberOfCategorys.toString()], ['Suppliers', s.numberOfSuppliers.toString()], ['Low Stock', s.outOfStock.toString()]], theme: 'striped', headStyles: { fillColor: [10, 10, 10] } });
    }
    doc.save('Vanguard-Report.pdf');
  }

  private fetchData() {
    forkJoin({
      stats:    this.inventoryService.getDashboardStats().pipe(catchError(() => of(null))),
      alerts:   this.inventoryService.getOpenAlerts().pipe(catchError(() => of([]))),
      entries:  this.inventoryService.getEntriesProgress().pipe(catchError(() => of([]))),
      exits:    this.inventoryService.getExitProgress().pipe(catchError(() => of([]))),
      articles: this.inventoryService.getAllArticles().pipe(catchError(() => of([])))
    }).subscribe(result => {
      this.stats.set(result.stats);
      this.alerts.set(result.alerts);
      this.articles.set(result.articles);
      this.buildLineChart(result.entries, result.exits);
      this.buildArticleCharts(result.articles);
      this.cd.detectChanges();
      this.animateEntrance();
    });
  }

  private animateEntrance() {
    setTimeout(() => {
      const items = document.querySelectorAll('.di');
      if (items.length) gsap.to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
    }, 50);
  }

  private buildLineChart(entries: any[], exits: any[]) {
    // Debug: log what we actually receive from the API
    console.log('[Dashboard] entries from API:', entries);
    console.log('[Dashboard] exits from API:', exits);

    // MySQL DATE_FORMAT returns YYYY-MM — collect all unique months
    // Handle both 'month' and 'totalQuantity' key casing from different MySQL drivers
    const getMonth = (e: any) => String(e.month ?? e.MONTH ?? '').trim();
    const getQty   = (e: any) => Number(e.totalQuantity ?? e.totalquantity ?? e.TOTALQUANTITY ?? 0);

    const rawMonths = Array.from(new Set([
      ...entries.map(getMonth).filter(Boolean),
      ...exits.map(getMonth).filter(Boolean)
    ])).sort();

    // Fallback: last 6 months with zero values so chart is never empty
    const fallback = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      return d.toISOString().slice(0, 7);
    });

    const months = rawMonths.length >= 1 ? rawMonths : fallback;

    const labels = months.map(m => {
      const [y, mo] = m.split('-');
      return new Date(+y, +mo - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    const getVal = (arr: any[], raw: string) => {
      const found = arr.find(x => getMonth(x) === raw);
      return found ? getQty(found) : 0;
    };

    this.lineChartData.set({
      labels,
      datasets: [
        { label: 'Inbound',  data: months.map(m => getVal(entries, m)), fill: true, borderColor: '#0a0a0a', backgroundColor: 'rgba(10,10,10,0.04)', pointBackgroundColor: '#0a0a0a', pointBorderColor: '#fff' },
        { label: 'Outbound', data: months.map(m => getVal(exits, m)),   fill: true, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff' }
      ]
    });
  }

  private buildArticleCharts(articles: Article[]) {
    const catMap = new Map<string, number>();
    articles.forEach(a => { const n = a.category?.name || 'Other'; catMap.set(n, (catMap.get(n) || 0) + 1); });

    this.doughnutChartData.set({
      labels: [...catMap.keys()],
      datasets: [{ data: [...catMap.values()], backgroundColor: ['#0a0a0a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'], borderWidth: 3, borderColor: '#fff', hoverOffset: 0 }]
    });

    const top = [...articles].sort((a, b) => b.quantity - a.quantity).slice(0, 6);
    this.barChartData.set({
      labels: top.map(a => a.name.length > 20 ? a.name.slice(0, 18) + '…' : a.name),
      datasets: [{ label: 'Units', data: top.map(a => a.quantity), backgroundColor: top.map(a => a.quantity === 0 ? '#fca5a5' : a.quantity <= 10 ? '#fcd34d' : '#0a0a0a'), borderRadius: 5, borderSkipped: false }]
    });
  }
}
