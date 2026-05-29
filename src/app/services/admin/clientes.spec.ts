import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientesService, Cliente, ClienteFormData } from './clientes';
import { environment } from '../../../environments/environment';

describe('ClientesService', () => {
  let service: ClientesService;
  let httpMock: HttpTestingController;

  const mockClientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan Perez',
      email: 'juan@isp.com',
      telefono: '3001234567',
      direccion: 'Calle 10 # 5-6',
      ciudad: 'Bogotá',
      plan: { id: 1, nombre: 'Plan Basico', velocidad: '10 Mbps', precio: 30000 },
      fecha_registro: '2026-05-01',
      activo: true
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientesService]
    });
    service = TestBed.inject(ClientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all clients (getClientes)', () => {
    service.getClientes().subscribe((clientes) => {
      expect(clientes).toEqual(mockClientes);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/clientes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClientes);
  });

  it('should fetch single client by id (getCliente)', () => {
    service.getCliente(1).subscribe((cliente) => {
      expect(cliente).toEqual(mockClientes[0]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/clientes/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClientes[0]);
  });

  it('should send POST request to create client (crearCliente)', () => {
    const newClient: ClienteFormData = {
      nombre: 'Maria Gomez',
      email: 'maria@isp.com',
      telefono: '3109876543',
      direccion: 'Carrera 15 # 20-30',
      ciudad: 'Medellín',
      plan_id: 2
    };

    service.crearCliente(newClient).subscribe((cliente) => {
      expect(cliente.nombre).toBe('Maria Gomez');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/clientes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newClient);
    req.flush({ ...mockClientes[0], id: 2, nombre: 'Maria Gomez' });
  });

  it('should send PUT request to update client (actualizarCliente)', () => {
    const changes: Partial<ClienteFormData> = { nombre: 'Juan Modificado' };

    service.actualizarCliente(1, changes).subscribe((cliente) => {
      expect(cliente.nombre).toBe('Juan Modificado');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/clientes/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(changes);
    req.flush({ ...mockClientes[0], nombre: 'Juan Modificado' });
  });

  it('should send DELETE request to delete client (eliminarCliente)', () => {
    service.eliminarCliente(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/clientes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
