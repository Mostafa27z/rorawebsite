import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './services/auth.service';
import { CartComponent } from "./shared/cart/cart.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, CartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  menuOpen = false;
  scrolled = false;
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // 🔁 Listen to authentication changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 30;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  /** 🧠 Helpers for roles */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
