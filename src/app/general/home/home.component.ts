import { Component, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { CategoryCardComponent } from '../../shared/category-card/category-card.component';
import { ProductModalComponent } from '../../shared/product-modal/product-modal.component';
import { StoreService, Product, Category } from '../../services/store.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardComponent, CategoryCardComponent, ProductModalComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  isLoadingCategories = true;
  isLoadingProducts = true;
  
  // Modal state
  showModal = false;
  selectedProduct: Product | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.storeService.getCategories({ per_page: 30 }).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
      },
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.storeService.getProducts({ per_page: 30 }).subscribe({
      next: (response) => {
        this.products = response.data;
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
      },
    });
  }

  // Modal functions
  openProductModal(product: Product): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
  }

  addToCartFromModal(product: Product): void {
    let cart: { id: any; quantity: number }[] = [];
    try {
      const stored = localStorage.getItem('cart');
      cart = stored ? JSON.parse(stored) : [];
    } catch {
      cart = [];
    }

    if (!Array.isArray(cart)) cart = [];

    const productId = Number(product.id);
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      alert(`🛍️ ${product.name} is already in your cart!`);
    } else {
      cart.push({ id: productId, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      alert(`✅ ${product.name} added to cart!`);
    }
  }

  // Carousel scroll functions
  scrollCarousel(direction: 'left' | 'right', carouselId: string): void {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const scrollAmount = 340;
      carousel.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  getCategoryColor(index: number): string {
    const colors = ['var(--color-accent-1)', 'var(--color-accent-2)'];
    return colors[index % colors.length];
  }

  getProductImageColor(index: number): string {
    const colors = ['var(--color-accent-1)', 'var(--color-accent-2)'];
    return colors[index % colors.length];
  }
}