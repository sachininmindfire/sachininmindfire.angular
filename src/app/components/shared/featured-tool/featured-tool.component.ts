import { Component, Input } from '@angular/core';
import { ContentItem } from '../../../services/content.service';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-featured-tool',
  standalone: true,
  imports: [ContentCardComponent],
  template: `
    <div class="featured-tool">
      <!-- <h3>Featured Tool</h3> -->
      <app-content-card [content]="tool"></app-content-card>
    </div>
  `,
  styles: [`
    .featured-tool {
      margin: 1rem 0;
    }
    
    h3 {
      margin-bottom: 1rem;
      color: var(--text-color);
      font-size: 1.2rem;
    }
  `]
})
export class FeaturedToolComponent {
  @Input({ required: true }) tool!: ContentItem;
}
