import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

// 🧱 Models (optional interfaces for typing)
export interface Category {
  id?: number;
  name: string;
  is_active?: boolean;
}

export interface Product {
  id?: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  is_active?: boolean;
  images?: any[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_main?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/products`; 

  constructor(private http: HttpClient) {}

  // 📦============ PUBLIC ROUTES ============📦

  /** 🛍 Get paginated products with optional filters */
  getProducts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: number;
  }): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.category_id)
      httpParams = httpParams.set('category_id', params.category_id);

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/active`, { params: httpParams });
  }

  /** 🧩 Get paginated categories */
  getCategories(params?: { page?: number; per_page?: number; search?: string }): Observable<PaginatedResponse<Category>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories/active`, { params: httpParams });
  }

  // 🔐============ ADMIN ROUTES (require token) ============🔐

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    });
  }

  // 🗂️ Categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, {
      headers: this.getAuthHeaders(),
    });
  }

  createCategory(data: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateCategory(id: number, data: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 🛍️ Products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, {
      
    });
  }

  createProduct(data: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProduct(id: number, data: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
