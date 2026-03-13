import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '@environment/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockLoginResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.x',
    refreshToken: 'refresh-123',
    tipoToken: 'Bearer',
    username: 'admin',
    nombreCompleto: 'Administrador',
    permisos: ['dashboard', 'usuarios'],
    expiracionMs: 600000,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAccessToken() should return null when no token in localStorage', () => {
    expect(service.getAccessToken()).toBeNull();
  });

  it('getAccessToken() should return token after login', () => {
    const token = 'test-access-token';
    localStorage.setItem('accessToken', token);
    expect(service.getAccessToken()).toBe(token);
  });

  it('isAuthenticatedValue() should return false when no token', () => {
    expect(service.isAuthenticatedValue()).toBe(false);
  });

  it('login should call POST /api/auth/login and store tokens', () => {
    service.login('admin', 'password').subscribe((res) => {
      expect(res.accessToken).toBe(mockLoginResponse.accessToken);
      expect(res.refreshToken).toBe(mockLoginResponse.refreshToken);
      expect(res.user.username).toBe('admin');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'password' });
    req.flush(mockLoginResponse);
  });

  it('login should store accessToken and refreshToken in localStorage on success', () => {
    service.login('admin', 'password').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockLoginResponse);

    expect(localStorage.getItem('accessToken')).toBe(mockLoginResponse.accessToken);
    expect(localStorage.getItem('refreshToken')).toBe(mockLoginResponse.refreshToken);
  });

  it('logout should clear tokens and call POST /api/auth/logout when token exists', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'refresh');

    service.logout().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('refresh should return null when no refreshToken in localStorage', () => {
    service.refresh().subscribe((res) => {
      expect(res).toBeNull();
    });
  });

  it('refresh should call POST /api/auth/refresh and update tokens', () => {
    localStorage.setItem('refreshToken', 'old-refresh');

    service.refresh().subscribe((res) => {
      expect(res).not.toBeNull();
      expect(res!.accessToken).toBe(mockLoginResponse.accessToken);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'old-refresh' });
    req.flush(mockLoginResponse);
  });

  it('currentUser signal should be readonly', () => {
    expect(service.currentUser).toBeDefined();
    expect(typeof service.currentUser).toBe('function');
  });
});
