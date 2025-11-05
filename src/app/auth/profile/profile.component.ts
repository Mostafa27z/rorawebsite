import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  name: string = '';
  email: string = '';
  phone: string = '';
  old_password: string = '';
  password: string = '';
  password_confirmation: string = '';
  loading: boolean = false;
  
  // Validation errors
  errors: any = {};
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.name = user.name;
      this.email = user.email;
      this.phone = user.phone || '';
    }
  }

  clearErrors() {
    this.errors = {};
    this.successMessage = '';
  }

  validateForm(): boolean {
    this.clearErrors();
    let isValid = true;

    // Name validation
    if (!this.name.trim()) {
      this.errors.name = ['The name field is required.'];
      isValid = false;
    } else if (this.name.length < 2) {
      this.errors.name = ['Name must be at least 2 characters.'];
      isValid = false;
    }

    // Email validation
    if (!this.email.trim()) {
      this.errors.email = ['The email field is required.'];
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.errors.email = ['Please enter a valid email address.'];
      isValid = false;
    }

    // Phone validation
    if (this.phone && !/^\d{11}$/.test(this.phone.replace(/\D/g, ''))) {
      this.errors.phone = ['Phone number must be 11 digits.'];
      isValid = false;
    }

    // Password change validation
    const isChangingPassword = this.old_password || this.password || this.password_confirmation;
    
    if (isChangingPassword) {
      // All password fields are required for password change
      if (!this.old_password) {
        this.errors.old_password = ['Old password is required to change password.'];
        isValid = false;
      }
      
      if (!this.password) {
        this.errors.password = ['New password is required.'];
        isValid = false;
      } else if (this.password.length < 8) {
        this.errors.password = ['Password must be at least 8 characters.'];
        isValid = false;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.password)) {
        this.errors.password = ['Password must contain at least one uppercase letter, one lowercase letter, and one number.'];
        isValid = false;
      }

      if (!this.password_confirmation) {
        this.errors.password_confirmation = ['Please confirm your new password.'];
        isValid = false;
      } else if (this.password !== this.password_confirmation) {
        this.errors.password_confirmation = ['New password and confirmation do not match.'];
        isValid = false;
      }
    }

    return isValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.clearErrors();

    const updateData: any = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone ? this.phone.replace(/\D/g, '') : '',
    };

    // Only add password fields if all are provided
    if (this.old_password && this.password && this.password_confirmation) {
      updateData.old_password = this.old_password;
      updateData.password = this.password;
      updateData.password_confirmation = this.password_confirmation;
    }

    this.authService.updateProfile(updateData).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = 'Profile updated successfully!';
        
        // Clear password fields on success
        this.old_password = '';
        this.password = '';
        this.password_confirmation = '';
        
        // Update local user data
        if (response.user) {
          this.authService.updateProfile(response.user);
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      (error) => {
        this.loading = false;
        
        if (error.error && error.error.errors) {
          // Backend validation errors
          this.errors = error.error.errors;
        } else if (error.error && error.error.message) {
          // Backend error message
          this.errors.general = [error.error.message];
        } else {
          // Generic error
          this.errors.general = ['An error occurred while updating your profile. Please try again.'];
        }
      }
    );
  }

  // Helper method to get first error for a field
  getFirstError(field: string): string {
    return this.errors[field] && this.errors[field][0] ? this.errors[field][0] : '';
  }

  // Phone number formatting
  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Format as (XXX) XXX-XXXX
    if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length > 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    this.phone = value;
  }
}