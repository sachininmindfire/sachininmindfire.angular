import { Injectable, signal } from '@angular/core';

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  date: string;
  link: string;
  type: 'article' | 'tip' | 'tool' | 'term';
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private articles = signal<ContentItem[]>([
    {
      id: 1,
      title: 'Getting Started with Angular',
      description: 'Learn the basics of Angular framework',
      date: '2025-02-27',
      link: '/articles/getting-started-angular',
      type: 'article'
    }
  ]);

  private tips = signal<ContentItem[]>([
    {
      id: 1,
      title: 'VS Code Shortcuts',
      description: 'Essential shortcuts for productivity',
      date: '2025-02-26',
      link: '/tips/vscode-shortcuts',
      type: 'tip'
    }
  ]);

  private tools = signal<ContentItem[]>([
    {
      id: 1,
      title: 'SQL POCO Generator',
      description: 'Generate POCO classes from SQL Server tables',
      date: '2025-02-25',
      link: 'https://sachininmindfire.github.io/sql-poco-app/',
      type: 'tool'
    },
    {
      id: 2,
      title: 'Free JSON API',
      description: 'Access free JSON APIs for testing and prototyping',
      date: '2025-03-01',
      link: 'https://sachininmindfire.github.io/free-api/',
      type: 'tool'
    },
    {
      id: 3,
      title: 'SQL to ER-Diagram',
      description: 'Convert SQL queries to Entity Relationship Diagrams',
      date: '2025-03-01',
      link: 'https://sachininmindfire.github.io/sql-diagrams/',
      type: 'tool'
    },
    {
      id: 4,
      title: 'Text Diff',
      description: 'Compare and analyze text differences visually',
      date: '2025-03-02',
      link: 'https://sachininmindfire.github.io/text-diff/',
      type: 'tool'
    }
  ]);

  private terms = signal<ContentItem[]>([
    {
      id: 1,
      title: 'Angular SSR',
      description: 'Server-Side Rendering in Angular',
      date: '2025-02-24',
      link: '/terms/angular-ssr',
      type: 'term'
    }
  ]);

  getLatestArticles = this.articles;
  getLatestTips = this.tips;
  getLatestTools = this.tools;
  getLatestTerms = this.terms;
}
