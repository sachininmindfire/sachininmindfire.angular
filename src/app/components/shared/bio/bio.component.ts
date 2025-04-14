import { Component } from '@angular/core';

@Component({
  selector: 'app-bio',
  standalone: true,
  template: `
    <div class="bio-container">
      <div class="bio-content">
        <div class="bio-text">
          <h1>Welcome to My Technical Blog</h1>
          <p>
            This blog intent is to help software developers and architects passionate about creating efficient software solutions. There are common tools sometimes looks easy but difficult to find. 
            This blog is a collection of those tools and tips. I am a software engineer with over 10 years of experience in the industry, specializing in full-stack development, database design, and cloud architecture. I have a passion for building scalable applications and optimizing performance. I believe in the power of collaboration and continuous learning, and I am always eager to connect with fellow developers to exchange ideas
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
      </div>
    </div>
  `,
  styles: [`
    .bio-container {
      max-width: 800px;
      margin: 0rem auto;
      padding: .5rem;
      text-align: center;
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      margin-top: 0rem;
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

    .bio-content {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
      text-align: left;
    }

    .bio-text {
      flex: 1;
      text-align: left;
    }

    @media (max-width: 768px) {
      .bio-content {
        flex-direction: column-reverse;
      }
      
      .bio-text {
        text-align: center;
      }
    }
  `]
})
export class BioComponent {
  handleImageError(event: any) {
    event.target.src = '../assets/images/default-profile.png';
    console.error('Failed to load profile image');
  }
}
