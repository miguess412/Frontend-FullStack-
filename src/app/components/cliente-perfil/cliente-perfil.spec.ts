import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ClientePerfilComponent } from './cliente-perfil';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

// Mock localStorage for Node/Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {
    'current_user': JSON.stringify({ nombre: 'Juan Perez', email: 'juan@isp.com', telefono: '3001234567' }),
    'auth_token': 'fake-token'
  };
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    key: (index: number) => '',
    length: 0
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('ClientePerfilComponent', () => {
  let component: ClientePerfilComponent;
  let fixture: ComponentFixture<ClientePerfilComponent>;
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientePerfilComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientePerfilComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    vi.spyOn(authService, 'getCurrentUser').mockReturnValue({
      nombre: 'Juan Perez',
      email: 'juan@isp.com',
      telefono: '3001234567'
    });
    vi.spyOn(authService, 'getToken').mockReturnValue('fake-token');

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    // Flush the initial profile load HTTP request
    const req = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    req.flush({ direccion: 'Calle 10', ciudad: 'Bogotá' });
    
    expect(component).toBeTruthy();
  });

  it('should load profile details on init', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    expect(req.request.method).toBe('GET');
    req.flush({ direccion: 'Calle 10 # 4-5', ciudad: 'Medellín' });

    expect(component.perfil.nombre).toBe('Juan Perez');
    expect(component.perfil.direccion).toBe('Calle 10 # 4-5');
    expect(component.perfil.ciudad).toBe('Medellín');
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading profile fails', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    req.error(new ProgressEvent('Network error'));

    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should update profile successfully', () => {
    // Flush initial load
    const loadReq = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    loadReq.flush({ direccion: 'Calle 10', ciudad: 'Bogotá' });

    component.perfil.nombre = 'Juan Modificado';
    component.perfil.direccion = 'Calle Nueva';
    component.guardarCambios();

    const putReq = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual({
      nombre: 'Juan Modificado',
      telefono: '3001234567',
      direccion: 'Calle Nueva',
      ciudad: 'Bogotá'
    });
    putReq.flush({ success: true });

    expect(component.mensajeExito).toBe('¡Perfil actualizado correctamente!');
    expect(component.guardando).toBe(false);
  });

  it('should handle error during profile update', () => {
    // Flush initial load
    const loadReq = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    loadReq.flush({ direccion: 'Calle 10', ciudad: 'Bogotá' });

    component.guardarCambios();

    const putReq = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    putReq.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });

    expect(component.mensajeError).toBe('Update failed');
    expect(component.guardando).toBe(false);
  });

  it('should logout and redirect', () => {
    const loadReq = httpMock.expectOne(`${environment.apiUrl}/cliente/perfil`);
    loadReq.flush({ direccion: 'Calle 10', ciudad: 'Bogotá' });

    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
