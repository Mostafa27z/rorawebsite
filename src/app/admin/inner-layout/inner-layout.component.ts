import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-inner-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './inner-layout.component.html',
})
export class InnerLayoutComponent {
  menuOpen = false;
  screenWidth = window.innerWidth; // ✅ track width

  constructor() {}

  // 🧭 Toggle sidebar
  toggleSidebar() {
    this.menuOpen = !this.menuOpen;
  }

  // 🧹 Close sidebar
  closeSidebar() {
    this.menuOpen = false;
  }

  // 📏 Update width when window resizes
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
  }
}
