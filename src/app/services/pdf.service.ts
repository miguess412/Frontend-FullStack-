import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiUrl = `${environment.apiUrl}/reportes`;
  
  constructor(private http: HttpClient) { }

  async generarPDFClientes(clientes: any[], titulo: string): Promise<void> {
    try {
        const response = await lastValueFrom(
            this.http.post<{ success: boolean, message: string, filename: string, url: string }>(
                `${this.apiUrl}/clientes`,
                { clientes, titulo }
            )
        );

        if (response.success && response.url) {
            console.log('URL del PDF:', response.url);
            console.log('Filename:', response.filename);
            
            // Forzar la descarga (no pop-up)
            const link = document.createElement('a');
            link.href = response.url;
            link.download = response.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error('Error:', response.message);
            alert('Error al generar el PDF');
        }
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el PDF');
    }
}

async generarPDFFacturas(facturas: any[], titulo: string): Promise<void> {
    try {
        const response = await lastValueFrom(
            this.http.post<{ success: boolean, message: string, filename: string, url: string }>(
                `${this.apiUrl}/facturas`,
                { facturas, titulo }
            )
        );

        if (response.success && response.url) {
            console.log('URL del PDF:', response.url);
            
            // Forzar la descarga
            const link = document.createElement('a');
            link.href = response.url;
            link.download = response.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error('Error:', response.message);
            alert('Error al generar el PDF');
        }
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el PDF');
    }
}
}