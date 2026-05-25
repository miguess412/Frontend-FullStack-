import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cliente-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cliente-perfil.html',
  styleUrls: ['./cliente-perfil.css']
})
export class ClientePerfilComponent implements OnInit {
  perfil = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: ''
  };
  loading = true;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';
  error = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading = true;
    this.error = false;
    
    // Obtener datos del usuario actual
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.perfil.nombre = currentUser.nombre || '';
      this.perfil.email = currentUser.email || '';
      this.perfil.telefono = currentUser.telefono || '';
      
      // Cargar datos adicionales del perfil (dirección, ciudad)
      this.http.get(`${environment.apiUrl}/cliente/perfil`, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }).subscribe({
        next: (response: any) => {
          if (response.direccion) this.perfil.direccion = response.direccion;
          if (response.ciudad) this.perfil.ciudad = response.ciudad;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.loading = false;
          this.error = true;
        }
      });
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  guardarCambios(): void {
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    
    this.http.put(`${environment.apiUrl}/cliente/perfil`, 
      {
        nombre: this.perfil.nombre,
        telefono: this.perfil.telefono,
        direccion: this.perfil.direccion,
        ciudad: this.perfil.ciudad
      },
      {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }
    ).subscribe({
      next: (response: any) => {
        this.guardando = false;
        this.mensajeExito = '¡Perfil actualizado correctamente!';
        
        // Actualizar el usuario en localStorage
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.nombre = this.perfil.nombre;
          currentUser.telefono = this.perfil.telefono;
          localStorage.setItem('current_user', JSON.stringify(currentUser));
        }
        
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = err.error?.message || 'Error al actualizar el perfil';
        console.error('Error actualizando perfil:', err);
        
        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}