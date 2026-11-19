import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Impuro para reaccionar al cambio de idioma reactivo sin recargar
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string = '';
  private lastValue: string = '';
  private subscription?: Subscription;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.translationService.currentLang$.subscribe(() => {
      if (this.lastKey) {
        this.lastValue = this.translationService.translate(this.lastKey);
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string, defaultText: string = ''): string {
    if (!key) return '';

    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastValue = this.translationService.translate(key, defaultText);
    }

    return this.lastValue || this.translationService.translate(key, defaultText);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
