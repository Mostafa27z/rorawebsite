import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../../services/order.service';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  page = 1;
  totalPages = 1;
  selectedStatus: string = '';
  updatingId: number | null = null;
  successMessage = '';

  statuses = ['pending', 'processing', 'completed', 'canceled'];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  /** 🔄 Load all orders for admin */
  loadOrders() {
    this.loading = true;
    this.orderService
      .getAllOrders(this.selectedStatus, this.page)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.orders = res.data;
          this.totalPages = res.last_page;
        },
        error: (err) => {
          console.error('Failed to load orders', err);
        },
      });
  }

  /** 🧾 Update status */
  updateStatus(order: Order, newStatus: 'pending' | 'processing' | 'completed' | 'canceled') {
    if (order.status === newStatus) return;

    this.updatingId = order.id!;
    this.successMessage = '';

    this.orderService.updateOrderStatus(order.id!, newStatus)
      .pipe(finalize(() => (this.updatingId = null)))
      .subscribe({
        next: () => {
          order.status = newStatus;
          this.successMessage = `Order #${order.order_number} updated to "${newStatus}" successfully!`;
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          console.error('Failed to update order status', err);
          alert('❌ Failed to update status. Try again.');
        },
      });
  }

  /** Pagination controls */
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadOrders();
    }
  }
}
