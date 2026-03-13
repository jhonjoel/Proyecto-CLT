import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Endpoints públicos sin token (api_consumo_backend.md §2.2). */
const PUBLIC_API_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

/** Clave de localStorage; debe coincidir con AuthService para que el token se envíe. */
const ACCESS_TOKEN_KEY = 'accessToken';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const url = request.url;
    const isPublic = PUBLIC_API_PATHS.some((path) => url.includes(path));
    if (isPublic) {
      return next.handle(request);
    }
    // Leer token de AuthService o, por si acaso, de localStorage (misma clave)
    const token =
      this.authenticationService.getAccessToken() ??
      localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}
