import { Component } from '@angular/core';
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
        <ul class="nav-links">
          <li><a routerLink="/articles" class="nav-link">Articles</a></li>
          <li><a routerLink="/tips" class="nav-link">Tips</a></li>
          <li><a routerLink="/tools" class="nav-link">Tools</a></li>
          <li><a routerLink="/terms" class="nav-link">Terms</a></li>
        </ul>
        <app-theme-toggle />
      </nav>
    </header>
  `,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {}
