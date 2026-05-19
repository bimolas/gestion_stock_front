// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginDto {
  userName: string;
  password: string;
}

export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
}

// ─── Domain models ───────────────────────────────────────────────────────────

export interface User {
  userName: string;
  email: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
  phone: string;
}

export interface Article {
  id: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: Category;
  supplier: Supplier;
  barcode: string;
}

export interface StockEntry {
  id: number;
  article: Article;
  quantity: number;
  date: string;
  supplier: Supplier;
}

export interface StockExit {
  id: number;
  article: Article;
  quantity: number;
  date: string;
  destination: string;
}

export interface Alert {
  id: number;
  type: 'LOW_STOCK' | 'SUPPLY_CHAIN_DELAY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  title: string;
  content: string;
  articleId: number;
  supplierId: number;
  fingerprint: string;
  createdAt: string;
  resolvedAt: string;
}

export interface Message {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardStats {
  numberOfSuppliers: number;
  numberOfArticles: number;
  numberOfCategorys: number;
  outOfStock: number;
}

export interface StockEntryProgressDto {
  month: string;
  totalQuantity: number;
}

export interface StockExitProgressDto {
  month: string;
  totalQuantity: number;
}

// ─── Create / Update DTOs ────────────────────────────────────────────────────

export interface CreateArticleDto {
  name: string;
  description: string;
  quantity: number;
  price: number;
  categoryId: number;
  supplierId: number;
  barcode: string;
}

export interface UpdateArticleDto {
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
}

export interface UpdateCategoryDto {
  name: string;
  description: string;
}

export interface CreateSupplierDto {
  name: string;
  contact: string;
  address: string;
  phone: string;
}

export interface UpdateSupplierDto {
  name: string;
  contact: string;
  address: string;
  phone: string;
}

export interface CreateStockEntryDto {
  articleId: number;
  quantity: number;
  date: string;
  supplierId: number;
}

export interface UpdateStockEntryDto {
  quantity: number;
  date: string;
}

export interface CreateStockExitDto {
  articleId: number;
  quantity: number;
  date: string;
  destination: string;
}

export interface UpdateStockExitDto {
  quantity: number;
  date: string;
  destination: string;
}
