import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
    <!-- <app-footer /> -->
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Tools and Techniques Blog';
}
