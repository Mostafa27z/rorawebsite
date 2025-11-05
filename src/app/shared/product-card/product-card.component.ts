import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../services/store.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  imports:[RouterLink, CommonModule]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() imageColor: string = '#E8D5C4'; // Default fallback color
  @Output() viewDetails = new EventEmitter<Product>();
  /** Optional Add-to-Cart handler (provided by parent) */
  @Input() onAddToCart?: () => void;

  constructor(private router: Router) {}

  // Get the main image URL or first image
  get mainImageUrl(): string | null {
    if (!this.product?.images || this.product.images.length === 0) {
      return null;
    }
    
    // Find main image
    const mainImage = this.product.images.find((img: any) => img.is_main);
    if (mainImage?.image_url) {
      return mainImage.image_url;
    }
    
    // Fallback to first image
    return this.product.images[0]?.image_url || null;
  }

  handleViewDetails() {
    
    this.viewDetails.emit(this.product);
  }

  handleAddToCart(event: Event) {
    // Prevent navigation when clicking add to cart
    event.stopPropagation();

   

    // 🛒 Load or initialize cart
    let cart: { id: any; quantity: number }[] = [];
    try {
      const stored = localStorage.getItem('cart');
      cart = stored ? JSON.parse(stored) : [];
    } catch {
      cart = [];
    }

    if (!Array.isArray(cart)) cart = [];

    const productId = Number(this.product.id);
    const existingItem = cart.find((item) => item.id === productId);

    // ✅ Add new or notify already added
    if (existingItem) {
      alert(`🛍️ ${this.product.name} is already in your cart!`);
    } else {
      cart.push({ id: productId, quantity: 1 });

      // 💾 Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));

      // 📢 Notify all components that cart changed
      window.dispatchEvent(new Event('cartUpdated'));

      alert(`✅ ${this.product.name} added to cart!`);
    }
  }
}