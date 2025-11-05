import { Component, OnInit } from '@angular/core';
import { UserManagementService } from '../../services/user-management.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentPage = 1;
  lastPage = 1;
  searchTerm = '';
  isLoading = false;

  userForm!: FormGroup;
  editingUserId: number | null = null;
  showForm = false;

  // Toast messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private userService: UserManagementService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(255)]],
      role: ['', [Validators.required]]
    });
  }

  loadUsers(page: number = 1): void {
    this.isLoading = true;
    this.userService.getUsers(page, this.searchTerm).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        // Handle the response structure from your API
        this.users = res.data;
        this.currentPage = res.meta.current_page;
        this.lastPage = res.meta.last_page;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showError('Failed to load users. Please try again.');
        this.isLoading = false;
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadUsers(1);
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.lastPage;
  }

  openForm(user?: User): void {
    this.showForm = true;
    if (user) {
      this.editingUserId = user.id!;
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.roles && user.roles.length ? user.roles[0] : '',
        password: '' // Clear password for editing
      });
      // Make password optional when editing
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.editingUserId = null;
      this.userForm.reset();
      // Make password required when creating
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.userForm.reset();
    this.editingUserId = null;
  }

  saveUser(): void {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });

    if (this.userForm.invalid) {
      this.showError('Please fill in all required fields correctly.');
      return;
    }

    const formData = this.userForm.value;
    
    // Prepare data, removing password if empty during edit
    const data: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      address: formData.address || null,
      role: formData.role
    };

    // Only include password if provided
    if (formData.password && formData.password.trim() !== '') {
      data.password = formData.password;
    }

    if (this.editingUserId) {
      this.userService.updateUser(this.editingUserId, data).subscribe({
        next: (response) => {
          this.showSuccess('User updated successfully!');
          this.loadUsers(this.currentPage);
          this.cancelForm();
        },
        error: (err) => {
          console.error('Error updating user:', err);
          const message = err.error?.message || 'Failed to update user. Please try again.';
          this.showError(message);
        }
      });
    } else {
      this.userService.createUser(data).subscribe({
        next: (response) => {
          this.showSuccess('User created successfully!');
          this.loadUsers(1);
          this.cancelForm();
        },
        error: (err) => {
          console.error('Error creating user:', err);
          const message = err.error?.message || 'Failed to create user. Please try again.';
          this.showError(message);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.showSuccess('User deleted successfully!');
          // If we deleted the last user on the page, go to previous page
          if (this.users.length === 1 && this.currentPage > 1) {
            this.loadUsers(this.currentPage - 1);
          } else {
            this.loadUsers(this.currentPage);
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          const message = err.error?.message || 'Failed to delete user. Please try again.';
          this.showError(message);
        }
      });
    }
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.lastPage && page !== this.currentPage) {
      this.loadUsers(page);
    }
  }

  // Toast notification methods
  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}