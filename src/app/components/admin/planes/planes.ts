import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PlanService, Plan } from '../../../services/plan.service';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planes.html',
  styleUrls: ['./planes.css']
})
export class PlanesComponent implements OnInit {
  planes: Plan[] = [];
  editando = false;
  modalTitulo = '';
  mostrarModal = false;
  planFormData: Partial<Plan> = {
    nombre: '',
    velocidad: '',
    precio: 0,
    descripcion: '',
    activo: true
  };
  planIdEditando: number | null = null;

  constructor(
    private authService: AuthService,
    private planService: PlanService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.planService.getPlanes().subscribe({
      next: (data) => {
        this.planes = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando planes:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  abrirModalNuevoPlan(): void {
    this.editando = false;
    this.modalTitulo = 'Nuevo Plan';
    this.planFormData = {
      nombre: '',
      velocidad: '',
      precio: 0,
      descripcion: '',
      activo: true
    };
    this.planIdEditando = null;
    this.mostrarModal = true;
  }

  editarPlan(plan: Plan): void {
    this.editando = true;
    this.modalTitulo = 'Editar Plan';
    this.planIdEditando = plan.id;
    this.planFormData = {
      nombre: plan.nombre,
      velocidad: plan.velocidad,
      precio: plan.precio,
      descripcion: plan.descripcion,
      activo: plan.activo
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarPlan(): void {
    if (this.editando && this.planIdEditando) {
      this.planService.actualizarPlan(this.planIdEditando, this.planFormData).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarPlanes();
        },
        error: (err) => console.error('Error actualizando plan:', err)
      });
    } else {
      this.planService.crearPlan(this.planFormData).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarPlanes();
        },
        error: (err) => console.error('Error creando plan:', err)
      });
    }
  }

  eliminarPlan(id: number): void {
    if (confirm('¿Estás seguro de desactivar este plan?')) {
      this.planService.eliminarPlan(id).subscribe({
        next: () => {
          this.cargarPlanes();
        },
        error: (err) => console.error('Error eliminando plan:', err)
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