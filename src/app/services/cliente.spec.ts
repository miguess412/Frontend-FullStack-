import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService, FacturaCliente, PlanCliente, TicketSoporte } from './cliente';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/cliente';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClienteService]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch customer invoices (getMisFacturas)', () => {
    const mockFacturas: FacturaCliente[] = [
      { id: 1, monto: 35000, estado: 'pagada', fecha_emision: '2026-05-01', fecha_vencimiento: '2026-05-10' }
    ];

    service.getMisFacturas().subscribe((facturas) => {
      expect(facturas).toEqual(mockFacturas);
    });

    const req = httpMock.expectOne(`${apiUrl}/facturas`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFacturas);
  });

  it('should fetch customer plan (getMiPlan)', () => {
    const mockPlan: PlanCliente = { id: 2, nombre: 'Plan Estándar', velocidad: '50 Mbps', precio: 50000 };

    service.getMiPlan().subscribe((plan) => {
      expect(plan).toEqual(mockPlan);
    });

    const req = httpMock.expectOne(`${apiUrl}/plan`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlan);
  });

  it('should send POST request to create ticket (crearTicket)', () => {
    const mockTicket: TicketSoporte = { asunto: 'Falla', descripcion: 'No hay señal', prioridad: 'alta' };

    service.crearTicket(mockTicket).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/tickets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockTicket);
    req.flush({ success: true });
  });

  it('should send POST request to pay invoice (pagarFactura)', () => {
    service.pagarFactura(123).subscribe((response) => {
      expect(response).toEqual({ url: 'http://paypal.payment.url' });
    });

    const req = httpMock.expectOne(`${apiUrl}/pagar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ facturaId: 123 });
    req.flush({ url: 'http://paypal.payment.url' });
  });
});
