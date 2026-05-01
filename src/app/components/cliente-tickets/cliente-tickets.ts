import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-cliente-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cliente-tickets.html',
  styleUrls: ['./cliente-tickets.css']
})

export class ClienteTicketsComponent implements OnInit, OnDestroy  {
  private refreshInterval: any;
  
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;
  nuevoTicket = { asunto: '', descripcion: '', prioridad: 'media' };
  loading = true;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTickets();
    // Recargar automáticamente cada 5 segundos
    setInterval(() => {
        this.cargarTickets();
    }, 5000);
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
      }
    });
  }

  abrirModalNuevoTicket(): void {
    this.nuevoTicket = { asunto: '', descripcion: '', prioridad: 'media' };
    const modal = new bootstrap.Modal(document.getElementById('nuevoTicketModal'));
    modal.show();
  }

  crearTicket(): void {
    this.ticketService.crearTicket(this.nuevoTicket).subscribe({
      next: () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoTicketModal'));
        modal?.hide();
        this.cargarTickets();
      },
      error: (err) => {
        console.error('Error creando ticket:', err);
        alert('Error al crear el ticket');
      }
    });
  }

  verDetalle(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    const modal = new bootstrap.Modal(document.getElementById('detalleTicketModal'));
    modal.show();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}