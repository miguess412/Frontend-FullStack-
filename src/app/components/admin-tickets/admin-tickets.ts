import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-tickets.html',
  styleUrls: ['./admin-tickets.css']
})
export class AdminTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;
  mostrarModalDetalle = false;
  mostrarModalResponder = false;
  mostrarModalEstado = false;
  respuesta = '';
  nuevoEstado = '';

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando tickets:', err)
    });
  }

  verDetalle(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.ticketSeleccionado = null;
  }

  responder(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    this.respuesta = '';
    this.nuevoEstado = ticket.estado;
    this.mostrarModalResponder = true;
  }

  cerrarModalResponder(): void {
    this.mostrarModalResponder = false;
    this.ticketSeleccionado = null;
    this.respuesta = '';
  }

  enviarRespuesta(): void {
    if (this.ticketSeleccionado) {
        const data = {
            estado: this.nuevoEstado,
            respuesta: this.respuesta
        };
        console.log('Enviando al backend:', data);  // ← AGREGAR ESTO
        
        this.ticketService.actualizarTicket(this.ticketSeleccionado.id, data).subscribe({
            next: () => {
                this.cerrarModalResponder();
                this.cargarTickets();
                Swal.fire({
                    title: '¡Respuesta enviada!',
                    text: 'El cliente recibirá la respuesta a su ticket.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    timer: 3000
                });
            },
            error: (err) => {
                console.error('Error:', err);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo enviar la respuesta',
                    icon: 'error'
                });
            }
        });
    }
}
  cambiarEstado(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    this.nuevoEstado = ticket.estado;
    this.mostrarModalEstado = true;
  }

  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
    this.ticketSeleccionado = null;
  }

  actualizarEstado(): void {
    if (this.ticketSeleccionado) {
      this.ticketService.actualizarTicket(this.ticketSeleccionado.id, {
        estado: this.nuevoEstado
      }).subscribe({
        next: () => {
          this.cerrarModalEstado();
          this.cargarTickets();
        },
        error: (err) => console.error('Error:', err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}