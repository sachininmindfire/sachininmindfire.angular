import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentItem } from '../../../services/content.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="content-card">
      <h4 class="card-title">
        @if (content.link.startsWith('http')) {
          <a [href]="content.link" target="_blank">{{ content.title }}</a>
        } @else {
          <a [routerLink]="content.link">{{ content.title }}</a>
        }
      </h4>
      <p class="card-description">{{ content.description }}</p>
      <div class="card-meta">
        <span class="date">{{ content.date | date:'mediumDate' }}</span>
        <span class="type" [attr.data-type]="content.type">{{ content.type }}</span>
      </div>
    </div>
  `,
  styles: [`
    .content-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .content-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .card-title {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;

      a {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .card-description {
      margin: 0 0 1rem;
      color: var(--text-color);
      font-size: 0.9rem;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-muted);

      .type {
        text-transform: capitalize;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        background: var(--bg-accent);
      }
    }
  `]
})
export class ContentCardComponent {
  @Input({ required: true }) content!: ContentItem;
}
