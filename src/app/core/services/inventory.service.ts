import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { 
  Article, Category, Supplier, Alert, 
  DashboardStats, StockEntryProgressDto, StockExitProgressDto,
  Message, StockEntry, StockExit
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);

  // --- Dashboard ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/Api/Dashboard/GetDashboardStats`);
  }
  getExitProgress(): Observable<StockExitProgressDto[]> {
    return this.http.get<StockExitProgressDto[]>(`${environment.apiUrl}/Api/Dashboard/GetExitProgress`);
  }
  getEntriesProgress(): Observable<StockEntryProgressDto[]> {
    return this.http.get<StockEntryProgressDto[]>(`${environment.apiUrl}/Api/Dashboard/GetEntriesProgress`);
  }

  // --- Articles ---
  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/Api/Article/GetAllArticles`);
  }
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${environment.apiUrl}/Api/Article/GetArticleById/${id}`);
  }
  createArticle(data: Record<string, unknown>): Observable<Article> {
    return this.http.post<Article>(`${environment.apiUrl}/Api/Article/CreateArticle`, data);
  }
  updateArticle(id: number, data: Record<string, unknown>): Observable<Article> {
    return this.http.put<Article>(`${environment.apiUrl}/Api/Article/UpdateArticle/${id}`, data);
  }

  // --- Suppliers ---
  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${environment.apiUrl}/Api/Supplier/GetAllSuppliers`);
  }
  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${environment.apiUrl}/Api/Supplier/GetSupplierById/${id}`);
  }
  createSupplier(data: Record<string, unknown>): Observable<Supplier> {
    return this.http.post<Supplier>(`${environment.apiUrl}/Api/Supplier/CreateSupplier`, data);
  }
  updateSupplier(id: number, data: Record<string, unknown>): Observable<Supplier> {
    return this.http.put<Supplier>(`${environment.apiUrl}/Api/Supplier/UpdateSupplier/${id}`, data);
  }

  // --- Categories ---
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/Api/Category/GetAllCategorys`);
  }
  createCategory(data: Record<string, unknown>): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/Api/Category/CreateCategory`, data);
  }
  updateCategory(id: number, data: Record<string, unknown>): Observable<Category> {
    return this.http.put<Category>(`${environment.apiUrl}/Api/Category/UpdateCategory/${id}`, data);
  }

  // --- Alerts ---
  getOpenAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${environment.apiUrl}/Api/Alert/GetOpenAlerts`);
  }
  resolveAlert(id: number): Observable<Alert> {
    return this.http.put<Alert>(`${environment.apiUrl}/Api/Alert/Resolve/${id}`, {});
  }
  acknowledgeAlert(id: number): Observable<Alert> {
    return this.http.put<Alert>(`${environment.apiUrl}/Api/Alert/Acknowledge/${id}`, {});
  }

  // --- Messages / Notifications ---
  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/Api/Message/getAllMessages`);
  }
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/Api/Message/CountRead`);
  }
  markMessageAsRead(id: number): Observable<Message> {
    return this.http.put<Message>(`${environment.apiUrl}/Api/Message/MarkAsRead/${id}`, {});
  }

  // --- Stock Entries ---
  getAllStockEntries(): Observable<StockEntry[]> {
    return this.http.get<StockEntry[]>(`${environment.apiUrl}/Api/StockEntry/GetAllStockEntries`);
  }
  createStockEntry(data: Record<string, unknown>): Observable<StockEntry> {
    return this.http.post<StockEntry>(`${environment.apiUrl}/Api/StockEntry/CreateStockEntry`, data);
  }
  updateStockEntry(id: number, data: Record<string, unknown>): Observable<StockEntry> {
    return this.http.put<StockEntry>(`${environment.apiUrl}/Api/StockEntry/UpdateStockEntry/${id}`, data);
  }

  // --- Stock Exits ---
  getAllStockExits(): Observable<StockExit[]> {
    return this.http.get<StockExit[]>(`${environment.apiUrl}/Api/StockExit/GetAllStockExit`);
  }
  createStockExit(data: Record<string, unknown>): Observable<StockExit> {
    return this.http.post<StockExit>(`${environment.apiUrl}/Api/StockExit/CreateStockExit`, data);
  }
  updateStockExit(id: number, data: Record<string, unknown>): Observable<StockExit> {
    return this.http.put<StockExit>(`${environment.apiUrl}/Api/StockExit/UpdateStockExit/${id}`, data);
  }

  getArticleHistory(id: number): Observable<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`${environment.apiUrl}/Api/Dashboard/GetArticleHistory/${id}`);
  }
}
