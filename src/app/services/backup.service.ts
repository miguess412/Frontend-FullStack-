import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BackupItem {
  nombre: string;
  tamanoBytes: number;
  tamano: string;
  fecha: string | Date;
}

export interface BackupResponse {
  success: boolean;
  message: string;
  backup: {
    nombre: string;
    tamanoBytes: number;
    tamano: string;
    fecha: string | Date;
    tablas: number;
    totalRegistros: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private apiUrl = `${environment.apiUrl}/admin/backups`;

  constructor(private http: HttpClient) {}

  getBackups(): Observable<BackupItem[]> {
    return this.http.get<BackupItem[]>(this.apiUrl);
  }

  crearBackup(): Observable<BackupResponse> {
    return this.http.post<BackupResponse>(`${this.apiUrl}/crear`, {});
  }

  descargarBackup(nombre: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/descargar/${nombre}`, {
      responseType: 'blob'
    });
  }

  eliminarBackup(nombre: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${nombre}`);
  }
}
