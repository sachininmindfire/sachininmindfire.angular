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
      description: 'Free online tool to convert SQL scripts to POCO classes Or T4 Template classes. Supports multiple programming languages including C#, Java, TypeScript and more.',
      date: '2025-02-25',
      link: '/sql-poco-app/',
      type: 'tool'
    },
    {
      id: 2,
      title: 'Free JSON API',
      description: 'Access free JSON APIs for testing and prototyping. Online tool to generate sample JSON API responses for testing and development. Explore different API categories and customize response formats.',
      date: '2025-03-01',
      link: '/free-api/',
      type: 'tool'
    },
    {
      id: 3,
      title: 'SQL to ER-Diagram',
      description: 'Convert SQL queries to Entity Relationship Diagrams. Generate database ER diagrams from SQL scripts. Tool is fully created using vanilla JavaScript. No server calls, hence feel safe of uploading sql files Or pasting scripts here.',
      date: '2025-03-01',
      link: '/sql-diagrams/',
      type: 'tool'
    },
    {
      id: 4,
      title: 'Text Diff',
      description: 'Compare and analyze text differences visually',
      date: '2025-03-02',
      link: '/text-diff/',
      type: 'tool'
    },
    {
      id: 5,
      title: 'MD to PDF Converter',
      description: 'Convert Markdown files to PDF format easily. A simple, fast tool for transforming your markdown documentation into professional PDF documents.',
      date: '2025-03-03',
      link: '/md-pdf-convertor/',
      type: 'tool'
    },
    {
      id: 6,
      title: 'JSON Formatter',
      description: 'Format and validate your JSON data with this easy-to-use tool. Features pretty printing, syntax validation, and structure visualization.',
      date: '2025-03-04',
      link: '/json-formatter/',
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
