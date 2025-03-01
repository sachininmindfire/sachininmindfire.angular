import { Component, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';
import { ContentCardComponent } from '../../shared/content-card/content-card.component';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [ContentCardComponent],
  template: `
    <section class="tools-page">
      <h1>Developer Tools</h1>
      <p class="tools-intro">
        A collection of free tools to help streamline your development workflow.
      </p>
      <div class="tools-grid">
        @for (tool of tools(); track tool.id) {
          <app-content-card [content]="tool"></app-content-card>
        }
      </div>
    </section>
  `,
  styles: [`
    .tools-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1rem;
      color: var(--text-color);
      font-size: 2rem;
    }

    .tools-intro {
      margin-bottom: 2rem;
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  `]
})
export class ToolsComponent {
  private contentService = inject(ContentService);
  tools = this.contentService.getLatestTools;
}
