import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '../../services/store.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css'
})
export class ProductModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Product>();
  
  selectedImageIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal']) {
      if (this.showModal) {
        document.body.style.overflow = 'hidden';
        this.selectedImageIndex = 0;
      } else {
        document.body.style.overflow = 'auto';
      }
    }
  }

  get modalImages(): any[] {
    return this.product?.images || [];
  }

  get currentImage(): string | null {
    if (this.modalImages.length === 0) return null;
    return this.modalImages[this.selectedImageIndex]?.image_url || null;
  }

  nextImage(): void {
    if (this.modalImages.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.modalImages.length;
    }
  }

  previousImage(): void {
    if (this.modalImages.length > 0) {
      this.selectedImageIndex = 
        (this.selectedImageIndex - 1 + this.modalImages.length) % this.modalImages.length;
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  closeModal(): void {
    this.close.emit();
  }

  handleAddToCart(): void {
    if (this.product) {
      this.addToCart.emit(this.product);
    }
  }
}