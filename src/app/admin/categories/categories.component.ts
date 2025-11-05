import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Category, PaginatedResponse } from '../../services/store.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  total = 0;
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  searchTerm = '';

  loading = false;
  editMode = false;
  selectedCategory: Category = { name: '', is_active: true };

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadCategories();
  }

  /** 🔍 Load paginated categories with optional search */
  loadCategories(page = 1) {
  this.loading = true;
  this.currentPage = page;

  this.storeService.getPaginatedCategories({
    page: this.currentPage,
    search: this.searchTerm,
  }).subscribe({
    next: (res) => {
      this.categories = res.data;
      this.total = res.total;
      this.perPage = res.per_page;
      this.lastPage = res.last_page;
      this.loading = false;
    },
    error: (err) => {
      console.error('Failed to load categories', err);
      this.loading = false;
    },
  });
}
goToPage(page: number) {
  if (page < 1 || page > this.lastPage) return;
  this.loadCategories(page);
}

searchTimeout: any;

onSearchChange(value: string) {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => this.loadCategories(1), 400);
}

  /** 🧾 Create or Update */
  saveCategory() {
    if (this.editMode && this.selectedCategory.id) {
      this.storeService.updateCategory(this.selectedCategory.id, this.selectedCategory).subscribe({
        next: () => {
          this.resetForm();
          this.loadCategories();
        },
      });
    } else {
      this.storeService.createCategory(this.selectedCategory).subscribe({
        next: () => {
          this.resetForm();
          this.loadCategories();
        },
      });
    }
  }

  /** ✏️ Edit selected category */
  editCategory(cat: Category) {
    this.selectedCategory = { ...cat };
    this.editMode = true;
  }

  /** ❌ Delete category */
  deleteCategory(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this category?')) {
      this.storeService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
      });
    }
  }

  /** 🧼 Reset form */
  resetForm() {
    this.editMode = false;
    this.selectedCategory = { name: '', is_active: true };
  }
}
