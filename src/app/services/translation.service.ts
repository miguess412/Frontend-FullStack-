import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<SupportedLanguage>('es');
  public currentLang$: Observable<SupportedLanguage> = this.currentLangSubject.asObservable();

  private translations: Record<string, any> = {};

  // Diccionario base precargado en memoria para evitar parpadeos visuales al cargar
  private defaultTranslations: Record<SupportedLanguage, Record<string, any>> = {
    es: {
      COMMON: {
        APP_NAME: 'ISP-Manager',
        SEARCH: 'Buscar...',
        LOADING: 'Cargando...',
        ACTIONS: 'Acciones',
        STATUS: 'Estado',
        LOGOUT: 'Cerrar Sesión',
        ADMIN: 'Administrador',
        CLIENT: 'Cliente'
      },
      SIDEBAR: {
        DASHBOARD: 'Dashboard',
        CLIENTS: 'Clientes',
        PLANS: 'Planes',
        TICKETS: 'Tickets',
        BACKUPS: 'Backups',
        REPORTS: 'Reportes',
        CLIENTS_PDF: 'Clientes PDF',
        INVOICES_PDF: 'Facturas PDF'
      },
      ADMIN_DASHBOARD: {
        TITLE: 'Dashboard',
        TOTAL_CLIENTS: 'Clientes',
        PAID_INVOICES: 'Facturas Pagadas',
        PENDING_INVOICES: 'Pendientes',
        ACTIVE_TICKETS: 'Tickets',
        ADVANCED_STATS: 'Estadísticas Avanzadas',
        INVOICE_EVOLUTION: 'Evolución de Facturas',
        POPULAR_PLANS: 'Planes Populares',
        PAID: 'Pagadas',
        PENDING: 'Pendientes'
      },
      CLIENT_DASHBOARD: {
        TITLE: 'Portal del Cliente',
        MY_PLAN: 'Mi Plan Actual',
        CHANGE_PLAN: 'Cambiar de Plan',
        INTERNET_USAGE: 'Consumo de Internet',
        NEXT_PAYMENT: 'Próximo Pago',
        PAY_SIMULATED: 'Pagar (Simulado)',
        PAY_WITH_PAYPAL: 'Pagar con PayPal',
        SUPPORT_AND_TICKETS: 'Soporte y Tickets',
        INVOICE_HISTORY: 'Historial de Facturas'
      },
      BACKUPS: {
        TITLE: 'Copias de Seguridad (Backups)',
        CREATE_BUTTON: 'Crear Nueva Copia (.SQL)',
        HISTORY: 'Historial de Copias de Seguridad'
      }
    },
    en: {
      COMMON: {
        APP_NAME: 'ISP-Manager',
        SEARCH: 'Search...',
        LOADING: 'Loading...',
        ACTIONS: 'Actions',
        STATUS: 'Status',
        LOGOUT: 'Log Out',
        ADMIN: 'Administrator',
        CLIENT: 'Client'
      },
      SIDEBAR: {
        DASHBOARD: 'Dashboard',
        CLIENTS: 'Clients',
        PLANS: 'Plans',
        TICKETS: 'Tickets',
        BACKUPS: 'Backups',
        REPORTS: 'Reports',
        CLIENTS_PDF: 'Clients PDF',
        INVOICES_PDF: 'Invoices PDF'
      },
      ADMIN_DASHBOARD: {
        TITLE: 'Dashboard',
        TOTAL_CLIENTS: 'Clients',
        PAID_INVOICES: 'Paid Invoices',
        PENDING_INVOICES: 'Pending',
        ACTIVE_TICKETS: 'Tickets',
        ADVANCED_STATS: 'Advanced Statistics',
        INVOICE_EVOLUTION: 'Invoice Evolution',
        POPULAR_PLANS: 'Popular Plans',
        PAID: 'Paid',
        PENDING: 'Pending'
      },
      CLIENT_DASHBOARD: {
        TITLE: 'Customer Portal',
        MY_PLAN: 'My Current Plan',
        CHANGE_PLAN: 'Change Plan',
        INTERNET_USAGE: 'Internet Usage',
        NEXT_PAYMENT: 'Next Payment',
        PAY_SIMULATED: 'Pay (Simulated)',
        PAY_WITH_PAYPAL: 'Pay with PayPal',
        SUPPORT_AND_TICKETS: 'Support & Tickets',
        INVOICE_HISTORY: 'Invoice History'
      },
      BACKUPS: {
        TITLE: 'Database Backups',
        CREATE_BUTTON: 'Create New Backup (.SQL)',
        HISTORY: 'Backup History'
      }
    }
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialLang: SupportedLanguage = 'es';

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('isp_lang') as SupportedLanguage;
      if (saved === 'es' || saved === 'en') {
        initialLang = saved;
      } else {
        const browserLang = navigator.language?.substring(0, 2);
        initialLang = browserLang === 'en' ? 'en' : 'es';
      }
    }

    this.translations = this.defaultTranslations[initialLang];
    this.setLanguage(initialLang);
  }

  public get currentLanguage(): SupportedLanguage {
    return this.currentLangSubject.value;
  }

  public setLanguage(lang: SupportedLanguage): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isp_lang', lang);
    }

    // Cargar archivo JSON desde /i18n/{lang}.json
    this.http.get<Record<string, any>>(`/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations = { ...this.defaultTranslations[lang], ...data };
        this.currentLangSubject.next(lang);
      },
      error: () => {
        // En caso de que no cargue por red, usar diccionario precargado
        this.translations = this.defaultTranslations[lang] || this.defaultTranslations.es;
        this.currentLangSubject.next(lang);
      }
    });
  }

  public toggleLanguage(): void {
    const nextLang: SupportedLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    this.setLanguage(nextLang);
  }

  public translate(key: string, defaultVal: string = ''): string {
    if (!key) return '';

    const parts = key.split('.');
    let current: any = this.translations;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback a los diccionarios por defecto si la clave no está en el JSON cargado
        const fallback = this.defaultTranslations[this.currentLanguage];
        let fbVal: any = fallback;
        for (const fbPart of parts) {
          if (fbVal && typeof fbVal === 'object' && fbPart in fbVal) {
            fbVal = fbVal[fbPart];
          } else {
            fbVal = null;
            break;
          }
        }
        return fbVal || defaultVal || key;
      }
    }

    return typeof current === 'string' ? current : defaultVal || key;
  }
}
