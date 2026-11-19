import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="btn-group btn-group-sm language-selector shadow-sm" role="group" aria-label="Language selector">
      <button 
        type="button" 
        class="btn py-1 px-2 fw-semibold"
        [ngClass]="currentLang === 'es' ? 'btn-primary' : 'btn-outline-secondary text-white'"
        (click)="selectLanguage('es')"
        title="Español">
        <span>🇪🇸</span> ES
      </button>
      <button 
        type="button" 
        class="btn py-1 px-2 fw-semibold"
        [ngClass]="currentLang === 'en' ? 'btn-primary' : 'btn-outline-secondary text-white'"
        (click)="selectLanguage('en')"
        title="English">
        <span>🇺🇸</span> EN
      </button>
    </div>
  `,
  styles: [`
    .language-selector {
      border-radius: 20px;
      overflow: hidden;
    }
    .language-selector .btn {
      font-size: 0.75rem;
      border-radius: 0;
      transition: all 0.2s ease-in-out;
    }
  `]
})
export class LanguageSelectorComponent {
  constructor(public translationService: TranslationService) {}

  get currentLang(): SupportedLanguage {
    return this.translationService.currentLanguage;
  }

  selectLanguage(lang: SupportedLanguage): void {
    this.translationService.setLanguage(lang);
  }
}
