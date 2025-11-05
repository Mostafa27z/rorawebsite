import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Product } from '../../services/store.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
interface CartItem {
  id: number;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: (Product & { quantity: number })[] = [];
  showPopup = false;
  loading = false;
  placingOrder = false;

  constructor(
    private storeService: StoreService,
    private orderService: OrderService,
    private auth :AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('cartUpdated', this.handleStorageChange);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('cartUpdated', this.handleStorageChange);
  }

  private handleStorageChange = () => {
    this.loadCart();
  };

  /** 🛒 Load products with quantities from localStorage */
  async loadCart() {
    const stored = localStorage.getItem('cart');
    if (!stored) {
      this.cartItems = [];
      return;
    }

    let cartData: CartItem[] = [];
    try {
      cartData = JSON.parse(stored);
    } catch {
      cartData = [];
    }

    if (!Array.isArray(cartData) || cartData.length === 0) {
      this.cartItems = [];
      return;
    }

    this.loading = true;
    try {
      const productRequests = cartData.map((c) =>
        this.storeService.getProduct(c.id).toPromise()
      );
      const results = await Promise.allSettled(productRequests);
      const products = results
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
        .map((r) => r.value);

      this.cartItems = products.map((p) => {
        const cartItem = cartData.find((c) => c.id === p.id)!;
        return { ...p, quantity: cartItem.quantity };
      });
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      this.loading = false;
    }
  }

  /** ➕ Increase quantity */
  increaseQuantity(item: Product & { quantity: number }) {
    item.quantity++;
    this.updateLocalStorage();
  }

  /** ➖ Decrease quantity */
  decreaseQuantity(item: Product & { quantity: number }) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateLocalStorage();
    }
  }

  /** 🗑️ Remove item */
  removeItem(id: number) {
    this.cartItems = this.cartItems.filter((i) => i.id !== id);
    this.updateLocalStorage();
  }

  /** 🚮 Clear all */
  clearCart() {
    localStorage.removeItem('cart');
    this.cartItems = [];
    this.emitCartUpdate();
  }

  /** 💾 Sync localStorage */
  private updateLocalStorage() {
    const simplified = this.cartItems.map((i) => ({
      id: i.id!,
      quantity: i.quantity,
    }));
    localStorage.setItem('cart', JSON.stringify(simplified));
    // this.emitCartUpdate();
  }

  /** 📢 Emit update event */
  private emitCartUpdate() {
    window.dispatchEvent(new Event('cartUpdated'));
  }

  /** 🧮 Total price */
  get total() {
    return this.cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  }

  /** 🧭 Toggle popup visibility */
  togglePopup() {
    this.showPopup = !this.showPopup;
  }

  /** 🧾 Place Order */
 
placeOrder() {
  if (this.cartItems.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  // ✅ Check if user is logged in
  if (!this.auth.isAuthenticated()) {
    alert('⚠️ You must login to place an order.');
    this.togglePopup();
    this.router.navigate(['/login']);
    return;
  }

  this.placingOrder = true;
  const orderItems = this.cartItems.map((i) => ({
    product_id: i.id!,
    quantity: i.quantity,
  }));

  this.orderService.placeOrder(orderItems).subscribe({
    next: (res) => {
      alert('✅ Order placed successfully!');
      this.clearCart();
      this.togglePopup();
    },
    error: (err) => {
      console.error(err);
      alert('❌ Failed to place order. Please try again.');
    },
    complete: () => (this.placingOrder = false),
  });
}

}
