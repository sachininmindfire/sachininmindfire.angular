import { Component, computed, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  FieldTree,
  FormField,
  FormRoot,
  form,
  minLength,
  required,
  schema
} from '@angular/forms/signals';

type SqlDiagramFormModel = {
  diagramName: string;
  sql: string;
  includeColumns: boolean;
};

type ColumnDefinition = {
  name: string;
  type: string;
  isPrimary: boolean;
};

type ForeignKeyDefinition = {
  from: string;
  to: string;
  foreignColumn: string;
};

type TableDefinition = {
  name: string;
  columns: ColumnDefinition[];
  foreignKeys: ForeignKeyDefinition[];
};


@Component({
  selector: 'app-sql-diagram',
  standalone: true,
  imports: [FormRoot, FormField],
  templateUrl: './sql-diagram.component.html',
  styleUrls: ['./sql-diagram.component.scss']
})
export class SqlDiagramComponent {
  protected readonly title = signal('SQL Diagram Builder');
  protected readonly generatedMessage = signal('No diagram generated yet.');
  protected readonly mermaidCode = signal('');
  protected readonly mermaidSvg = signal<SafeHtml>('');
  protected readonly mermaidSvgMarkup = signal('');
  protected readonly parsedTableCount = signal(0);
  private mermaidInitialized = false;

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected readonly formModel = signal<SqlDiagramFormModel>({
    diagramName: 'posts-schema',
    sql: `CREATE TABLE users (
        id INT PRIMARY KEY,
        username VARCHAR(50),
        email VARCHAR(100),
        created_at TIMESTAMP
    );

    CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT,
        title VARCHAR(200),
        content TEXT,
        published_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE comments (
        id INT PRIMARY KEY,
        post_id INT,
        user_id INT,
        content TEXT,
        created_at TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );`,
    includeColumns: true
  });

  protected readonly sqlForm = form(
    this.formModel,
    schema<SqlDiagramFormModel>((path) => {
      required(path.diagramName, { message: 'Diagram name is required.' });
      minLength(path.diagramName, 3, { message: 'Use at least 3 characters.' });
      required(path.sql, { message: 'SQL input is required.' });
      minLength(path.sql, 20, { message: 'Add more SQL so relationships can be parsed.' });
    }),
    {
      submission: {
        action: async () => {
          const model = this.formModel();
          const tables = this.parseSQLScript(model.sql);
          this.parsedTableCount.set(tables.size);

          if (tables.size === 0) {
            this.mermaidCode.set('');
            this.mermaidSvg.set('');
            this.mermaidSvgMarkup.set('');
            this.generatedMessage.set('No valid CREATE TABLE statements found.');
            return undefined;
          }

          const generatedCode = this.generateMermaidER(tables, model.includeColumns);
          this.mermaidCode.set(generatedCode);
          try {
            await this.renderMermaid(generatedCode);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Mermaid rendering error.';
            this.mermaidSvg.set('');
            this.mermaidSvgMarkup.set('');
            this.generatedMessage.set(`Mermaid render failed: ${message}`);
            return undefined;
          }

          const columnMode = model.includeColumns ? 'with columns' : 'without columns';
          this.generatedMessage.set(
            `Generated Mermaid ER diagram for ${model.diagramName} from ${tables.size} table(s) ${columnMode}.`
          );

          return undefined;
        }
      }
    }
  );

  protected readonly tableCount = computed(() => {
    return this.parsedTableCount();
  });

  protected firstError(field: FieldTree<unknown>): string | null {
    const errors = field().errors();
    if (!errors.length) {
      return null;
    }

    return errors[0].message ?? 'Invalid field value.';
  }

  protected downloadDiagram(): void {
    const svg = this.mermaidSvgMarkup();
    if (!svg) {
      this.generatedMessage.set('Generate a diagram before saving.');
      return;
    }

    const inputName = this.sqlForm.diagramName().value().trim() || 'sql-diagram';
    const safeName = inputName
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'sql-diagram';

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.svg`;
    link.click();

    URL.revokeObjectURL(url);
    this.generatedMessage.set(`Downloaded ${safeName}.svg`);
  }

  private parseSQLScript(sql: string): Map<string, TableDefinition> {
    const tables = new Map<string, TableDefinition>();
    const normalized = sql.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const statements = normalized.split(/\bGO\b/).join('\n').split(';');

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) {
        continue;
      }

      if (/CREATE\s+TABLE/i.test(trimmed)) {
        this.processCreateTable(trimmed, tables);
      }
    }

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) {
        continue;
      }

      if (/ALTER\s+TABLE/i.test(trimmed)) {
        this.processAlterTable(trimmed, tables);
      }
    }

    return tables;
  }

  private processCreateTable(statement: string, tables: Map<string, TableDefinition>): void {
    const match = statement.match(
      /CREATE\s+TABLE\s+(?:\[?(?:dbo|TechopediaModelStoreContainer)\]?\.)?\[?([^\]\s]+)\]?\s*\(([\s\S]*)/i
    );
    if (!match) {
      return;
    }

    const tableName = match[1];
    const columnsPart = match[2];
    if (!columnsPart) {
      return;
    }

    const columns: ColumnDefinition[] = [];
    const foreignKeys: ForeignKeyDefinition[] = [];
    const definitions = this.splitColumnDefinitions(columnsPart);

    for (const definition of definitions) {
      const inlineFkMatch = definition.match(
        /FOREIGN\s+KEY\s*(?:\([^)]+\))?\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/i
      );
      if (inlineFkMatch) {
        const localColMatch = definition.match(/\(([^)]+)\)/);
        if (localColMatch) {
          foreignKeys.push({
            from: localColMatch[1].trim(),
            to: inlineFkMatch[1].trim(),
            foreignColumn: inlineFkMatch[2].trim()
          });
        }
        continue;
      }

      if (/^\s*(?:CONSTRAINT\s+\[?\w+\]?\s+)?FOREIGN\s+KEY/i.test(definition)) {
        const fkMatch = definition.match(
          /FOREIGN\s+KEY\s*\(\[?([^\]]+)\]?\)\s*REFERENCES\s+(?:\[?(?:dbo|TechopediaModelStoreContainer)\]?\.)?\[?([^\]]+)\]?\s*\(\[?([^\]]+)\]?\)/i
        );
        if (fkMatch) {
          foreignKeys.push({
            from: fkMatch[1].trim(),
            to: fkMatch[2].trim(),
            foreignColumn: fkMatch[3].trim()
          });
        }
        continue;
      }

      const columnMatch = definition.match(
        /^\s*\[?([^\]]+)\]?\s+([\w\s\(\),]+)(?:\s+IDENTITY\s*\(\d+,\d+\))?(?:\s+NULL|\s+NOT\s+NULL)?(?:\s+PRIMARY\s+KEY)?/i
      );
      if (!columnMatch) {
        continue;
      }

      const name = columnMatch[1];
      const type = columnMatch[2];
      const isPrimary = /PRIMARY\s+KEY/i.test(definition) || /IDENTITY/i.test(definition);
      columns.push({
        name,
        type: this.simplifyType(type.trim()),
        isPrimary
      });
    }

    if (columns.length > 0) {
      tables.set(tableName, { name: tableName, columns, foreignKeys });
    }
  }

  private processAlterTable(statement: string, tables: Map<string, TableDefinition>): void {
    const alterMatch = statement.match(
      /ALTER\s+TABLE\s+(?:\[?(?:dbo|TechopediaModelStoreContainer)\]?\.)?\[?([^\]]+)\]?\s+ADD\s+CONSTRAINT\s+\[?[^\]]+\]?\s+FOREIGN\s+KEY\s*\(\[?([^\]]+)\]?\)\s+REFERENCES\s+(?:\[?(?:dbo|TechopediaModelStoreContainer)\]?\.)?\[?([^\]]+)\]?\s*\(\[?([^\]]+)\]?\)/i
    );
    if (!alterMatch) {
      return;
    }

    const tableName = alterMatch[1].trim();
    const localColumn = alterMatch[2].trim();
    const foreignTable = alterMatch[3].trim();
    const foreignColumn = alterMatch[4].trim();
    const table = tables.get(tableName) ?? { name: tableName, columns: [], foreignKeys: [] };

    table.foreignKeys.push({
      from: localColumn,
      to: foreignTable,
      foreignColumn
    });
    tables.set(tableName, table);
  }

  private splitColumnDefinitions(columnsPart: string): string[] {
    const definitions: string[] = [];
    let current = '';
    let parenCount = 0;
    let inQuote = false;
    let inBracket = false;

    for (const char of columnsPart) {
      if (char === '[' && !inQuote) {
        inBracket = true;
      } else if (char === ']' && !inQuote) {
        inBracket = false;
      } else if (char === '(' && !inQuote && !inBracket) {
        parenCount += 1;
      } else if (char === ')' && !inQuote && !inBracket) {
        parenCount -= 1;
        if (parenCount < 0) {
          break;
        }
      } else if (char === '"' || char === "'") {
        inQuote = !inQuote;
      }

      if (char === ',' && parenCount === 0 && !inQuote && !inBracket) {
        definitions.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      definitions.push(current.trim());
    }

    return definitions;
  }

  private simplifyType(type: string): string {
    const compactType = type.replace(/\(\d+(?:,\d+)?\)/, '');
    const baseType = compactType.split(' ')[0].toLowerCase();
    const typeMap: Record<string, string> = {
      nvarchar: 'string',
      varchar: 'string',
      char: 'string',
      nchar: 'string',
      text: 'string',
      ntext: 'string',
      uniqueidentifier: 'guid',
      datetime: 'date',
      datetime2: 'date',
      date: 'date',
      time: 'time',
      bit: 'bool',
      int: 'int',
      bigint: 'long',
      smallint: 'int',
      tinyint: 'int',
      decimal: 'decimal',
      numeric: 'decimal',
      float: 'float',
      real: 'float',
      varbinary: 'binary',
      binary: 'binary',
      image: 'binary'
    };

    return typeMap[baseType] ?? baseType;
  }

  private generateMermaidER(tables: Map<string, TableDefinition>, includeColumns: boolean): string {
    let mermaidDiagram = 'erDiagram\n';

    for (const [tableName, table] of tables) {
      mermaidDiagram += `    ${tableName} {\n`;
      if (includeColumns) {
        for (const column of table.columns) {
          mermaidDiagram += `        ${column.type} ${column.name}${column.isPrimary ? ' PK' : ''}\n`;
        }
      }
      mermaidDiagram += '    }\n';
    }

    const addedRelations = new Set<string>();
    for (const [tableName, table] of tables) {
      for (const foreignKey of table.foreignKeys) {
        const relationKey = `${tableName}-${foreignKey.to}`;
        if (addedRelations.has(relationKey)) {
          continue;
        }

        mermaidDiagram += `    ${tableName} }|--|| ${foreignKey.to} : "references"\n`;
        addedRelations.add(relationKey);
      }
    }

    return mermaidDiagram;
  }

  private async renderMermaid(diagram: string): Promise<void> {
    const mermaid = (await import('mermaid')).default;
    if (!this.mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        er: {
          diagramPadding: 20,
          layoutDirection: 'TB',
          minEntityWidth: 100,
          minEntityHeight: 75,
          entityPadding: 15,
          stroke: 'gray',
          fill: 'white',
          fontSize: 12
        }
      });
      this.mermaidInitialized = true;
    }

    const renderId = `sql-er-${Date.now()}`;
    const { svg } = await mermaid.render(renderId, diagram);
    this.mermaidSvgMarkup.set(svg);
    this.mermaidSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
  }
}
