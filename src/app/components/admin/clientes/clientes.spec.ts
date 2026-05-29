import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ClientesComponent } from './clientes';
import { ClientesService, Cliente } from '../../../services/admin/clientes';
import { AuthService } from '../../../services/auth.service';

declare var bootstrap: any;

// Mock localStorage for Node/Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {
    'current_user': JSON.stringify({ nombre: 'Admin', rol: 'admin' }),
    'auth_token': 'fake-token'
  };
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

// Mock global bootstrap Modal
const bootstrapMock = {
  Modal: class {
    show() {}
    hide() {}
  }
};
Object.defineProperty(globalThis, 'bootstrap', { value: bootstrapMock, writable: true });

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;
  let clientesService: ClientesService;
  let authService: AuthService;
  let router: Router;

  const mockClientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan Perez',
      email: 'juan@isp.com',
      telefono: '3001234567',
      direccion: 'Calle 10',
      ciudad: 'Bogotá',
      plan: { id: 1, nombre: 'Plan Basico', velocidad: '10 Mbps', precio: 30000 },
      fecha_registro: '2026-05-01',
      activo: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    
    vi.spyOn(clientesService, 'getClientes').mockReturnValue(of(mockClientes));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on init', () => {
    component.ngOnInit();
    expect(clientesService.getClientes).toHaveBeenCalled();
    expect(component.clientes).toEqual(mockClientes);
  });

  it('should handle 401 Unauthorized during clients load', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    vi.spyOn(clientesService, 'getClientes').mockReturnValue(throwError(() => ({ status: 401 })));

    component.cargarClientes();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should open Modal for creating a new client', () => {
    const modalSpy = vi.spyOn(bootstrap.Modal.prototype, 'show').mockImplementation(() => {});
    component.abrirModalNuevoCliente();

    expect(component.editando).toBe(false);
    expect(component.modalTitulo).toBe('Nuevo Cliente');
    expect(component.clienteFormData.nombre).toBe('');
    expect(modalSpy).toHaveBeenCalled();
  });

  it('should open Modal for editing a client', () => {
    const modalSpy = vi.spyOn(bootstrap.Modal.prototype, 'show').mockImplementation(() => {});
    const client = mockClientes[0];
    component.editarCliente(client);

    expect(component.editando).toBe(true);
    expect(component.modalTitulo).toBe('Editar Cliente');
    expect(component.clienteFormData.nombre).toBe(client.nombre);
    expect(component.clienteIdEditando).toBe(client.id);
    expect(modalSpy).toHaveBeenCalled();
  });

  it('should update client when saving in edit mode', () => {
    const modalHideSpy = vi.fn();
    component.modal = { hide: modalHideSpy };
    const updateSpy = vi.spyOn(clientesService, 'actualizarCliente').mockReturnValue(of({} as any));

    component.editando = true;
    component.clienteIdEditando = 1;
    component.clienteFormData = {
      nombre: 'Juan Perez Editado',
      email: 'juan@isp.com',
      telefono: '3001234567',
      direccion: 'Calle 10',
      ciudad: 'Bogotá',
      plan_id: 1
    };

    component.guardarCliente();

    expect(updateSpy).toHaveBeenCalledWith(1, component.clienteFormData);
    expect(modalHideSpy).toHaveBeenCalled();
  });

  it('should create client when saving in create mode', () => {
    const modalHideSpy = vi.fn();
    component.modal = { hide: modalHideSpy };
    const createSpy = vi.spyOn(clientesService, 'crearCliente').mockReturnValue(of({} as any));

    component.editando = false;
    component.clienteIdEditando = null;
    component.clienteFormData = {
      nombre: 'Nuevo Cliente',
      email: 'nuevo@isp.com',
      telefono: '3009999999',
      direccion: 'Calle Nueva',
      ciudad: 'Bogotá',
      plan_id: 2
    };

    component.guardarCliente();

    expect(createSpy).toHaveBeenCalledWith(component.clienteFormData);
    expect(modalHideSpy).toHaveBeenCalled();
  });

  it('should delete client when delete action is confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteSpy = vi.spyOn(clientesService, 'eliminarCliente').mockReturnValue(of(undefined));

    component.eliminarCliente(1);

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it('should logout and redirect to login page', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should format money correctly', () => {
    const formatted = component.formatMoney(50000);
    expect(formatted).toContain('50');
    expect(formatted).toContain('$');
  });
});
