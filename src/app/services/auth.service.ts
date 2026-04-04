import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol_id?: number;
  rol?: string;
  telefono?: string;
  activo?: boolean;
  created_at?: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  
  private currentUserSubject: BehaviorSubject<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  public get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  private loadUserFromStorage(): void {
    if (this.isBrowser) {
      const userJson = localStorage.getItem(this.userKey);
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          this.currentUserSubject.next(user);
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Enviando login para:', credentials.email);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login exitoso, token recibido');
          
          if (this.isBrowser) {
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.user));
            console.log('Token guardado en localStorage');
          }
          
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    console.log('Cerrando sesión...');
    
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      console.log('Token eliminado del localStorage');
    }
    
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      const token = localStorage.getItem(this.tokenKey);
      console.log('getToken() - Token existe?', !!token);
      return token;
    }
    console.log('getToken() - No es navegador');
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}