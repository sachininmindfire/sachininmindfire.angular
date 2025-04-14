import { Component, Input } from '@angular/core';

interface MenuItem {
  text: string;
  link: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  template: `
    <nav>
      <ul>
        @for (item of tools; track item.link) {
          <li>
            <a [href]="item.link">{{ item.text }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    nav {
      background-color: #333;
      color: #fff;
      padding: 1rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
    }

    li {
      margin-right: 1rem;
    }

    a {
      color: #fff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class NavComponent {
  @Input() tools: MenuItem[] = [
    {
      text: 'SQL POCO Generator',
      link: '/sql-poco-app/'
    },
    {
      text: 'Free JSON API',
      link: '/free-api/'
    },
    {
      text: 'SQL to ER-Diagram',
      link: '/sql-diagrams/'
    },
    {
      text: 'Text Diff',
      link: '/text-diff/'
    },
    {
      text: 'MD to PDF Converter',
      link: '/md-pdf-convertor/'
    },
    {
      text: 'JSON Formatter',
      link: '/json-formatter/'
    }
  ];
}