import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-pago-retorno',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-retorno.html',
  styleUrls: ['./pago-retorno.css']
})
export class PagoRetornoComponent implements OnInit {
  status: 'procesando' | 'exitoso' | 'cancelado' | 'error' = 'procesando';
  mensaje = 'Procesando tu pago...';

  constructor(
    private route: ActivatedRoute,
    private pagoService: PagoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('token');
    const payerId = this.route.snapshot.queryParamMap.get('PayerID');
    
    console.log('=== PAGO RETORNO ===');
    console.log('OrderId:', orderId);
    console.log('PayerID:', payerId);
    
    if (orderId && payerId) {
      this.capturarPago(orderId);
    } else {
      this.status = 'cancelado';
      this.mensaje = 'El pago fue cancelado';
      this.cdr.detectChanges();
    }
  }

  capturarPago(orderId: string): void {
    console.log('Capturando pago para orderId:', orderId);
    
    this.pagoService.capturarPago(orderId).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        
        // FORZAR ACTUALIZACIÓN DE LA VISTA
        if (response && response.success === true) {
          this.status = 'exitoso';
          this.mensaje = response.message || '¡Pago realizado exitosamente!';
        } else {
          this.status = 'error';
          this.mensaje = response?.message || 'Error al procesar el pago';
        }
        this.cdr.detectChanges();  // ←  Forzar actualización
        console.log('Estado actualizado a:', this.status);
      },
      error: (err) => {
        console.error('Error:', err);
        this.status = 'error';
        this.mensaje = err.error?.message || 'Error al confirmar el pago';
        this.cdr.detectChanges();  // ←  Forzar actualización
      }
    });
  }
}