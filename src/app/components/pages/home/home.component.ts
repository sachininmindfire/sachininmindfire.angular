import { Component, computed, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';
import { FeaturedToolComponent } from '../../shared/featured-tool/featured-tool.component';
import { BioComponent } from "../../shared/bio/bio.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FeaturedToolComponent, BioComponent],
  template: `    
    <div class="hero-container">
      <section class="hero">
        <app-bio />
      </section>
      <div class="profile-image">
        <img
          src="/assets/images/profile.jpg"
          alt="Profile Picture"
          (error)="handleImageError($event)"
        />
      </div>
    </div>
    <div class="container">
    <section class="home">
      <h2>Featured Tools</h2>
      <div class="tools-grid">
        @for (tool of tools(); track tool.id) {
          <app-featured-tool [tool]="tool"></app-featured-tool>
        }
      </div>
    </section>
      <h2>Recent Publications</h2>
      
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>Recent Articles</h3>
            </div>
            <div class="list-group list-group-flush">
              <!-- @for (article of articles; track article.title) {
                <a href="#" class="list-group-item list-group-item-action">
                  {{ article.title }}
                  <small class="text-muted d-block">{{ article.publishDate }}</small>
                </a>
              } -->
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>Recent Tips</h3>
            </div>
            <div class="list-group list-group-flush">
              <!-- @for (tip of tips; track tip.title) {
                <a href="#" class="list-group-item list-group-item-action">
                  {{ tip.title }}
                  <small class="text-muted d-block">{{ tip.publishDate }}</small>
                </a>
              } -->
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>Recent Terms</h3>
            </div>
            <div class="list-group list-group-flush">
              <!-- @for (term of terms; track term.term) {
                <a href="#" class="list-group-item list-group-item-action">
                  {{ term.term }}
                  <small class="text-muted d-block">{{ term.category }}</small>
                </a>
              } -->
            </div>
          </div>
        </div>
      </div>
    </div>

   
  `,
  styles: [`
    
    .hero-container {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .hero {
      flex: 1;
    }

    .profile-image {
      flex: 0 0 320px;
      margin: 2rem 0 0 -1rem;
      max-width: 100%;
    }

    .profile-image img {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .profile-image img {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .hero-container {
        flex-direction: column-reverse;
      }
      
      .profile-image {
        margin: 0 auto;
        max-width: 200px;
      }
    }

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
    .card { 
      margin-bottom: 20px; 
    }

    .card-header h3 { 
      font-size: 1.2rem; 
      margin: 0; 
    }

        
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card-header {
      background-color: #fff;
      border-bottom: 2px solid #f0f0f0;
    }

    .list-group-item {
      border: none;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
    }

    .badge {
      font-weight: 500;
      padding: 6px 12px;
    }



  `]
})
export class HomeComponent {
  private contentService = inject(ContentService);
  tools = this.contentService.getLatestTools;
  articles = []; // Add your articles data here
  tips = []; // Add your tips data here
  terms = []; // Add your terms data here

  handleImageError(event: any) {
    event.target.src = '../assets/images/default-profile.png';
    console.error('Failed to load profile image');
  }
}

