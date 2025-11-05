import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductModalComponent } from '../../shared/product-modal/product-modal.component';
import { Category, Product, StoreService, PaginatedResponse } from '../../services/store.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, CommonModule, ProductCardComponent, ProductModalComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  categoriesData: Category[] = [];
  totalPages = 1;
  totalItems = 0;
  isLoading = false;

  // Filters
  searchTerm = '';
  selectedCategory: string | number = 'All';
  currentPage = 1;
  itemsPerPage = 8;

  // Modal state
  showModal = false;
  selectedProduct: Product | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.itemsPerPage,
    };

    if (this.searchTerm.trim()) params.search = this.searchTerm;
    if (this.selectedCategory !== 'All')
      params.category_id = this.selectedCategory;

    this.storeService.getProducts(params).subscribe({
      next: (res: PaginatedResponse<Product>) => {
        this.products = res.data;
        this.totalPages = res.last_page;
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.isLoading = false;
      },
    });
  }

  loadCategories() {
    this.storeService.getCategories({ per_page: 100 }).subscribe({
      next: (res) => (this.categoriesData = res.data),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  onSearchOrFilterChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.currentPage = 1;
    this.loadProducts();
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

  getProductColor(index: number): string {
    const colors = ['var(--color-accent-1)', 'var(--color-accent-2)'];
    return colors[index % colors.length];
  }
}