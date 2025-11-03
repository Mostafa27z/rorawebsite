import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  /** 🔁 Load user orders */
  loadOrders(page: number = 1) {
    this.loading = true;
    this.orderService.getMyOrders(page).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.currentPage = res.current_page;
        this.totalPages = res.last_page;
        console.log(res);
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false),
    });
  }

  /** 📄 Change page */
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadOrders(page);
  }
}
