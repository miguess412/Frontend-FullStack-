import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';
// IMPORTA LOS MÓDULOS NECESARIOS
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  // AGREGA LOS MÓDULOS AL ARRAY DE IMPORTS
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  // CORRIGE LA RUTA DEL CSS (QUITA '.component')
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // ... (el resto del código de tu componente se queda igual)
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Login exitoso:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error de login:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 404) {
          this.errorMessage = 'Servidor no disponible';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión con el servidor';
        } else {
          this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        }
      }
    });
  }
}