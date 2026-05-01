import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pago-cancelado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-cancelado.html',
  styleUrls: ['./pago-cancelado.css']
})
export class PagoCanceladoComponent {
  constructor() { }
}