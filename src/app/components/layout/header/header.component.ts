import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  template: `
    <header class="site-header">
      <nav class="main-nav">
        <div class="logo">
          <a routerLink="/" class="nav-link">Sachin's Tech Blog</a>
        </div>
        
        <button
          class="menu-toggle"
          (click)="toggleMenu()"
          [attr.aria-expanded]="isMenuOpen()"
          aria-label="Toggle navigation menu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <div class="nav-container" [class.open]="isMenuOpen()">
          <ul class="nav-links">
            <li><a routerLink="/articles" class="nav-link" (click)="closeMenu()">Articles</a></li>
            <li><a routerLink="/tips" class="nav-link" (click)="closeMenu()">Tips</a></li>
            <li><a routerLink="/tools" class="nav-link" (click)="closeMenu()">Tools</a></li>
            <li><a routerLink="/terms" class="nav-link" (click)="closeMenu()">Terms</a></li>
          </ul>
          <app-theme-toggle />
        </div>
      </nav>
    </header>
  `,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
