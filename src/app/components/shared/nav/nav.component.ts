import { Component, Input } from '@angular/core';

interface MenuItem {
  text: string;
  link: string;
}

@Component({
  selector: 'app-nav',
  template: `
    <nav>
      <ul>
        <li *ngFor="let item of tools">
          <a [href]="item.link">{{ item.text }}</a>
        </li>
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
      link: 'https://sachininmindfire.github.io/sql-poco-app/'
    },
    {
      text: 'Free JSON API',
      link: 'https://sachininmindfire.github.io/free-api/'
    },
    {
      text: 'SQL to ER-Diagram',
      link: 'https://sachininmindfire.github.io/sql-diagrams/'
    },
    {
      text: 'Text Diff',
      link: 'https://sachininmindfire.github.io/text-diff/'
    },
    {
      text: 'MD to PDF Converter',
      link: 'https://sachininmindfire.github.io/md-pdf-convertor/'
    },
    {
      text: 'JSON Formatter',
      link: 'https://sachininmindfire.github.io/json-formatter/'
    }
  ];
}