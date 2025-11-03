import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  imports:[RouterLink, CommonModule]
})
export class ProductCardComponent {
  @Input() title!: string;
  @Input() id!: any;
  @Input() price!: number | string;
  @Input() imageColor!: string;
  @Input() imageUrl?: string | null;

  /** Optional Add-to-Cart handler (provided by parent) */
  @Input() onAddToCart?: () => void;

  handleAddToCart() {
    // 🧩 Optional: use parent-provided handler
    // if (this.onAddToCart) {
    //   this.onAddToCart();
    //   return;
    // }

    // 🛒 Load or initialize cart
    let cart: { id: any; quantity: number }[] = [];
    try {
      const stored = localStorage.getItem('cart');
      cart = stored ? JSON.parse(stored) : [];
    } catch {
      cart = [];
    }

    if (!Array.isArray(cart)) cart = [];

    const productId = Number(this.id);
    const existingItem = cart.find((item) => item.id === productId);

    // ✅ Add new or notify already added
    if (existingItem) {
      alert(`🛍️ ${this.title} is already in your cart!`);
    } else {
      cart.push({ id: productId, quantity: 1 });

      // 💾 Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));

      // 📢 Notify all components that cart changed
      window.dispatchEvent(new Event('cartUpdated'));

      alert(`✅ ${this.title} added to cart!`);
    }
  }
}
