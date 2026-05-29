import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth.service';

// Mock localStorage for Node/Vitest environment
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

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit login credentials and redirect to /admin/dashboard for admin user', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    const mockResponse = {
      token: 'jwt-token',
      user: { nombre: 'Admin User', email: 'admin@isp.com', rol: 'admin' }
    };
    const loginSpy = vi.spyOn(authService, 'login').mockReturnValue(of(mockResponse));

    component.credentials = { email: 'admin@isp.com', password: 'password' };
    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(loginSpy).toHaveBeenCalledWith({ email: 'admin@isp.com', password: 'password' });
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should submit login credentials and redirect to /cliente/dashboard for client user', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    const mockResponse = {
      token: 'jwt-token',
      user: { nombre: 'Cliente User', email: 'cliente@isp.com', rol: 'cliente' }
    };
    vi.spyOn(authService, 'login').mockReturnValue(of(mockResponse));

    component.credentials = { email: 'cliente@isp.com', password: 'password' };
    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/cliente/dashboard']);
  });

  it('should handle 401 Unauthorized error', () => {
    const mockError = { status: 401, error: { message: 'Unauthorized' } };
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Credenciales incorrectas');
  });

  it('should handle 404 Server Not Found error', () => {
    const mockError = { status: 404 };
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.errorMessage).toBe('Servidor no disponible');
  });

  it('should handle 0 Network error', () => {
    const mockError = { status: 0 };
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.errorMessage).toBe('Error de conexión con el servidor');
  });

  it('should handle other general errors', () => {
    const mockError = { status: 500, error: { message: 'Database failure' } };
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.errorMessage).toBe('Database failure');
  });
});
