import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BackupService, BackupItem } from '../../../services/backup.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../../language-selector/language-selector';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LanguageSelectorComponent],
  templateUrl: './backups.html',
  styleUrls: ['./backups.css']
})
export class BackupsComponent implements OnInit {
  backups: BackupItem[] = [];
  cargando = false;
  generando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private backupService: BackupService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.cargarBackups();
    this.translationService.currentLang$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  cargarBackups(): void {
    this.cargando = true;
    this.backupService.getBackups().subscribe({
      next: (data) => {
        this.backups = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando backups:', err);
        this.cargando = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        this.cdr.detectChanges();
      }
    });
  }

  generarBackup(): void {
    this.generando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges();

    this.backupService.crearBackup().subscribe({
      next: (res) => {
        this.generando = false;
        this.mensajeExito = `✅ ${res.message}: ${res.backup.nombre} (${res.backup.totalRegistros} registros en ${res.backup.tablas} tablas).`;
        this.cargarBackups();
        setTimeout(() => {
          this.mensajeExito = '';
          this.cdr.detectChanges();
        }, 6000);
      },
      error: (err) => {
        this.generando = false;
        console.error('Error generando backup:', err);
        this.mensajeError = err.error?.message || 'Error al generar la copia de seguridad';
        this.cdr.detectChanges();
      }
    });
  }

  descargar(item: BackupItem): void {
    this.backupService.descargarBackup(item.nombre).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando backup:', err);
        alert('Error al descargar el archivo de copia de seguridad');
      }
    });
  }

  eliminar(item: BackupItem): void {
    if (confirm(`¿Estás seguro de eliminar el archivo de respaldo "${item.nombre}"?`)) {
      this.backupService.eliminarBackup(item.nombre).subscribe({
        next: () => {
          this.backups = this.backups.filter(b => b.nombre !== item.nombre);
          this.mensajeExito = `Copia de seguridad eliminada exitosamente.`;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.mensajeExito = '';
            this.cdr.detectChanges();
          }, 4000);
        },
        error: (err) => {
          console.error('Error eliminando backup:', err);
          alert('Error al eliminar la copia de seguridad');
        }
      });
    }
  }

  formatDate(dateStr: string | Date): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const isEn = this.translationService.currentLanguage === 'en';
    return date.toLocaleString(isEn ? 'en-US' : 'es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
