import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  Article, CreateArticleDto, UpdateArticleDto,
  Category, CreateCategoryDto, UpdateCategoryDto,
  Supplier, CreateSupplierDto, UpdateSupplierDto,
  Alert,
  DashboardStats, StockEntryProgressDto, StockExitProgressDto,
  Message,
  StockEntry, CreateStockEntryDto, UpdateStockEntryDto,
  StockExit, CreateStockExitDto, UpdateStockExitDto
} from '../models/api.models';

const API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API}/Api/Dashboard/GetDashboardStats`);
  }
  getExitProgress(): Observable<StockExitProgressDto[]> {
    return this.http.get<StockExitProgressDto[]>(`${API}/Api/Dashboard/GetExitProgress`);
  }
  getEntriesProgress(): Observable<StockEntryProgressDto[]> {
    return this.http.get<StockEntryProgressDto[]>(`${API}/Api/Dashboard/GetEntriesProgress`);
  }
  getArticleHistory(id: number): Observable<object[]> {
    return this.http.get<object[]>(`${API}/Api/Dashboard/GetArticleHistory/${id}`);
  }

  // ─── Articles ──────────────────────────────────────────────────────────────
  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${API}/Api/Article/GetAllArticles`);
  }
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${API}/Api/Article/GetArticleById/${id}`);
  }
  getArticlesByCategory(categoryId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${API}/Api/Article/GetArticlesByCategory/${categoryId}`);
  }
  getArticlesBySupplier(supplierId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${API}/Api/Article/GetArticlesBySupplier/${supplierId}`);
  }
  createArticle(data: CreateArticleDto): Observable<Article> {
    return this.http.post<Article>(`${API}/Api/Article/CreateArticle`, data);
  }
  updateArticle(id: number, data: UpdateArticleDto): Observable<Article> {
    return this.http.put<Article>(`${API}/Api/Article/UpdateArticle/${id}`, data);
  }

  // ─── Categories ────────────────────────────────────────────────────────────
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API}/Api/Category/GetAllCategorys`);
  }
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${API}/Api/Category/GetCategoryById/${id}`);
  }
  createCategory(data: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${API}/Api/Category/CreateCategory`, data);
  }
  updateCategory(id: number, data: UpdateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${API}/Api/Category/UpdateCategory/${id}`, data);
  }

  // ─── Suppliers ─────────────────────────────────────────────────────────────
  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${API}/Api/Supplier/GetAllSuppliers`);
  }
  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${API}/Api/Supplier/GetSupplierById/${id}`);
  }
  createSupplier(data: CreateSupplierDto): Observable<Supplier> {
    return this.http.post<Supplier>(`${API}/Api/Supplier/CreateSupplier`, data);
  }
  updateSupplier(id: number, data: UpdateSupplierDto): Observable<Supplier> {
    return this.http.put<Supplier>(`${API}/Api/Supplier/UpdateSupplier/${id}`, data);
  }

  // ─── Stock Entries ─────────────────────────────────────────────────────────
  getAllStockEntries(): Observable<StockEntry[]> {
    return this.http.get<StockEntry[]>(`${API}/Api/StockEntry/GetAllStockEntries`);
  }
  getStockEntryById(id: number): Observable<StockEntry> {
    return this.http.get<StockEntry>(`${API}/Api/StockEntry/GetStockEntryById/${id}`);
  }
  getStockEntriesBySupplier(supplierId: number): Observable<StockEntry[]> {
    return this.http.get<StockEntry[]>(`${API}/Api/StockEntry/GetStockEntriesBySupplier/${supplierId}`);
  }
  getStockEntriesByArticle(articleId: number): Observable<StockEntry[]> {
    return this.http.get<StockEntry[]>(`${API}/Api/StockEntry/GetStockEntriesByArticle/${articleId}`);
  }
  createStockEntry(data: CreateStockEntryDto): Observable<StockEntry> {
    return this.http.post<StockEntry>(`${API}/Api/StockEntry/CreateStockEntry`, data);
  }
  updateStockEntry(id: number, data: UpdateStockEntryDto): Observable<StockEntry> {
    return this.http.put<StockEntry>(`${API}/Api/StockEntry/UpdateStockEntry/${id}`, data);
  }

  // ─── Stock Exits ───────────────────────────────────────────────────────────
  getAllStockExits(): Observable<StockExit[]> {
    return this.http.get<StockExit[]>(`${API}/Api/StockExit/GetAllStockExit`);
  }
  getStockExitById(id: number): Observable<StockExit> {
    return this.http.get<StockExit>(`${API}/Api/StockExit/GetStockExitById/${id}`);
  }
  getStockExitByArticle(articleId: number): Observable<StockExit[]> {
    return this.http.get<StockExit[]>(`${API}/Api/StockExit/GetStockExitByArticle/${articleId}`);
  }
  createStockExit(data: CreateStockExitDto): Observable<StockExit> {
    return this.http.post<StockExit>(`${API}/Api/StockExit/CreateStockExit`, data);
  }
  updateStockExit(id: number, data: UpdateStockExitDto): Observable<StockExit> {
    return this.http.put<StockExit>(`${API}/Api/StockExit/UpdateStockExit/${id}`, data);
  }

  // ─── Alerts ────────────────────────────────────────────────────────────────
  getOpenAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${API}/Api/Alert/GetOpenAlerts`);
  }
  getAlertsByStatus(status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${API}/Api/Alert/GetAlertsByStatus/${status}`);
  }
  getAlertById(id: number): Observable<Alert> {
    return this.http.get<Alert>(`${API}/Api/Alert/GetAlertById/${id}`);
  }
  acknowledgeAlert(id: number): Observable<Alert> {
    return this.http.put<Alert>(`${API}/Api/Alert/Acknowledge/${id}`, {});
  }
  resolveAlert(id: number): Observable<Alert> {
    return this.http.put<Alert>(`${API}/Api/Alert/Resolve/${id}`, {});
  }

  // ─── Messages ──────────────────────────────────────────────────────────────
  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${API}/Api/Message/getAllMessages`);
  }
  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${API}/Api/Message/getMessageById/${id}`);
  }
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${API}/Api/Message/CountRead`);
  }
  markMessageAsRead(id: number): Observable<Message> {
    return this.http.put<Message>(`${API}/Api/Message/MarkAsRead/${id}`, {});
  }
}
