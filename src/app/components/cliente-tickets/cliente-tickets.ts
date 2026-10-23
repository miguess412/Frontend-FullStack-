import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';

declare var bootstrap: any;

@Component({
  selector: 'app-cliente-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cliente-tickets.html',
  styleUrls: ['./cliente-tickets.css']
})
export class ClienteTicketsComponent implements OnInit, OnDestroy {
  private refreshInterval: any;
  
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;
  nuevoTicket = { asunto: '', descripcion: '', prioridad: 'media' };
  loading = true;
  creando = false;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTickets();
    // Recargar periódicamente cada 10 segundos
    this.refreshInterval = setInterval(() => {
      this.cargarTicketsSilencioso();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  recargarTickets(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.loading = true;
    this.ticketService.getMisTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando tickets:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTicketsSilencioso(): void {
    this.ticketService.getMisTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error en recarga silenciosa de tickets:', err)
    });
  }

  abrirModalNuevoTicket(): void {
    this.nuevoTicket = { asunto: '', descripcion: '', prioridad: 'media' };
    const modalEl = document.getElementById('nuevoTicketModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  crearTicket(): void {
    if (!this.nuevoTicket.asunto.trim() || !this.nuevoTicket.descripcion.trim()) {
      alert('Por favor ingresa el asunto y la descripción del problema');
      return;
    }

    this.creando = true;
    this.ticketService.crearTicket(this.nuevoTicket).subscribe({
      next: () => {
        this.creando = false;
        const modalEl = document.getElementById('nuevoTicketModal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal?.hide();
        }
        this.nuevoTicket = { asunto: '', descripcion: '', prioridad: 'media' };
        this.cargarTickets();
      },
      error: (err) => {
        this.creando = false;
        console.error('Error creando ticket:', err);
        alert(err.error?.message || 'Error al crear el ticket de soporte');
      }
    });
  }

  verDetalle(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    const modalEl = document.getElementById('detalleTicketModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}