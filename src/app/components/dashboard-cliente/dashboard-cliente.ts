import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService, FacturaCliente, PlanCliente, ConsumoCliente } from '../../services/cliente';
import { User } from '../../models/user.model';
import { PagoService } from '../../services/pago.service';
import { TicketService } from '../../services/ticket.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../language-selector/language-selector';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LanguageSelectorComponent],
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
    private ticketService: TicketService,
    private pagoService: PagoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    
      if (user) {
        this.cargarDatosCliente();
      }
    });

    this.translationService.currentLang$.subscribe(() => {
      this.cdr.detectChanges();
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

    // Cargar plan contratado (HU9)
    this.clienteService.getMiPlan().subscribe({
      next: (plan) => {
        this.miPlan = plan;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar plan:', err)
    });

    // Cargar consumo de internet (HU10)
    this.clienteService.getMiConsumo().subscribe({
      next: (consumo) => {
        this.consumo = consumo;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar consumo:', err)
    });

    // Cargar planes disponibles para cambio (HU12)
    this.clienteService.getPlanesDisponibles().subscribe({
      next: (planes) => {
        this.planesDisponibles = planes;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar planes disponibles:', err)
    });

    // Cargar tickets de soporte para contador en dashboard
    this.ticketService.getMisTickets().subscribe({
      next: (tickets) => {
        this.ticketsActivos = tickets.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso').length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando tickets de cliente:', err)
    });
  }

  // ============================================
  // HU12: MODAL Y CAMBIO DE PLAN
  // ============================================
  abrirModalCambiarPlan(): void {
    this.nuevoPlanSeleccionadoId = this.miPlan ? this.miPlan.id : null;
    this.mostrarModalPlan = true;
    this.mensajeError = '';
  }

  cerrarModalPlan(): void {
    this.mostrarModalPlan = false;
    this.nuevoPlanSeleccionadoId = null;
  }

  confirmarCambioPlan(): void {
    if (!this.nuevoPlanSeleccionadoId) {
      this.mensajeError = 'Debes seleccionar un plan';
      return;
    }

    if (this.miPlan && this.miPlan.id === this.nuevoPlanSeleccionadoId) {
      this.mensajeError = 'Ya tienes contratado este plan';
      return;
    }

    this.cambiandoPlan = true;
    this.clienteService.cambiarMiPlan(this.nuevoPlanSeleccionadoId).subscribe({
      next: (res) => {
        this.cambiandoPlan = false;
        this.mostrarModalPlan = false;
        this.mensajeExito = `✅ ${res.message || 'Plan actualizado con éxito'}`;
        
        // Actualizar plan y consumo en la vista
        if (res.plan) {
          this.miPlan = res.plan;
        }
        this.clienteService.getMiConsumo().subscribe(c => this.consumo = c);
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.cambiandoPlan = false;
        console.error('Error al cambiar de plan:', err);
        this.mensajeError = err.error?.message || 'Error al cambiar de plan';
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================
  // HU14: PAGAR FACTURA (SIMULADO EN MYSQL)
  // ============================================
  pagarFactura(facturaId: number): void {
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
  // HU24: PAGAR CON PAYPAL (PASARELA EXTERNA)
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
    this.router.navigate(['/cliente/tickets']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatMoney(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const isEn = this.translationService.currentLanguage === 'en';
    return new Intl.NumberFormat(isEn ? 'en-US' : 'es-CO', {
      style: 'currency',
      currency: isEn ? 'USD' : 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const isEn = this.translationService.currentLanguage === 'en';
    return date.toLocaleDateString(isEn ? 'en-US' : 'es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
