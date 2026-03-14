import { Component, ViewChild, ElementRef } from '@angular/core';
import { ConfigService } from '../../../../services/config.service';
// import {form, FormField} from '@angular/forms/signals';

interface formData {
  inputSql: string,
  languageType: string
}

@Component({
  selector: 'app-sql-poco',
  templateUrl: './sql-poco.component.html',
  styleUrls: ['./sql-poco.component.scss']
})
export class SqlPocoComponent {
  // formModel = signal<formData>({

  // }) 



  @ViewChild('sqlInput') sqlInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('outputCode') outputCode!: ElementRef<HTMLElement>;
  @ViewChild('copyBtn') copyBtn!: ElementRef<HTMLButtonElement>;
  language: string = 'csharp';
  isConverting = false;

  constructor(private config: ConfigService) { }

  async handleConversion(): Promise<void> {
    const sql = this.sqlInput.nativeElement.value.trim();
    if (!sql) {
      alert('Please enter a SQL script');
      return;
    }

    this.isConverting = true;
    try {
      const response = await fetch(`${this.config.API_BASE_URL}/api/poco/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlScript: sql, language: this.language })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to convert SQL';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        const combinedCode = Object.entries(result.generatedCode)
          .map(([tableName, code]) => `// Table: ${tableName}\n${code}`)
          .join('\n\n');
        this.displayOutput(combinedCode);
      } else {
        throw new Error(result.error || 'Failed to generate code');
      }
    } catch (error: any) {
      this.outputCode.nativeElement.textContent = `// Error: ${error.message}`;
      this.highlightOutput();
    } finally {
      this.isConverting = false;
    }
  }

  displayOutput(code: string): void {
    this.outputCode.nativeElement.textContent = code;
    this.outputCode.nativeElement.className = `language-${this.language}`;
    this.highlightOutput();
  }

  highlightOutput(): void {
    if ((window as any).Prism) {
      (window as any).Prism.highlightElement(this.outputCode.nativeElement);
    }
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.outputCode.nativeElement.textContent || '');
      const btn = this.copyBtn.nativeElement;
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.backgroundColor = 'var(--success-color)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
      }, 2000);
    } catch {
      alert('Failed to copy code');
    }
  }

  onLanguageChange(): void {
    if (this.outputCode.nativeElement.textContent) {
      this.handleConversion();
    }
  }
}
