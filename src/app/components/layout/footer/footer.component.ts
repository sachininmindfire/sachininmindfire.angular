import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/about">About</a></li>
            <li><a routerLink="/contact">Contact</a></li>
            <li><a href="https://github.com/sachininmindfire" target="_blank">GitHub</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Categories</h4>
          <ul>
            <li><a routerLink="/articles">Articles</a></li>
            <li><a routerLink="/tips">Tips</a></li>
            <li><a routerLink="/tools">Tools</a></li>
            <li><a routerLink="/terms">Terms</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Sachin's Technical Blog. All rights reserved.</p>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
