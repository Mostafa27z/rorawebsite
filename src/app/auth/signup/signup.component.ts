import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.password_confirmation,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          alert('Account created! You can now log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Registration failed';
        },
      });
  }
}
