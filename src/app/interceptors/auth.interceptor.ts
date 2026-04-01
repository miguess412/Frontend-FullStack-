import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('=== INTERCEPTOR EJECUTÁNDOSE ===');
    console.log('URL de la petición:', req.url);
    
    const token = this.authService.getToken();
    console.log('Token obtenido del servicio:', token ? token.substring(0, 30) + '...' : 'NO HAY TOKEN');
    
    let authReq = req;
    if (token) {
      console.log('✅ AGREGANDO TOKEN a la petición');
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('Headers después de clonar:', authReq.headers.keys());
    } else {
      console.log('❌ NO HAY TOKEN, petición sin autenticación');
    }

    return next.handle(authReq).pipe(
      tap(() => console.log('✅ Petición enviada a:', authReq.url)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error en petición:', error.status, error.statusText);
        if (error.status === 401) {
          console.log('Error 401: Token inválido o expirado');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}