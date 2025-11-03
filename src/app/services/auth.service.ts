import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment.development'; 

export interface User {
  id: number;
  name: string;
  email: string;
  roles: { id: number; name: string }[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** 🧾 Register a new user */
  register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles?: string[];
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  /** 🔐 Login user and save token */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  /** 🚪 Logout and clear local storage */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
      })
    );
  }

  /** 🧠 Get token for interceptors */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** 👤 Get current user */
  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** 🧰 Restore user from localStorage (on reload) */
  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /** ✅ Check if logged in */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** 🔑 Check if current user is admin */
  isAdmin(): boolean {
    const user = this.getUser();
    return !!user?.roles?.some((r) => r.name === 'admin');
  }
}
