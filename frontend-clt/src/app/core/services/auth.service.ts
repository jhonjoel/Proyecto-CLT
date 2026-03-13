import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '@environment/environment';
import { User } from '@shared/models/user';
import type { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from '@shared/models/auth.model';
import type { User as UserModel } from '@shared/models/user.model';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/** Respuesta cruda de login/refresh del backend (sin user anidado). Acepta camelCase o snake_case. */
interface LoginResponseDto {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  tipoToken?: string;
  username: string;
  nombreCompleto?: string;
  permisos?: string[];
  expiracionMs?: number;
}

/** Payload del JWT (access token) del backend CLT. */
export interface JwtPayload {
  jti?: string;
  sub?: string;
  token_type?: string;
  roles?: string[];
  permisos?: string[];
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;

  /** Estado reactivo del usuario autenticado (Signal). */
  private readonly currentUserSignal = signal<User | null>(null);

  /** Expone el usuario actual como Signal de solo lectura. */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /** Computed: true si hay token válido. */
  readonly isAuthenticated = computed(() => {
    const token = this.getAccessToken();
    return !!token && this.tokenIsValid(token);
  });

  constructor(private http: HttpClient) {
    this.restoreUserFromStorage();
  }

  /**
   * Obtiene el access token desde localStorage.
   * Usado por el interceptor JWT y por isAuthenticated.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Indica si el usuario está autenticado (tiene access token válido).
   */
  isAuthenticatedValue(): boolean {
    const token = this.getAccessToken();
    return !!token && this.tokenIsValid(token);
  }

  /**
   * Login: POST /api/auth/login.
   * Almacena accessToken y refreshToken en localStorage y actualiza currentUser.
   */
  login(username: string, password: string, turnstileToken?: string): Observable<AuthResponse> {
    const body: LoginRequest = { username, password, ...(turnstileToken && { turnstileToken }) };
    return this.http.post<LoginResponseDto | string>(`${this.authUrl}/login`, body).pipe(
      map((res) => (typeof res === 'string' ? JSON.parse(res) : res) as LoginResponseDto),
      tap((res) => {
        try {
          const data = (res && (res as any).data != null) ? (res as any).data : res;
          if (data && typeof data === 'object') this.handleAuthSuccess(data);
        } catch {
          // no romper el flujo si falla el guardado
        }
      }),
      map((res) => {
        const data = (res && (res as any).data != null) ? (res as any).data : res;
        const accessToken = data?.accessToken ?? data?.access_token ?? '';
        const refreshToken = data?.refreshToken ?? data?.refresh_token ?? '';
        return {
          accessToken,
          refreshToken,
          user: this.dtoToAuthUser(data || {}),
        };
      }),
      catchError(() => {
        return of(null as unknown as AuthResponse);
      })
    ) as Observable<AuthResponse>;
  }

  /**
   * Registro: POST /api/auth/register.
   * Devuelve LoginResponse; al registrar con éxito se almacenan los tokens y se actualiza currentUser.
   */
  register(data: RegisterRequest): Observable<AuthResponse | null> {
    const body: Record<string, string> = {
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      password: data.password,
    };
    if (data.rol && data.rol !== 'OPERADOR') {
      body['rol'] = data.rol;
    }
    return this.http.post<LoginResponseDto>(`${this.authUrl}/register`, body).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      map((res) => ({
        accessToken: res.accessToken ?? res.access_token ?? '',
        refreshToken: res.refreshToken ?? res.refresh_token ?? '',
        user: this.dtoToAuthUser(res),
      }))
    ) as Observable<AuthResponse | null>;
  }

  /**
   * Solicitud de restablecer contraseña: POST /api/auth/forgot-password.
   * Si el email existe, el backend envía un correo con enlace (o lo loguea en consola si SMTP no está configurado).
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.authUrl}/forgot-password`, { email: email.trim() });
  }

  /**
   * Restablece la contraseña: POST /api/auth/reset-password.
   * Requiere el token recibido por email.
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.authUrl}/reset-password`, {
      token: token.trim(),
      newPassword,
    });
  }

  /**
   * Renueva los tokens: POST /api/auth/refresh.
   * Actualiza localStorage y currentUser.
   */
  refresh(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.clearAuth();
      return of(null);
    }
    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<LoginResponseDto>(`${this.authUrl}/refresh`, body).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      map((res) => {
        const accessToken = res.accessToken ?? res.access_token ?? '';
        const refreshToken = res.refreshToken ?? res.refresh_token ?? '';
        return {
          accessToken,
          refreshToken,
          user: this.dtoToAuthUser(res),
        } as AuthResponse;
      }),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    );
  }

  /**
   * Logout: POST /api/auth/logout y limpieza de tokens y estado.
   */
  logout(): Observable<void> {
    const token = this.getAccessToken();
    if (token) {
      this.http
        .post(`${this.authUrl}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
        .subscribe({ error: () => {} });
    }
    this.clearAuth();
    return of(undefined);
  }

  /** Valor actual del usuario (compatibilidad con código que usa currentUserValue). */
  get currentUserValue(): User | null {
    return this.currentUserSignal();
  }

  tokenIsValid(token: string): boolean {
    try {
      if (!token || token.length === 0) return false;
      const payloadB64 = token.split('.')[1];
      if (!payloadB64) return false;
      const json = this.decodeJwtPayload(payloadB64);
      const payload = JSON.parse(json);
      const now = Date.now() / 1000;
      return typeof payload.exp === 'number' && now < payload.exp;
    } catch {
      return false;
    }
  }

  private decodeJwtPayload(base64url: string): string {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '===='.slice(0, 4 - pad);
    return atob(base64);
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token || !this.tokenIsValid(token)) return null;
    try {
      const payloadB64 = token.split('.')[1];
      if (!payloadB64) return null;
      const json = this.decodeJwtPayload(payloadB64);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  getPermisos(): string[] {
    const payload = this.getDecodedToken();
    if (payload?.permisos?.length) return payload.permisos;
    const user = this.currentUserValue;
    if (user && 'permisos' in user && Array.isArray((user as User & { permisos?: string[] }).permisos)) {
      return (user as User & { permisos: string[] }).permisos;
    }
    return [];
  }

  getRoles(): string[] {
    const payload = this.getDecodedToken();
    return payload?.roles ?? [];
  }

  private handleAuthSuccess(res: LoginResponseDto): void {
    const accessToken = res.accessToken ?? res.access_token ?? '';
    const refreshToken = res.refreshToken ?? res.refresh_token ?? '';
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    this.currentUserSignal.set(this.dtoToUser(res));
  }

  private dtoToUser(dto: LoginResponseDto): User {
    const user = this.currentUserValue;
    const token = dto.accessToken ?? dto.access_token ?? '';
    return {
      id: user?.id ?? 0,
      username: dto.username,
      firstName: dto.nombreCompleto ?? dto.username,
      lastName: '',
      token,
      nombreCompleto: dto.nombreCompleto,
      permisos: dto.permisos ?? [],
    } as User;
  }

  /** Mapea la respuesta del backend al User de AuthResponse (user.model). */
  private dtoToAuthUser(dto: LoginResponseDto | Record<string, unknown>): UserModel {
    const username = (dto as LoginResponseDto).username ?? '';
    const permisos = (dto as LoginResponseDto).permisos ?? [];
    return {
      id: 0,
      username,
      email: undefined,
      role: permisos[0] ?? 'OPERADOR',
    };
  }

  private restoreUserFromStorage(): void {
    const token = this.getAccessToken();
    if (!token || !this.tokenIsValid(token)) {
      this.currentUserSignal.set(null);
      return;
    }
    const payload = this.getDecodedToken();
    if (!payload?.sub) {
      this.currentUserSignal.set(null);
      return;
    }
    this.currentUserSignal.set({
      id: 0,
      username: payload.sub,
      firstName: payload.sub,
      lastName: '',
      token,
      nombreCompleto: payload.sub,
      permisos: payload.permisos ?? [],
    } as User);
  }

  private clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUserSignal.set(null);
  }
}
