import { Component } from '@angular/core';
import { BioComponent } from '../../shared/bio/bio.component';
import { FeaturedToolComponent } from '../../shared/featured-tool/featured-tool.component';
import { ContentCardComponent } from '../../shared/content-card/content-card.component';
import { ContentService } from '../../../services/content.service';
import { Signal } from '@angular/core';
import { ContentItem } from '../../../services/content.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BioComponent, FeaturedToolComponent, ContentCardComponent],
  template: `
    <section class="hero">
      <app-bio />
      <app-featured-tool />
    </section>

    <section class="latest-content">
      <h2>Latest Content</h2>
      <div class="content-grid">
        <div class="content-section">
          <h3>Recent Articles</h3>
          <div class="content-cards">
            @for (article of articles(); track article.id) {
              <app-content-card [content]="article" />
            }
          </div>
        </div>

        <div class="content-section">
          <h3>Latest Tips</h3>
          <div class="content-cards">
            @for (tip of tips(); track tip.id) {
              <app-content-card [content]="tip" />
            }
          </div>
        </div>

        <div class="content-section">
          <h3>New Tools</h3>
          <div class="content-cards">
            @for (tool of tools(); track tool.id) {
              <app-content-card [content]="tool" />
            }
          </div>
        </div>

        <div class="content-section">
          <h3>Recent Terms</h3>
          <div class="content-cards">
            @for (term of terms(); track term.id) {
              <app-content-card [content]="term" />
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  articles: Signal<ContentItem[]>;
  tips: Signal<ContentItem[]>;
  tools: Signal<ContentItem[]>;
  terms: Signal<ContentItem[]>;

  constructor(private contentService: ContentService) {
    this.articles = this.contentService.getLatestArticles;
    this.tips = this.contentService.getLatestTips;
    this.tools = this.contentService.getLatestTools;
    this.terms = this.contentService.getLatestTerms;
  }
}
