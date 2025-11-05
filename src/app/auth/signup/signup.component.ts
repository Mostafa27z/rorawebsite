import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  phone: string = ''; // Added phone field
  password: string = '';
  password_confirmation: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    this.loading = true;

    this.authService
      .register({
        name: this.name,
        email: this.email,
        phone: this.phone, // Include phone in the registration data
        password: this.password,
        password_confirmation: this.password_confirmation,
      })
      .subscribe(
        (response) => {
          this.loading = false;
          this.router.navigate(['/login']);
        },
        (error) => {
          this.loading = false;
          this.errorMessage = 'An error occurred during registration.';
        }
      );
  }
}
