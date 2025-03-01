import { Component } from '@angular/core';

@Component({
  selector: 'app-featured-tool',
  standalone: true,
  template: `
    <div class="featured-tool">
      <h3>Featured Tool</h3>
      <a 
        href="https://sachininmindfire.github.io/sql-poco-app/" 
        class="tool-link" 
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fas fa-tools"></i>
        <span>SQL POCO Generator</span>
      </a>
      <p>Generate POCO classes from SQL Server tables with ease!</p>
      <div class="tool-features">
        <ul>
          <li>
            <i class="fas fa-check"></i>
            <span>Instant POCO class generation</span>
          </li>
          <li>
            <i class="fas fa-check"></i>
            <span>SQL Server integration</span>
          </li>
          <li>
            <i class="fas fa-check"></i>
            <span>Customizable output</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .featured-tool {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 2rem;
      margin-top: 2rem;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h3 {
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .tool-link {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      i {
        font-size: 1.2rem;
      }

      span {
        font-size: 1.1rem;
        font-weight: 500;
      }
    }

    p {
      color: var(--text-color);
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .tool-features {
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;

        li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-color);

          i {
            color: var(--success-color, #28a745);
          }
        }
      }
    }
  `]
})
export class FeaturedToolComponent {}
