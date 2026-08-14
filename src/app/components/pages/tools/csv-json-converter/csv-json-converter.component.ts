import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ConversionMode = 'csv-to-json' | 'json-to-csv';

@Component({
  selector: 'app-csv-json-converter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './csv-json-converter.component.html',
  styleUrls: ['./csv-json-converter.component.scss']
})
export class CsvJsonConverterComponent {
  mode: ConversionMode = 'csv-to-json';
  inputText = '';
  outputText = '';
  errorMessage = '';

  sampleCsv = `name,age,city
Alice,30,London
Bob,25,Paris`;

  sampleJson = JSON.stringify([
    { name: 'Alice', age: 30, city: 'London' },
    { name: 'Bob', age: 25, city: 'Paris' }
  ], null, 2);

  setMode(mode: ConversionMode): void {
    this.mode = mode;
    this.errorMessage = '';

    if (this.inputText.trim()) {
      this.convert();
    }
  }

  useSample(): void {
    this.inputText = this.mode === 'csv-to-json' ? this.sampleCsv : this.sampleJson;
    this.convert();
  }

  convert(): void {
    this.errorMessage = '';

    try {
      this.outputText = this.mode === 'csv-to-json'
        ? this.convertCsvToJson(this.inputText)
        : this.convertJsonToCsv(this.inputText);
    } catch (error) {
      this.outputText = '';
      this.errorMessage = error instanceof Error ? error.message : 'Conversion failed.';
    }
  }

  clear(): void {
    this.inputText = '';
    this.outputText = '';
    this.errorMessage = '';
  }

  async copyOutput(): Promise<void> {
    if (!this.outputText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.outputText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = this.outputText;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  private convertCsvToJson(csvText: string): string {
    const normalized = csvText.trim();

    if (!normalized) {
      throw new Error('Please paste a CSV string before converting.');
    }

    const rows = this.parseCsvRows(normalized);

    if (rows.length < 2) {
      throw new Error('CSV input must include a header row and at least one data row.');
    }

    const [headers, ...dataRows] = rows;
    const records: Record<string, string>[] = [];

    dataRows.forEach((row, rowIndex) => {
      const item: Record<string, string> = {};
      const rowLength = row.length;

      headers.forEach((header, index) => {
        const key = (header || `column_${index + 1}`).trim() || `column_${index + 1}`;
        const value = index < rowLength ? row[index] : '';
        item[key] = value;
      });

      if (row.some((cell) => cell.trim() !== '') || rowIndex === 0) {
        records.push(item);
      }
    });

    return JSON.stringify(records, null, 2);
  }

  private convertJsonToCsv(jsonText: string): string {
    const normalized = jsonText.trim();

    if (!normalized) {
      throw new Error('Please paste a JSON string before converting.');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(normalized);
    } catch {
      throw new Error('Invalid JSON input. Please check the syntax and try again.');
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];

    if (!items.length) {
      throw new Error('JSON input must contain at least one object.');
    }

    const isValidObjectArray = items.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item));

    if (!isValidObjectArray) {
      throw new Error('JSON input must be an object or an array of objects.');
    }

    const headers = Array.from(
      new Set(items.flatMap((item) => Object.keys(item as Record<string, unknown>)))
    );

    const rows = [headers, ...items.map((item) => headers.map((header) => {
      const value = (item as Record<string, unknown>)[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    }))];

    return rows
      .map((row) => row.map((cell) => this.escapeCsvCell(String(cell))).join(','))
      .join('\n');
  }

  private escapeCsvCell(value: string): string {
    const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  }

  private parseCsvRows(csvText: string): string[][] {
    const rows: string[][] = [];
    const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let currentRow: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let index = 0; index < normalized.length; index += 1) {
      const char = normalized[index];

      if (char === '"') {
        if (inQuotes && normalized[index + 1] === '"') {
          currentValue += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        currentRow.push(currentValue);
        currentValue = '';
        continue;
      }

      if ((char === '\n') && !inQuotes) {
        currentRow.push(currentValue);
        if (currentRow.some((cell) => cell.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentValue = '';
        continue;
      }

      currentValue += char;
    }

    if (currentValue.length > 0 || currentRow.length > 0) {
      currentRow.push(currentValue);
      if (currentRow.some((cell) => cell.trim() !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  }
}
