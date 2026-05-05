import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
     private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
        next: (response) => {
            this.loading = false;
            if (response.user.rol === 'admin') {
                this.router.navigate(['/admin/dashboard']);
            } else {
                this.router.navigate(['/cliente/dashboard']);
            }
        },
        error: (error) => {
            this.loading = false;
            console.error('Error de login:', error);
            
            // Mostrar mensaje según el código de error
            if (error.status === 401) {
                this.errorMessage = 'Credenciales incorrectas';
            } else if (error.status === 404) {
                this.errorMessage = 'Servidor no disponible';
            } else if (error.status === 0) {
                this.errorMessage = 'Error de conexión con el servidor';
            } else {
                this.errorMessage = error.error?.message || 'Error al iniciar sesión';
            }
            
            // Forzar actualización de la vista
            this.cdr.detectChanges();
        }
    });
  }
}   