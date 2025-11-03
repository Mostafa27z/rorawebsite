import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { Category, Product, StoreService, PaginatedResponse } from '../../services/store.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, CommonModule, ProductCardComponent],
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

  addToCart(product: Product) {
    // TODO: Implement actual cart functionality
    console.log('Adding to cart:', product);
    alert(`${product.name} added to cart!`);
  }

  getAddToCartHandler(product: Product) {
    return () => this.addToCart(product);
  }

  getProductColor(index: number): string {
    const colors = ['var(--color-accent-1)', 'var(--color-accent-2)'];
    return colors[index % colors.length];
  }
}