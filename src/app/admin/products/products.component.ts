import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Product, Category, PaginatedResponse } from '../../services/store.service';

interface ValidationErrors {
  [key: string]: string[];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;

  searchTerm = '';
  currentPage = 1;
  lastPage = 1;
  perPage = 10;

  editMode = false;
  selectedProduct: Product = {
    name: '',
    price: 0,
    category_id: 0,
    stock_quantity: 0,
    is_active: true,
  };

  // Validation errors
  validationErrors: ValidationErrors = {};
  showValidationErrors = false;
  
  // Helper for template
  Object = Object;

  // Image handling
  imageFiles: File[] = [];
  imagePreviews: string[] = [];
  mainImageIndex: number | null = null;
  existingImages: any[] = [];
  imagesToRemove: number[] = [];

  // Product Details Modal
  showDetailsModal = false;
  selectedProductDetails: Product | null = null;
  currentImageIndex = 0;

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(page = 1) {
    this.loading = true;
    this.storeService
      .getAdminProducts({
        page,
        per_page: this.perPage,
        search: this.searchTerm,
      })
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.currentPage = res.current_page;
          this.lastPage = res.last_page;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

  loadCategories() {
    this.storeService.getPaginatedCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
      },
    });
  }

  // Frontend Validation
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Validate name
    if (!this.selectedProduct.name || this.selectedProduct.name.trim() === '') {
      this.validationErrors['name'] = ['Product name is required'];
      isValid = false;
    } else if (this.selectedProduct.name.trim().length < 3) {
      this.validationErrors['name'] = ['Product name must be at least 3 characters'];
      isValid = false;
    } else if (this.selectedProduct.name.length > 255) {
      this.validationErrors['name'] = ['Product name cannot exceed 255 characters'];
      isValid = false;
    }

    // Validate category
    if (!this.selectedProduct.category_id || this.selectedProduct.category_id === 0) {
      this.validationErrors['category_id'] = ['Please select a category'];
      isValid = false;
    } else {
      const validCategory = this.categories.find(c => c.id === Number(this.selectedProduct.category_id));
      if (!validCategory) {
        this.validationErrors['category_id'] = ['Please select a valid category'];
        isValid = false;
      }
    }

    // Validate price
    if (!this.selectedProduct.price || this.selectedProduct.price <= 0) {
      this.validationErrors['price'] = ['Price must be greater than 0'];
      isValid = false;
    } else if (this.selectedProduct.price > 999999.99) {
      this.validationErrors['price'] = ['Price cannot exceed 999,999.99'];
      isValid = false;
    } else {
      const priceStr = String(this.selectedProduct.price);
      const decimalPart = priceStr.split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        this.validationErrors['price'] = ['Price can have maximum 2 decimal places'];
        isValid = false;
      }
    }

    // Validate stock quantity
    if (this.selectedProduct.stock_quantity !== undefined && this.selectedProduct.stock_quantity !== null) {
      if (this.selectedProduct.stock_quantity < 0) {
        this.validationErrors['stock_quantity'] = ['Stock quantity cannot be negative'];
        isValid = false;
      } else if (this.selectedProduct.stock_quantity > 999999) {
        this.validationErrors['stock_quantity'] = ['Stock quantity cannot exceed 999,999'];
        isValid = false;
      } else if (!Number.isInteger(Number(this.selectedProduct.stock_quantity))) {
        this.validationErrors['stock_quantity'] = ['Stock quantity must be a whole number'];
        isValid = false;
      }
    }

    // Validate description
    if (this.selectedProduct.description && this.selectedProduct.description.length > 1000) {
      this.validationErrors['description'] = ['Description cannot exceed 1000 characters'];
      isValid = false;
    }

    // Validate images (only for create mode or when adding new images)
    if (!this.editMode && this.imageFiles.length === 0) {
      this.validationErrors['images'] = ['Please upload at least one product image'];
      isValid = false;
    }

    const totalImages = this.existingImages.length + this.imageFiles.length;
    if (totalImages > 5) {
      this.validationErrors['images'] = ['Maximum 5 images allowed'];
      isValid = false;
    }

    // Validate image files
    if (this.imageFiles.length > 0) {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      for (const file of this.imageFiles) {
        if (file.size > maxFileSize) {
          this.validationErrors['images'] = this.validationErrors['images'] || [];
          this.validationErrors['images'].push(`Image "${file.name}" exceeds 5MB`);
          isValid = false;
        }
        if (!allowedTypes.includes(file.type)) {
          this.validationErrors['images'] = this.validationErrors['images'] || [];
          this.validationErrors['images'].push(`Image "${file.name}" has invalid type. Only JPG, PNG, GIF, WEBP allowed`);
          isValid = false;
        }
      }
    }

    this.showValidationErrors = !isValid;
    return isValid;
  }

  // Check if field has errors
  hasError(field: string): boolean {
    return this.showValidationErrors && this.validationErrors[field] && this.validationErrors[field].length > 0;
  }

  // Get error messages for a field
  getErrors(field: string): string[] {
    return this.validationErrors[field] || [];
  }

  // Clear error for a specific field
  clearFieldError(field: string) {
    if (this.validationErrors[field]) {
      delete this.validationErrors[field];
    }
  }

  viewProductDetails(product: Product) {
    this.selectedProductDetails = product;
    this.currentImageIndex = 0;
    this.showDetailsModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedProductDetails = null;
    this.currentImageIndex = 0;
    document.body.style.overflow = 'auto';
  }

  nextImage() {
    if (this.selectedProductDetails?.images && this.selectedProductDetails.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedProductDetails.images.length;
    }
  }

  prevImage() {
    if (this.selectedProductDetails?.images && this.selectedProductDetails.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.selectedProductDetails.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  onImageSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    const remainingSlots = 5 - this.existingImages.length;
    this.imageFiles = files.slice(0, remainingSlots);
    
    this.imagePreviews = [];
    this.imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    });
    
    this.clearFieldError('images');
    event.target.value = '';
  }

  setMainImageNew(index: number) {
    this.mainImageIndex = index;
  }

  removeNewImage(index: number) {
    this.imageFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    if (this.mainImageIndex === index) {
      this.mainImageIndex = null;
    } else if (this.mainImageIndex !== null && this.mainImageIndex > index) {
      this.mainImageIndex--;
    }
  }

  setMainImageExisting(index: number) {
    this.existingImages.forEach((img, i) => {
      img.is_main = i === index;
    });
  }

  removeExistingImage(index: number) {
    const imageId = this.existingImages[index].id;
    if (imageId) {
      this.imagesToRemove.push(imageId);
    }
    this.existingImages.splice(index, 1);
  }

  saveProduct() {
    // Validate form before submission
    if (!this.validateForm()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const formData = new FormData();

    formData.append('name', this.selectedProduct.name.trim());
    formData.append('category_id', String(this.selectedProduct.category_id));
    formData.append('price', String(this.selectedProduct.price));
    formData.append('stock_quantity', String(this.selectedProduct.stock_quantity || 0));
    formData.append('is_active', this.selectedProduct.is_active ? '1' : '0');

    if (this.selectedProduct.description) {
      formData.append('description', this.selectedProduct.description.trim());
    }

    if (this.editMode && this.imagesToRemove.length > 0) {
      this.imagesToRemove.forEach((id, index) => {
        formData.append(`remove_image_ids[${index}]`, String(id));
      });
    }

    if (this.editMode) {
      const mainExistingImage = this.existingImages.find(img => img.is_main);
      if (mainExistingImage && mainExistingImage.id) {
        formData.append('existing_main_image_id', String(mainExistingImage.id));
      }
    }

    if (this.imageFiles.length > 0) {
      this.imageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file, file.name);
      });

      const mainExistingImage = this.existingImages.find(img => img.is_main);
      if (this.mainImageIndex !== null && !mainExistingImage) {
        formData.append('main_image_index', String(this.mainImageIndex));
      }
    }

    this.loading = true;
    this.showValidationErrors = false;

    if (this.editMode && this.selectedProduct.id) {
      this.storeService.updateProduct(this.selectedProduct.id, formData as any).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts(this.currentPage);
          alert('Product updated successfully!');
        },
        error: (err) => {
          console.error('Update error:', err);
          this.handleServerErrors(err);
          this.loading = false;
        },
      });
    } else {
      this.storeService.createProduct(formData as any).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts(1);
          alert('Product created successfully!');
        },
        error: (err) => {
          console.error('Create error:', err);
          this.handleServerErrors(err);
          this.loading = false;
        },
      });
    }
  }

  // Handle server-side validation errors
  handleServerErrors(err: any) {
    if (err.status === 422 && err.error?.errors) {
      this.validationErrors = err.error.errors;
      this.showValidationErrors = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Show a summary message
      const errorCount = Object.keys(this.validationErrors).length;
      alert(`Please fix ${errorCount} validation error(s)`);
    } else {
      alert('Failed to save product: ' + (err.error?.message || err.message || 'Unknown error'));
    }
  }

  editProduct(p: Product) {
    this.selectedProduct = { ...p };
    this.editMode = true;
    this.imageFiles = [];
    this.imagePreviews = [];
    this.imagesToRemove = [];
    this.mainImageIndex = null;
    this.existingImages = p.images ? JSON.parse(JSON.stringify(p.images)) : [];
    this.validationErrors = {};
    this.showValidationErrors = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.storeService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts(this.currentPage);
          alert('Product deleted successfully!');
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Failed to delete product: ' + (err.error?.message || err.message));
          this.loading = false;
        }
      });
    }
  }

  resetForm() {
    this.editMode = false;
    this.selectedProduct = {
      name: '',
      price: 0,
      category_id: 0,
      stock_quantity: 0,
      is_active: true,
    };
    this.imageFiles = [];
    this.imagePreviews = [];
    this.mainImageIndex = null;
    this.existingImages = [];
    this.imagesToRemove = [];
    this.validationErrors = {};
    this.showValidationErrors = false;
    this.loading = false;
  }

  getMainImage(product: any): string {
    if (!product?.images || product.images.length === 0)
      return './images/logo2.svg';
    const main = product.images.find((i: any) => i.is_main);
    return main ? main.image_url : product.images[0].image_url;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.loadProducts(page);
    }
  }
}