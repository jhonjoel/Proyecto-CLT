import { User } from './user.model';

/** Body para POST /api/auth/login (api_consumo_backend.md §4.1) */
export interface LoginRequest {
  username: string;
  password: string;
  /** Token de Cloudflare Turnstile (opcional; backend debe validarlo). */
  turnstileToken?: string;
}

/**
 * Respuesta cruda del backend para login y refresh (api_consumo_backend.md §2.3).
 * Campos: accessToken, refreshToken, tipoToken, username, nombreCompleto, permisos, expiracionMs.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tipoToken?: string;
  username: string;
  nombreCompleto?: string;
  permisos?: string[];
  expiracionMs?: number;
}

/** Respuesta de login/refresh para uso interno en la app (incluye user derivado). */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Body para POST /api/auth/refresh (api_consumo_backend.md §4.1) */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Body para POST /api/auth/register (api_consumo_backend.md §4.1) */
export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: 'ADMIN' | 'OPERADOR';
  /** Token de Cloudflare Turnstile (opcional; backend valida si lo recibe) */
  turnstileToken?: string;
}
