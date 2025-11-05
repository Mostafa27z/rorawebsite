import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisService, SalesAnalysisResponse, CustomerAnalysisResponse, InventoryAnalysisResponse } from '../../services/analysis.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  sales?: SalesAnalysisResponse;
  customers?: CustomerAnalysisResponse;
  inventory?: InventoryAnalysisResponse;

  loading = true;
  error: string | null = null;

  // Category pagination
  categoryCurrentPage = 1;
  categoryItemsPerPage = 5;
  totalCategoryPages = 1;
  paginatedCategories: any[] = [];

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.loadData();
  }

  /** 🔄 Load all analysis data */
  loadData() {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.analysisService.getSalesAnalysis().toPromise(),
      this.analysisService.getCustomerAnalysis().toPromise(),
      this.analysisService.getInventoryAnalysis().toPromise(),
    ])
      .then(([sales, customers, inventory]) => {
        this.sales = sales;
        this.customers = customers;
        this.inventory = inventory;
        this.updateCategoryPagination();
      })
      .catch((err) => {
        console.error(err);
        this.error = 'Failed to load analytics data.';
      })
      .finally(() => (this.loading = false));
  }

  /** 📄 Update category pagination */
  updateCategoryPagination() {
    if (!this.inventory?.category_distribution) {
      this.paginatedCategories = [];
      this.totalCategoryPages = 1;
      return;
    }

    const categories = this.inventory.category_distribution;
    this.totalCategoryPages = Math.ceil(categories.length / this.categoryItemsPerPage);

    const startIndex = (this.categoryCurrentPage - 1) * this.categoryItemsPerPage;
    const endIndex = startIndex + this.categoryItemsPerPage;
    this.paginatedCategories = categories.slice(startIndex, endIndex);
  }

  /** 🔄 Change category page */
  changeCategoryPage(page: number) {
    if (page < 1 || page > this.totalCategoryPages) return;
    this.categoryCurrentPage = page;
    this.updateCategoryPagination();
  }

  /** 📱 Get visible page numbers for responsive pagination */
  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const current = this.categoryCurrentPage;
    const total = this.totalCategoryPages;

    // If 7 or fewer pages, show all
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current );

    // Adjust if we're near the beginning
    if (current <= 3) {
      start = 2;
      end = 4;
    }

    // Adjust if we're near the end
    if (current >= total - 2) {
      start = total - 2;
      end = total - 1;
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < total - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(total);

    return pages;
  }

  /** 🧮 Helper for formatting currency */
  formatCurrency(value: number): string {
    return `EGP ${value}`;
  }
}