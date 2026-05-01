import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService, FacturaCliente, PlanCliente } from '../../services/cliente';
import { User } from '../../models/user.model';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-cliente.html',
  styleUrls: ['./dashboard-cliente.css']
})
export class DashboardClienteComponent implements OnInit {
  currentUser: User | null = null;
  misFacturas: FacturaCliente[] = [];
  miPlan: PlanCliente | null = null;
  proximoPago: FacturaCliente | null = null;
  ticketsActivos = 0;
  loading = true;
  error = false;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private pagoService: PagoService,
    private router: Router,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges(); // ← Forzar actualización
    
      // Solo cargar datos si hay un usuario (después del login)
      if (user) {
        this.cargarDatosCliente();
      }
    });
    
  }

  cargarDatosCliente(): void {
  // Verificar que hay token antes de cargar
  const token = this.authService.getToken();
  if (!token) {
    console.log('No hay token, esperando...');
    return;
  }
  
  this.loading = true;
  this.error = false;

  // Cargar facturas
  this.clienteService.getMisFacturas().subscribe({
    next: (facturas) => {
      console.log('Facturas recibidas:', facturas);
      this.misFacturas = facturas;
      this.proximoPago = facturas.find(f => f.estado === 'pendiente') || null;
      this.loading = false;
      this.cdr.detectChanges();// ← Forzar actualización
    },
    error: (err) => {
      console.error('Error al cargar facturas:', err);
      this.error = true;
      this.loading = false;
      this.cdr.detectChanges();// ← Forzar actualización
    }
  });

  // Cargar plan
  this.clienteService.getMiPlan().subscribe({
    next: (plan) => {
      console.log('Plan recibido:', plan);
      this.miPlan = plan;
      this.cdr.detectChanges();// ← Forzar actualización
    },
    error: (err) => {
      console.error('Error al cargar plan:', err);
    }
  });
}

  pagarFactura(facturaId: number): void {
  // Mostrar loading
  const btn = document.activeElement as HTMLElement;
  if (btn) btn.innerText = 'Procesando...';
  
  this.pagoService.crearOrden(facturaId).subscribe({
    next: (response) => {
      if (response.success && response.approvalUrl) {
        // Redirigir a PayPal para el pago
        window.location.href = response.approvalUrl;
      } else {
        alert('Error al crear la orden de pago');
        if (btn) btn.innerText = 'Pagar';
      }
    },
    error: (err) => {
      console.error('Error:', err);
      alert('Error al procesar el pago');
      if (btn) btn.innerText = 'Pagar';
    }
  });
}

  pagarAhora(): void {
    if (this.proximoPago) {
      this.pagarFactura(this.proximoPago.id);
    }
  }

  nuevoTicket(): void {
    alert('Funcionalidad en desarrollo: Crear ticket de soporte');
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
}