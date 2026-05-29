import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService, DashboardResponse } from './dashboard';
import { environment } from '../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard stats (getStats)', () => {
    const mockResponse: DashboardResponse = {
      success: true,
      data: {
        totalClientes: 10,
        totalPagado: 500000,
        totalPendiente: 200000,
        ticketsAbiertos: 3,
        ultimosClientes: [],
        ultimasFacturas: []
      }
    };

    service.getStats().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch stats for charts (getStatsForCharts)', () => {
    const mockChartStats = { lineData: [1, 2, 3] };

    service.getStatsForCharts().subscribe((data) => {
      expect(data).toEqual(mockChartStats);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats-charts`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChartStats);
  });
});
