import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
/** Rutas de auth: no intentar refresh cuando falla login/register/refresh (evitar bucle). */
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

/**
 * Según api_consumo_backend.md §6 y §8:
 * - 401: intentar refresh y reenviar la petición; si falla, limpiar tokens y redirigir a login.
 * - 403: mismo refresh+retry; si el retry vuelve a fallar, redirige a login.
 * - Resto: normalizar mensaje según ErrorResponse (message y errores por campo).
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        const status = err?.status;
        const url = request.url ?? '';

        const isAuthRequest = AUTH_PATHS.some((path) => url.includes(path));
        if (isAuthRequest || (status !== 401 && status !== 403)) {
          return throwError(() => err);
        }

        return this.authenticationService.refresh().pipe(
          switchMap((auth) => {
            if (auth?.accessToken) {
              return next.handle(request).pipe(
                catchError((retryErr) => {
                  if (retryErr?.status === 401 || retryErr?.status === 403) {
                    this.authenticationService.logout();
                    this.router.navigate(['/auth/login']);
                  }
                  return throwError(() => retryErr);
                })
              );
            }
            this.authenticationService.logout();
            this.router.navigate(['/auth/login']);
            return throwError(() => err);
          }),
          catchError(() => {
            this.authenticationService.logout();
            this.router.navigate(['/auth/login']);
            return throwError(() => err);
          })
        );
      })
    );
  }
}
