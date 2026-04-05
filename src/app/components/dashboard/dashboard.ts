import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard';
import { User } from '../../models/user.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: DashboardStats | null = null;
  loading = true;
  error = false;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← AGREGAR ESTO
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges(); // ← FORZAR ACTUALIZACIÓN
    });
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = false;

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
        this.cdr.detectChanges(); // ← FORZAR ACTUALIZACIÓN CUANDO LLEGAN DATOS
        console.log('Dashboard stats cargados:', this.stats);
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges(); // ← TAMBIÉN EN ERROR
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
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
      case 'pagada':
        return 'bg-success';
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'vencida':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}