import { Component, effect } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Switch to ' + (isDark ? 'light' : 'dark') + ' theme'">
      <i class="fas" [class.fa-moon]="!isDark" [class.fa-sun]="isDark"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: inherit;
      font-size: 1.2rem;
      transition: transform 0.2s ease;
    }

    .theme-toggle:hover {
      transform: scale(1.1);
    }

    .theme-toggle:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--primary-color);
      border-radius: 4px;
    }
  `]
})
export class ThemeToggleComponent {
  isDark = false;

  constructor(private themeService: ThemeService) {
    effect(() => {
      this.isDark = this.themeService.getCurrentTheme()() === 'dark';
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
