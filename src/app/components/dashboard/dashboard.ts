import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard';
import { User } from '../../models/user.model';
import Chart from 'chart.js/auto';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;

  currentDate: Date = new Date();
  currentUser: User | null = null;
  stats: DashboardStats | null = null;
  loading = true;
  error = false;

  // Variables para el gráfico (para que el HTML no se queje)
  lineChartLabels: string[] = [];
  lineChartData: any[] = [];
  lineChartOptions: any = { responsive: true, maintainAspectRatio: false };
  lineChartLegend = true;
  lineChartType = 'line';
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartOptions: any = { responsive: true, maintainAspectRatio: false };
  pieChartType = 'pie';
  chartData: any = null;

  private lineChart: any = null;
  private pieChart: any = null;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });
    this.loadDashboardStats();
    this.loadChartStats();
  }

  ngAfterViewInit(): void {}

  loadDashboardStats(): void {
    this.loading = true;
    this.error = false;

    this.dashboardService.getStats().subscribe({
      next: (response: any) => {
        this.stats = response.data;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Dashboard stats cargados:', this.stats);
      },
      error: (err: any) => {
        console.error('Error al cargar dashboard:', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  async exportarClientesPDF(): Promise<void> {
    if (this.stats && this.stats.ultimosClientes) {
      await this.pdfService.generarPDFClientes(this.stats.ultimosClientes, 'Reporte de Clientes - ISP-Manager');
    } else {
      console.warn('No hay datos de clientes para exportar');
    }
  }

  async exportarFacturasPDF(): Promise<void> {
    if (this.stats && this.stats.ultimasFacturas) {
      console.log('Facturas recibidas:', this.stats.ultimasFacturas);
      await this.pdfService.generarPDFFacturas(this.stats.ultimasFacturas, 'Reporte de Facturas - ISP-Manager');
    } else {
      console.warn('No hay datos de facturas para exportar');
    }
  }

  loadChartStats(): void {
    this.dashboardService.getStatsForCharts().subscribe({
      next: (response: any) => {
        console.log('Datos para gráficas:', response);
        this.chartData = response.data;
        
        // Actualizar las variables que usa el HTML
        if (this.chartData?.facturas) {
          this.lineChartLabels = this.chartData.facturas.labels;
          this.lineChartData = [
            { data: this.chartData.facturas.pagadas, label: 'Pagadas' },
            { data: this.chartData.facturas.pendientes, label: 'Pendientes' }
          ];
        }
        
        if (this.chartData?.planes) {
          this.pieChartLabels = this.chartData.planes.labels;
          this.pieChartData = this.chartData.planes.values;
        }
        
        setTimeout(() => {
          this.createCharts();
        }, 100);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar estadísticas para gráficas:', err);
      }
    });
  }

  createCharts(): void {
    if (!this.chartData) return;

    if (this.lineChart) {
      this.lineChart.destroy();
      this.lineChart = null;
    }
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }

    if (this.lineChartCanvas && this.lineChartCanvas.nativeElement) {
      const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.lineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.chartData.facturas.labels,
            datasets: [
              {
                label: 'Pagadas',
                data: this.chartData.facturas.pagadas,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40,167,69,0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Pendientes',
                data: this.chartData.facturas.pendientes,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255,193,7,0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }
        });
        console.log('Gráfico de líneas creado');
      }
    }

    if (this.pieChartCanvas && this.pieChartCanvas.nativeElement) {
      const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.pieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: this.chartData.planes.labels,
            datasets: [{
              data: this.chartData.planes.values,
              backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }
        });
        console.log('Gráfico de pastel creado');
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatMoney(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pagada': return 'bg-success';
      case 'pendiente': return 'bg-warning text-dark';
      case 'vencida': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}