import { Component, computed, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';
import { FeaturedToolComponent } from '../../shared/featured-tool/featured-tool.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FeaturedToolComponent],
  template: `
    <section class="home">
      <h2>Featured Tools</h2>
      <div class="tools-grid">
        @for (tool of tools(); track tool.id) {
          <app-featured-tool [tool]="tool"></app-featured-tool>
        }
      </div>
    </section>
  `,
  styles: [`
    .home {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      margin-bottom: 2rem;
      color: var(--text-color);
      font-size: 1.5rem;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  `]
})
export class HomeComponent {
  private contentService = inject(ContentService);
  tools = this.contentService.getLatestTools;
}
