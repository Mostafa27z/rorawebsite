import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Product, Category, PaginatedResponse } from '../../services/store.service';

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

  // 🖼️ Image handling
  imageFiles: File[] = [];
  imagePreviews: string[] = [];
  mainImageIndex: number | null = null;
  existingImages: any[] = [];
  imagesToRemove: number[] = [];

  // 🔍 Product Details Modal
  showDetailsModal = false;
  selectedProductDetails: Product | null = null;
  currentImageIndex = 0;

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  // 🧾 Load paginated products
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

  // 🔍 View Product Details
  viewProductDetails(product: Product) {
    this.selectedProductDetails = product;
    this.currentImageIndex = 0;
    this.showDetailsModal = true;
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedProductDetails = null;
    this.currentImageIndex = 0;
    document.body.style.overflow = 'auto';
  }

  // Navigate through product images
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

  // 🧩 Image Preview for NEW images
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
    const formData = new FormData();

    formData.append('name', this.selectedProduct.name);
    formData.append('category_id', String(this.selectedProduct.category_id));
    formData.append('price', String(this.selectedProduct.price));
    formData.append('stock_quantity', String(this.selectedProduct.stock_quantity || 0));
    formData.append('is_active', this.selectedProduct.is_active ? '1' : '0');

    if (this.selectedProduct.description) {
      formData.append('description', this.selectedProduct.description);
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

    if (this.editMode && this.selectedProduct.id) {
      this.storeService.updateProduct(this.selectedProduct.id, formData as any).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts(this.currentPage);
        },
        error: (err) => {
          console.error('Update error:', err);
          alert('Failed to update product: ' + (err.error?.message || err.message));
          this.loading = false;
        },
      });
    } else {
      this.storeService.createProduct(formData as any).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts(1);
        },
        error: (err) => {
          console.error('Create error:', err);
          alert('Failed to create product: ' + (err.error?.message || err.message));
          this.loading = false;
        },
      });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.storeService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts(this.currentPage);
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Failed to delete product');
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