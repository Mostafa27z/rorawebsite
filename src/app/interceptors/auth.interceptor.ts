import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone request if token exists
  const cloned = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('Unauthorized — logging out automatically');
        authService.logout().subscribe();
      }
      return throwError(() => error);
    })
  );
};
