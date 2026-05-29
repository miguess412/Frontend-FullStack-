import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PlanesComponent } from './planes';
import { PlanService, Plan } from '../../../services/plan.service';
import { AuthService } from '../../../services/auth.service';

// Mock global localStorage for Node/Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {
    'current_user': JSON.stringify({ nombre: 'Admin', email: 'admin@ispmanager.com', rol_id: 1, token: 'fake-token' }),
    'token': 'fake-token'
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

describe('Planes', () => {
  let component: PlanesComponent;
  let fixture: ComponentFixture<PlanesComponent>;
  let planService: PlanService;
  let authService: AuthService;
  let router: Router;

  const mockPlanes: Plan[] = [
    { id: 1, nombre: 'Plan Basico', velocidad: '10 Mbps', precio: 30000, descripcion: 'Internet basico', activo: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanesComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanesComponent);
    component = fixture.componentInstance;
    planService = TestBed.inject(PlanService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    vi.spyOn(planService, 'getPlanes').mockReturnValue(of(mockPlanes));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load plans on init', () => {
    component.ngOnInit();
    expect(planService.getPlanes).toHaveBeenCalled();
    expect(component.planes).toEqual(mockPlanes);
  });

  it('should handle 401 Unauthorized error during load', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    vi.spyOn(planService, 'getPlanes').mockReturnValue(throwError(() => ({ status: 401 })));

    component.cargarPlanes();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should open modal to create a new plan', () => {
    component.abrirModalNuevoPlan();
    expect(component.editando).toBe(false);
    expect(component.modalTitulo).toBe('Nuevo Plan');
    expect(component.planIdEditando).toBeNull();
    expect(component.mostrarModal).toBe(true);
  });

  it('should open modal to edit a plan', () => {
    const plan = mockPlanes[0];
    component.editarPlan(plan);
    expect(component.editando).toBe(true);
    expect(component.modalTitulo).toBe('Editar Plan');
    expect(component.planIdEditando).toBe(plan.id);
    expect(component.planFormData.nombre).toBe(plan.nombre);
    expect(component.mostrarModal).toBe(true);
  });

  it('should close modal', () => {
    component.mostrarModal = true;
    component.cerrarModal();
    expect(component.mostrarModal).toBe(false);
  });

  it('should create a plan when saving in create mode', () => {
    const createSpy = vi.spyOn(planService, 'crearPlan').mockReturnValue(of({} as any));
    component.editando = false;
    component.planFormData = { nombre: 'Plan Mega' };

    component.guardarPlan();

    expect(createSpy).toHaveBeenCalledWith(component.planFormData);
    expect(component.mostrarModal).toBe(false);
  });

  it('should update a plan when saving in edit mode', () => {
    const updateSpy = vi.spyOn(planService, 'actualizarPlan').mockReturnValue(of({} as any));
    component.editando = true;
    component.planIdEditando = 1;
    component.planFormData = { nombre: 'Plan Mega Editado' };

    component.guardarPlan();

    expect(updateSpy).toHaveBeenCalledWith(1, component.planFormData);
    expect(component.mostrarModal).toBe(false);
  });

  it('should delete a plan when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteSpy = vi.spyOn(planService, 'eliminarPlan').mockReturnValue(of({}));

    component.eliminarPlan(1);

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it('should logout and redirect', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should format money correctly', () => {
    const formatted = component.formatMoney(35000);
    expect(formatted).toContain('35');
    expect(formatted).toContain('$');
  });
});
