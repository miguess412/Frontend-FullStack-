import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlanService, Plan } from './plan.service';
import { environment } from '../../environments/environment';

describe('PlanService', () => {
  let service: PlanService;
  let httpMock: HttpTestingController;

  const mockPlanes: Plan[] = [
    { id: 1, nombre: 'Plan Basico', velocidad: '10 Mbps', precio: 30000, descripcion: 'Internet basico', activo: true },
    { id: 2, nombre: 'Plan Premium', velocidad: '100 Mbps', precio: 70000, descripcion: 'Fibra optica de alta velocidad', activo: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanService]
    });
    service = TestBed.inject(PlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all plans (getPlanes)', () => {
    service.getPlanes().subscribe((planes) => {
      expect(planes.length).toBe(2);
      expect(planes).toEqual(mockPlanes);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/planes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlanes);
  });

  it('should fetch a single plan by id (getPlan)', () => {
    const mockPlan = mockPlanes[0];
    service.getPlan(1).subscribe((plan) => {
      expect(plan).toEqual(mockPlan);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/planes/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlan);
  });

  it('should send POST request to create a plan (crearPlan)', () => {
    const newPlan: Partial<Plan> = { nombre: 'Plan Mega', precio: 90000 };
    const savedPlan: Plan = { id: 3, nombre: 'Plan Mega', velocidad: '300 Mbps', precio: 90000, descripcion: 'Mega velocidad', activo: true };

    service.crearPlan(newPlan).subscribe((plan) => {
      expect(plan).toEqual(savedPlan);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/planes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPlan);
    req.flush(savedPlan);
  });

  it('should send PUT request to update a plan (actualizarPlan)', () => {
    const changes: Partial<Plan> = { precio: 35000 };
    const updatedPlan: Plan = { ...mockPlanes[0], precio: 35000 };

    service.actualizarPlan(1, changes).subscribe((plan) => {
      expect(plan).toEqual(updatedPlan);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/planes/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(changes);
    req.flush(updatedPlan);
  });

  it('should send DELETE request to delete a plan (eliminarPlan)', () => {
    service.eliminarPlan(1).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/planes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
