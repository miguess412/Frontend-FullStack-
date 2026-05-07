import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pago`;

  constructor(private http: HttpClient) { }

  crearOrden(facturaId: number): Observable<any> {
    const body = { facturaId };
    console.log('Creando orden - Body:', body);
    return this.http.post(`${this.apiUrl}/crear-orden`, body);
  }

  capturarPago(orderId: string): Observable<any> {
    const body = { orderId };
    console.log('Capturando pago - Body:', body);
    console.log('URL:', `${this.apiUrl}/capturar-pago`);
    return this.http.post(`${this.apiUrl}/capturar-pago`, body);
  }
}