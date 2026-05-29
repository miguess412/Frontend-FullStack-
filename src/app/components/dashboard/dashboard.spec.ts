import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard';
import { DashboardService, DashboardStats } from '../../services/dashboard';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';

// Mock global localStorage for Node/Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
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

describe('Dashboard', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: DashboardService;
  let authService: AuthService;
  let pdfService: PdfService;
  let router: Router;

  const mockStats: DashboardStats = {
    totalClientes: 100,
    totalPagado: 5000000,
    totalPendiente: 1500000,
    ticketsAbiertos: 5,
    ultimosClientes: [
      { id: 1, nombre: 'Client A', email: 'a@isp.com', telefono: '123', plan: 'Plan Premium', fecha_registro: '2026-05-01' }
    ],
    ultimasFacturas: [
      { id: 1, cliente: 'Client A', monto: 50000, estado: 'pagada', fecha_emision: '2026-05-01', fecha_vencimiento: '2026-05-10' }
    ]
  };

  const mockChartData = {
    data: {
      facturas: { labels: ['May'], pagadas: [10], pendientes: [5] },
      planes: { labels: ['Premium'], values: [15] }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService);
    authService = TestBed.inject(AuthService);
    pdfService = TestBed.inject(PdfService);
    router = TestBed.inject(Router);

    vi.spyOn(dashboardService, 'getStats').mockReturnValue(of({ success: true, data: mockStats }));
    vi.spyOn(dashboardService, 'getStatsForCharts').mockReturnValue(of(mockChartData));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard statistics on init', () => {
    expect(dashboardService.getStats).toHaveBeenCalled();
    expect(dashboardService.getStatsForCharts).toHaveBeenCalled();
    expect(component.stats).toEqual(mockStats);
  });

  it('should handle unauthorized error (401) during load', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    vi.spyOn(dashboardService, 'getStats').mockReturnValue(throwError(() => ({ status: 401 })));

    component.loadDashboardStats();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should export clients to PDF', async () => {
    const pdfSpy = vi.spyOn(pdfService, 'generarPDFClientes').mockReturnValue(Promise.resolve());
    await component.exportarClientesPDF();
    expect(pdfSpy).toHaveBeenCalledWith(mockStats.ultimosClientes, 'Reporte de Clientes - ISP-Manager');
  });

  it('should export invoices to PDF', async () => {
    const pdfSpy = vi.spyOn(pdfService, 'generarPDFFacturas').mockReturnValue(Promise.resolve());
    await component.exportarFacturasPDF();
    expect(pdfSpy).toHaveBeenCalledWith(mockStats.ultimasFacturas, 'Reporte de Facturas - ISP-Manager');
  });

  it('should format currency correctly', () => {
    const formatted = component.formatMoney(1500000);
    expect(formatted).toContain('1.500.000');
  });

  it('should format date strings', () => {
    const formatted = component.formatDate('2026-05-28T12:00:00');
    expect(formatted).toBe('28/5/2026');
  });

  it('should return correct CSS class for different invoice states', () => {
    expect(component.getEstadoClass('pagada')).toBe('bg-success');
    expect(component.getEstadoClass('pendiente')).toBe('bg-warning text-dark');
    expect(component.getEstadoClass('vencida')).toBe('bg-danger');
    expect(component.getEstadoClass('unknown')).toBe('bg-secondary');
  });

  it('should logout and redirect', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
