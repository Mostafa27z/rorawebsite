import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Product } from './store.service';

// 🧱 Interfaces


export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  quantity: number;
  price?: number | string;
  created_at?: string;
  updated_at?: string;
  product?: Product; 
}

export interface Order {
  id?: number;
  order_number?: string;
  user_id?: number;
  total: number | string;
  status?: 'pending' | 'processing' | 'completed' | 'canceled';
  created_at?: string;
  updated_at?: string;
  items: OrderItem[]; // ✅ Each order includes its products
  user?: { id: number; name: string; email: string };
}


export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /** 🧾 Get Authorization Header */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  // 🧍 CLIENT ROUTES ===========================

  /** 🛒 Place a new order */
  placeOrder(items: { product_id: number; quantity: number }[]): Observable<any> {
    const body = { items };
    return this.http.post(`${this.apiUrl}`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  /** 📦 View my orders */
  getMyOrders(page: number = 1): Observable<PaginatedResponse<Order>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/my`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  // 🧑‍💼 ADMIN ROUTES ===========================

  /** 🧾 Get all orders (admin only) */
  getAllOrders(status?: string, page: number = 1): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams().set('page', page);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  /** 🔄 Update order status (admin only) */
  updateOrderStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'canceled'): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }
}
