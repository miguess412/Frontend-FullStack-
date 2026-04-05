import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ClientesService, Cliente, ClienteFormData } from '../../../services/admin/clientes';

declare var bootstrap: any;

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  planes: any[] = [];
  modal: any;
  editando = false;
  modalTitulo = '';
  clienteFormData: ClienteFormData = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    direccion: '',
    ciudad: '',
    plan_id: 0
  };
  clienteIdEditando: number | null = null;

  constructor(
    private clientesService: ClientesService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarPlanes();
  }

  cargarClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  cargarPlanes(): void {
    // Por ahora datos de ejemplo
    this.planes = [
      { id: 1, nombre: 'Plan Básico', velocidad: '10 Mbps', precio: 29.99 },
      { id: 2, nombre: 'Plan Estándar', velocidad: '50 Mbps', precio: 49.99 },
      { id: 3, nombre: 'Plan Premium', velocidad: '100 Mbps', precio: 79.99 }
    ];
  }

  abrirModalNuevoCliente(): void {
    this.editando = false;
    this.modalTitulo = 'Nuevo Cliente';
    this.clienteFormData = {
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      direccion: '',
      ciudad: '',
      plan_id: 0,
      activo: true
    };
    this.clienteIdEditando = null;
    this.modal = new bootstrap.Modal(document.getElementById('clienteModal'));
    this.modal.show();
  }

  editarCliente(cliente: Cliente): void {
    console.log('Editando cliente:', cliente);
    this.editando = true;
    this.modalTitulo = 'Editar Cliente';
    this.clienteIdEditando = cliente.id;
    this.clienteFormData = {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      password: '',
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      plan_id: cliente.plan?.id || 0,
      activo: cliente.activo
    };
    this.modal = new bootstrap.Modal(document.getElementById('clienteModal'));
    this.modal.show();
  }

  guardarCliente(): void {
    if (this.editando && this.clienteIdEditando) {
      this.clientesService.actualizarCliente(this.clienteIdEditando, this.clienteFormData).subscribe({
        next: () => {
          this.modal.hide();
          this.cargarClientes();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.clientesService.crearCliente(this.clienteFormData).subscribe({
        next: () => {
          this.modal.hide();
          this.cargarClientes();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  eliminarCliente(id: number): void {
    console.log('Eliminando cliente ID:', id);
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientesService.eliminarCliente(id).subscribe({
        next: () => {
          this.cargarClientes();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }
}