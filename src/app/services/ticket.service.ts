import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Ticket {
  id: number;
  asunto: string;
  descripcion: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta';
  cliente?: string;
  cliente_email?: string;
  respuesta?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) { }

  // Cliente: obtener mis tickets
  getMisTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/mis-tickets`);
  }

  // Cliente: crear ticket
  crearTicket(ticket: { asunto: string; descripcion: string; prioridad: string }): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/crear`, ticket);
  }

  // Admin: obtener todos los tickets
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/todos`);
  }

  // Admin: actualizar ticket
  actualizarTicket(id: number, data: { estado?: string; respuesta?: string }): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, data);
  }
}