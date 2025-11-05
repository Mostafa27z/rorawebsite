import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

/* -------------------- 🧱 Shared Interfaces -------------------- */
export interface OverviewMetric {
  label: string;
  value: number | string;
}

/* -------------------- 💰 SALES ANALYSIS -------------------- */
export interface SalesOverview {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
}

export interface SalesTrend {
  month: string | number;
  total_sales: number;
}

export interface TopProduct {
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface CategoryPerformance {
  id: number;
  name: string;
  total_revenue: number;
}

export interface SalesAnalysisResponse {
  overview: SalesOverview;
  sales_trend: SalesTrend[];
  top_products: TopProduct[];
  category_performance: CategoryPerformance[];
}

/* -------------------- 👥 CUSTOMER ANALYSIS -------------------- */
export interface CustomerOverview {
  total_customers: number;
  repeat_customers: number;
  average_orders_per_customer: number;
}

export interface TopCustomer {
  id: number;
  name: string;
  email: string;
  total_spent: number;
}

export interface CustomerAnalysisResponse {
  overview: CustomerOverview;
  top_customers: TopCustomer[];
}

/* -------------------- 📦 INVENTORY ANALYSIS -------------------- */
export interface InventoryOverview {
  total_products: number;
  total_stock: number;
  average_stock: number;
  low_stock_products: number;
}

export interface TopSellingProduct {
  id: number;
  name: string;
  stock_quantity: number;
  total_sold: number;
}

export interface CategoryDistribution {
  category: string;
  total_stock: number;
}

export interface InventoryAnalysisResponse {
  overview: InventoryOverview;
  top_selling: TopSellingProduct[];
  category_distribution: CategoryDistribution[];
}

/* -------------------- 📊 MAIN SERVICE -------------------- */
@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private apiUrl = `${environment.apiUrl}/analysis`;

  constructor(private http: HttpClient) {}

  /** 🔑 Add Bearer token for admin access */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    });
  }

  /** 💰 Get Sales Analysis */
  getSalesAnalysis(): Observable<SalesAnalysisResponse> {
    return this.http.get<SalesAnalysisResponse>(`${this.apiUrl}/sales`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** 👥 Get Customer Analysis */
  getCustomerAnalysis(): Observable<CustomerAnalysisResponse> {
    return this.http.get<CustomerAnalysisResponse>(`${this.apiUrl}/customers`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** 📦 Get Inventory Analysis */
  getInventoryAnalysis(): Observable<InventoryAnalysisResponse> {
    return this.http.get<InventoryAnalysisResponse>(`${this.apiUrl}/inventory`, {
      headers: this.getAuthHeaders(),
    });
  }
}
