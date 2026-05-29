import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse, User } from './auth.service';
import { environment } from '../../environments/environment';

// Mock localStorage for Vitest/Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => '',
    length: 0
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully and save user details in localStorage', () => {
    const mockCredentials = { email: 'admin@isp.com', password: 'password' };
    const mockUser: User = { id: 1, nombre: 'Admin User', email: 'admin@isp.com', rol: 'admin' };
    const mockResponse: LoginResponse = { token: 'mock-jwt-token', user: mockUser };

    service.login(mockCredentials).subscribe((response) => {
      expect(response.token).toBe('mock-jwt-token');
      expect(response.user.nombre).toBe('Admin User');
      expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
      expect(JSON.parse(localStorage.getItem('current_user')!)).toEqual(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should clear storage and current user on logout', () => {
    localStorage.setItem('auth_token', 'active-token');
    localStorage.setItem('current_user', JSON.stringify({ nombre: 'Admin' }));

    service.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('current_user')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return token when getToken is called', () => {
    localStorage.setItem('auth_token', 'stored-token');
    expect(service.getToken()).toBe('stored-token');
  });

  it('should verify authenticated state correctly', () => {
    expect(service.isAuthenticated()).toBe(false);
    localStorage.setItem('auth_token', 'stored-token');
    expect(service.isAuthenticated()).toBe(true);
  });
});
