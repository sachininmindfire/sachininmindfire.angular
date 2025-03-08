import { Component } from '@angular/core';

@Component({
  selector: 'app-bio',
  standalone: true,
  template: `
    <div class="bio-container">
      <h1>Welcome to My Technical Blog</h1>
      <p>
        I'm Sachin, a software developer and architect passionate about creating efficient solutions
        and sharing knowledge.
      </p>
      <div class="expertise-areas">
        <h3>Areas of Expertise</h3>
        <ul class="expertise-list">
          <li>
            <i class="fas fa-code"></i>
            <span>Full Stack Development</span>
          </li>
          <li>
            <i class="fas fa-database"></i>
            <span>Database Design & Optimization</span>
          </li>
          <li>
            <i class="fas fa-cloud"></i>
            <span>Cloud Architecture</span>
          </li>
          <li>
            <i class="fas fa-tools"></i>
            <span>Developer Tools</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .bio-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    p {
      color: var(--text-color);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .expertise-areas {
      margin-top: 2rem;

      h3 {
        color: var(--text-color);
        margin-bottom: 1.5rem;
      }
    }

    .expertise-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-color);
        
        i {
          color: var(--primary-color);
          font-size: 1.2rem;
        }

        span {
          font-size: 1rem;
        }
      }
    }
  `]
})
export class BioComponent {}
