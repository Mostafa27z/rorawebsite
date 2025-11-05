import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { User } from './auth.service';





@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = environment.apiUrl+ '/auth/admin/users'; 

  constructor(private http: HttpClient) {}

  /**
   * Get paginated users list (optionally with search)
   */
  getUsers(page: number = 1, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString());
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get a specific user by ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new user
   */
  createUser(userData: User): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  /**
   * Update existing user
   */
  updateUser(id: number, userData: User): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * Delete a user
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
