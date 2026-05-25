import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Plan {
  id: number;
  nombre: string;
  velocidad: string;
  precio: number;
  descripcion: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = `${environment.apiUrl}/planes`;

  constructor(private http: HttpClient) { }

  getPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }

  getPlan(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  crearPlan(plan: Partial<Plan>): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, plan);
  }

  actualizarPlan(id: number, plan: Partial<Plan>): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, plan);
  }

  eliminarPlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}