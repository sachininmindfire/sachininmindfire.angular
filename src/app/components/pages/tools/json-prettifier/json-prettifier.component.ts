// ...existing code...
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-prettifier',
  templateUrl: './json-prettifier.component.html',
  styleUrls: ['./json-prettifier.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class JsonPrettifierComponent {
  jsonControl = new FormControl('');
  jsonOutput: string | null = null;

  private readonly cd = inject(ChangeDetectorRef);

  prettify(): void {
    const raw = (this.jsonControl.value ?? '').toString().trim();
    if (!raw) {
      this.jsonOutput = null;
      this.cd.markForCheck();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      this.jsonOutput = JSON.stringify(parsed, null, 2);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.jsonOutput = `Invalid JSON: ${msg}`;
    }

    this.cd.markForCheck();
  }

  clear(): void {
    this.jsonControl.setValue('');
    this.jsonOutput = null;
    this.cd.markForCheck();
  }

  async copy(): Promise<void> {
    if (!this.jsonOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.jsonOutput);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = this.jsonOutput;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }
}
// ...existing code...
