import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PdfService } from './pdf.service';
import { environment } from '../../environments/environment';

describe('PdfService', () => {
  let service: PdfService;
  let httpMock: HttpTestingController;
  let clickCalled = false;
  let appendCalled = false;
  let removeCalled = false;

  // Mock global objects
  beforeAll(() => {
    Object.defineProperty(globalThis, 'alert', { value: () => {}, writable: true });
    
    const dummyLink = {
      href: '',
      download: '',
      click: () => { clickCalled = true; }
    } as any;

    const originalCreateElement = document.createElement;
    document.createElement = (tagName: string, options?: any) => {
      if (tagName === 'a') {
        return dummyLink;
      }
      return originalCreateElement.call(document, tagName, options);
    };

    document.body.appendChild = (node: any) => {
      appendCalled = true;
      return node;
    };
    document.body.removeChild = (node: any) => {
      removeCalled = true;
      return node;
    };
  });

  beforeEach(() => {
    clickCalled = false;
    appendCalled = false;
    removeCalled = false;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PdfService]
    });
    service = TestBed.inject(PdfService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate clients PDF successfully and trigger download', async () => {
    const mockClientes = [{ nombre: 'Cliente A', email: 'a@isp.com' }];
    const mockResponse = { success: true, message: 'PDF generated', filename: 'report.pdf', url: 'http://temp.pdf' };

    const promise = service.generarPDFClientes(mockClientes, 'Reporte de clientes');

    const req = httpMock.expectOne(`${environment.apiUrl}/reportes/clientes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ clientes: mockClientes, titulo: 'Reporte de clientes' });
    req.flush(mockResponse);

    await promise;

    expect(clickCalled).toBe(true);
    expect(appendCalled).toBe(true);
    expect(removeCalled).toBe(true);
  });

  it('should handle errors when generating clients PDF fails', async () => {
    const mockClientes = [{ nombre: 'Cliente A' }];
    const promise = service.generarPDFClientes(mockClientes, 'Reporte');

    const req = httpMock.expectOne(`${environment.apiUrl}/reportes/clientes`);
    req.flush({ success: false, message: 'Generation failed' });

    await promise;
    expect(clickCalled).toBe(false);
  });

  it('should catch exceptions in generating clients PDF', async () => {
    const mockClientes = [{ nombre: 'Cliente A' }];
    const promise = service.generarPDFClientes(mockClientes, 'Reporte');

    const req = httpMock.expectOne(`${environment.apiUrl}/reportes/clientes`);
    req.error(new ProgressEvent('error'));

    await promise;
    expect(clickCalled).toBe(false);
  });

  it('should generate invoices PDF successfully and trigger download', async () => {
    const mockFacturas = [{ id: 1, monto: 50000 }];
    const mockResponse = { success: true, message: 'PDF generated', filename: 'invoice.pdf', url: 'http://temp.pdf' };

    const promise = service.generarPDFFacturas(mockFacturas, 'Facturas');

    const req = httpMock.expectOne(`${environment.apiUrl}/reportes/facturas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ facturas: mockFacturas, titulo: 'Facturas' });
    req.flush(mockResponse);

    await promise;

    expect(clickCalled).toBe(true);
    expect(appendCalled).toBe(true);
    expect(removeCalled).toBe(true);
  });
});
