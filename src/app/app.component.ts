import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- <app-header /> -->    
    <main class="main-content">
      <router-outlet />
    </main>
    <!-- <app-footer /> -->
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Sachin\'s Technical Blog';
}