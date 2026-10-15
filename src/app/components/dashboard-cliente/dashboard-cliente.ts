import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService, FacturaCliente, PlanCliente, ConsumoCliente } from '../../services/cliente';
import { User } from '../../models/user.model';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard-cliente.html',
  styleUrls: ['./dashboard-cliente.css']
})
export class DashboardClienteComponent implements OnInit {
  currentUser: User | null = null;
  misFacturas: FacturaCliente[] = [];
  miPlan: PlanCliente | null = null;
  consumo: ConsumoCliente | null = null;
  planesDisponibles: PlanCliente[] = [];
  proximoPago: FacturaCliente | null = null;
  ticketsActivos = 0;
  loading = true;
  error = false;

  // Estados para modales y acciones
  mostrarModalPlan = false;
  nuevoPlanSeleccionadoId: number | null = null;
  cambiandoPlan = false;
  procesandoPagoId: number | null = null;
  mensajeExito = '';
  mensajeError = '';

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
      this.cdr.detectChanges();
    
      if (user) {
        this.cargarDatosCliente();
      }
    });
  }

  cargarDatosCliente(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.log('No hay token, esperando...');
      return;
    }
    
    this.loading = true;
    this.error = false;

    // Cargar facturas (HU13)
    this.clienteService.getMisFacturas().subscribe({
      next: (facturas) => {
        this.misFacturas = facturas;
        this.proximoPago = facturas.find(f => f.estado === 'pendiente') || null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar facturas:', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    // Cargar plan (HU9)
    this.clienteService.getMiPlan().subscribe({
      next: (plan) => {
        this.miPlan = plan;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar plan:', err);
      }
    });

    // Cargar consumo (HU10)
    this.cargarConsumo();

    // Cargar planes disponibles para cambio (HU12)
    this.cargarPlanesDisponibles();
  }

  cargarConsumo(): void {
    this.clienteService.getMiConsumo().subscribe({
      next: (consumoData) => {
        this.consumo = consumoData;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar consumo:', err);
      }
    });
  }

  cargarPlanesDisponibles(): void {
    this.clienteService.getPlanesDisponibles().subscribe({
      next: (planes) => {
        // Filtrar solo los planes activos
        this.planesDisponibles = planes.filter(p => p.activo !== false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar planes disponibles:', err);
      }
    });
  }

  // ============================================
  // HU12: CAMBIAR DE PLAN
  // ============================================
  abrirModalCambioPlan(): void {
    this.nuevoPlanSeleccionadoId = this.miPlan ? this.miPlan.id : null;
    this.mostrarModalPlan = true;
    if (this.planesDisponibles.length === 0) {
      this.cargarPlanesDisponibles();
    }
  }

  cerrarModalCambioPlan(): void {
    this.mostrarModalPlan = false;
    this.cambiandoPlan = false;
  }

  confirmarCambioPlan(): void {
    if (!this.nuevoPlanSeleccionadoId) {
      alert('Por favor selecciona un plan');
      return;
    }

    if (this.miPlan && this.nuevoPlanSeleccionadoId === this.miPlan.id) {
      alert('Ya tienes este plan contratado');
      return;
    }

    this.cambiandoPlan = true;
    this.clienteService.cambiarMiPlan(this.nuevoPlanSeleccionadoId).subscribe({
      next: (res) => {
        this.cambiandoPlan = false;
        this.mostrarModalPlan = false;
        this.miPlan = res.plan;
        this.mensajeExito = `¡Plan cambiado con éxito a ${res.plan.nombre}!`;
        // Actualizar consumo y métricas acordes al nuevo plan
        this.cargarConsumo();
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 6000);
      },
      error: (err) => {
        this.cambiandoPlan = false;
        console.error('Error al cambiar plan:', err);
        alert(err.error?.message || 'Error al cambiar de plan');
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================
  // HU14: PAGOS SIMULADOS
  // ============================================
  pagarFactura(facturaId: number): void {
    if (!confirm(`¿Deseas realizar el pago simulado de la factura #${facturaId}?`)) {
      return;
    }

    this.procesandoPagoId = facturaId;
    this.mensajeError = '';

    this.clienteService.pagarFactura(facturaId).subscribe({
      next: (res) => {
        this.procesandoPagoId = null;
        this.mensajeExito = `✅ Factura #${facturaId} pagada exitosamente de forma simulada. Registrado en base de datos.`;
        
        // Actualizar el estado en la lista local de facturas
        const index = this.misFacturas.findIndex(f => f.id === facturaId);
        if (index !== -1) {
          this.misFacturas[index] = {
            ...this.misFacturas[index],
            estado: 'pagada',
            fecha_pago: res.factura?.fecha_pago || new Date().toISOString()
          };
        }
        
        // Recalcular próximo pago pendiente
        this.proximoPago = this.misFacturas.find(f => f.estado === 'pendiente') || null;
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 6000);
      },
      error: (err) => {
        this.procesandoPagoId = null;
        console.error('Error en pago simulado:', err);
        this.mensajeError = err.error?.message || 'Error al procesar el pago simulado';
        this.cdr.detectChanges();
      }
    });
  }

  pagarAhora(): void {
    if (this.proximoPago) {
      this.pagarFactura(this.proximoPago.id);
    }
  }

  // ============================================
  // HU24: PAGAR CON PAYPAL (OPCIONAL / EXTERNO)
  // ============================================
  pagarConPaypal(facturaId: number): void {
    this.procesandoPagoId = facturaId;
    this.pagoService.crearOrden(facturaId).subscribe({
      next: (response) => {
        this.procesandoPagoId = null;
        if (response.success && response.approvalUrl) {
          window.location.href = response.approvalUrl;
        } else {
          alert('Error al crear orden en PayPal');
        }
      },
      error: (err) => {
        this.procesandoPagoId = null;
        console.error('Error en PayPal:', err);
        alert('Error al conectar con la API de PayPal (requiere credenciales Sandbox)');
      }
    });
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

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}