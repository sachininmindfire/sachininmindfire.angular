import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import mermaid from 'mermaid';
import { marked } from 'marked';

type TextStyle = {
  fontSize: number;
  fontStyle: 'normal' | 'bold';
  lineHeight: number;
};

@Component({
  selector: 'app-md-pdf-convertor',
  imports: [CommonModule, FormsModule],
  templateUrl: './md-pdf-convertor.component.html',
  styleUrl: './md-pdf-convertor.component.scss',
})
export class MdPdfConvertorComponent implements AfterViewInit {
  @ViewChild('pdfPreview', { static: false }) pdfPreviewRef?: ElementRef<HTMLDivElement>;
  @ViewChild('panelContainer', { static: false }) panelContainerRef?: ElementRef<HTMLDivElement>;

  markdownInput = '';
  previewHtml = '<p style="font-size:12px">Enter some markdown to see the preview</p>';
  isProcessing = false;
  isResizingPreview = false;
  isPreviewFullscreen = false;
  previewWidthPercent = 50;

  constructor(private readonly cdr: ChangeDetectorRef) {
    marked.setOptions({ breaks: true, gfm: true });

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: false,
        useMaxWidth: false
      }
    });
  }

  ngAfterViewInit(): void {
    void this.generatePdfPreview();
  }

  async onUploadClick(fileInput: HTMLInputElement): Promise<void> {
    fileInput.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.match(/\.(md|markdown)$/i)) {
      alert('Please upload a Markdown file (.md or .markdown)');
      return;
    }

    try {
      this.markdownInput = await file.text();
      await this.generatePdfPreview();
    } catch {
      alert('Error reading file');
    } finally {
      input.value = '';
    }
  }

  async onMarkdownInput(): Promise<void> {
    await this.generatePdfPreview();
  }

  async onDownloadPdf(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    try {
      await this.downloadPdf();
    } finally {
      this.isProcessing = false;
    }
  }

  getGridTemplateColumns(): string {
    if (this.isPreviewFullscreen) {
      return '1fr';
    }

    const right = this.previewWidthPercent;
    const left = 100 - right;
    return `minmax(280px, ${left}fr) 10px minmax(320px, ${right}fr)`;
  }

  onResizeStart(event: MouseEvent): void {
    if (this.isPreviewFullscreen) {
      return;
    }

    event.preventDefault();
    this.isResizingPreview = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  togglePreviewFullscreen(): void {
    this.isPreviewFullscreen = !this.isPreviewFullscreen;
    this.isResizingPreview = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.isResizingPreview || this.isPreviewFullscreen) {
      return;
    }

    const container = this.panelContainerRef?.nativeElement;
    if (!container) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    if (bounds.width <= 0 || pointerX <= 0) {
      return;
    }

    const leftPercent = (pointerX / bounds.width) * 100;
    const nextRightPercent = 100 - leftPercent;
    this.previewWidthPercent = Math.min(80, Math.max(30, nextRightPercent));
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (!this.isResizingPreview) {
      return;
    }

    this.isResizingPreview = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  private async generatePdfPreview(): Promise<void> {
    const markdown = this.markdownInput;
    if (!markdown.trim()) {
      this.previewHtml = '<p style="font-size:12px">Enter some markdown to see the preview</p>';
      this.cdr.detectChanges();
      return;
    }

    try {
      const processedMarkdown = markdown.replace(/```mermaid([\s\S]*?)```/g, (match, code) => {
        return `\`\`\`mermaid${String(code).replace(/%/g, '-')}\`\`\``;
      });

      const parsed = await marked.parse(processedMarkdown);
      this.previewHtml = `<div style="font-family:Arial,sans-serif;font-size:12px;line-height:1.4">${parsed}</div>`;
      this.cdr.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 500));
      const previewElement = this.pdfPreviewRef?.nativeElement;
      if (!previewElement) {
        return;
      }

      await mermaid.run({
        nodes: previewElement.querySelectorAll('.mermaid'),
        suppressErrors: true
      });
    } catch (error) {
      console.error('Preview error:', error);
    }
  }

  private async downloadPdf(): Promise<void> {
    const previewElement = this.pdfPreviewRef?.nativeElement;
    if (!previewElement || !this.markdownInput.trim()) {
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margins = {
        top: 15,
        right: 15,
        bottom: 15,
        left: 15
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margins.left - margins.right;
      let currentY = margins.top;

      const styles: {
        normal: TextStyle;
        h1: TextStyle;
        h2: TextStyle;
        h3: TextStyle;
        code: TextStyle;
      } = {
        normal: { fontSize: 10, fontStyle: 'normal', lineHeight: 5 },
        h1: { fontSize: 18, fontStyle: 'bold', lineHeight: 10 },
        h2: { fontSize: 16, fontStyle: 'bold', lineHeight: 8 },
        h3: { fontSize: 14, fontStyle: 'bold', lineHeight: 7 },
        code: { fontSize: 8, fontStyle: 'normal', lineHeight: 4 }
      };

      const addText = (text: string, style: TextStyle): void => {
        if (!text.trim()) {
          return;
        }

        doc.setFontSize(style.fontSize);
        doc.setFont('helvetica', style.fontStyle);

        if (currentY > pageHeight - margins.bottom - style.lineHeight) {
          doc.addPage();
          currentY = margins.top;
        }

        const textLines = doc.splitTextToSize(text, contentWidth) as string[];

        textLines.forEach((line: string, index: number) => {
          doc.text(line, margins.left, currentY);
          currentY += style.lineHeight;

          if (currentY > pageHeight - margins.bottom - style.lineHeight && index < textLines.length - 1) {
            doc.addPage();
            currentY = margins.top;
          }
        });

        currentY += style.lineHeight / 2;
      };

      const addCodeBlock = (code: string, language: string): void => {
        const boxHeight = Math.min(100, code.split('\n').length * styles.code.lineHeight + 8);

        if (currentY + boxHeight > pageHeight - margins.bottom) {
          doc.addPage();
          currentY = margins.top;
        }

        doc.setFillColor(245, 245, 245);
        doc.rect(margins.left, currentY, contentWidth, boxHeight, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(margins.left, currentY, contentWidth, boxHeight, 'S');

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(language, margins.left + 2, currentY + 4);
        currentY += 6;

        doc.setFontSize(styles.code.fontSize);
        doc.setTextColor(0, 0, 0);
        doc.setFont('courier', 'normal');

        const codeLines = code.split('\n');
        const maxLines = 40;

        codeLines.slice(0, maxLines).forEach((line, index) => {
          if (currentY > pageHeight - margins.bottom - styles.code.lineHeight) {
            doc.addPage();
            currentY = margins.top;

            const remainingLines = codeLines.length - index;
            const newBoxHeight = Math.min(100, remainingLines * styles.code.lineHeight + 4);

            doc.setFillColor(245, 245, 245);
            doc.rect(margins.left, currentY, contentWidth, newBoxHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(margins.left, currentY, contentWidth, newBoxHeight, 'S');
            doc.setFontSize(styles.code.fontSize);
            doc.setTextColor(0, 0, 0);
            doc.setFont('courier', 'normal');
          }

          doc.text(line, margins.left + 4, currentY + 4);
          currentY += styles.code.lineHeight;
        });

        if (codeLines.length > maxLines) {
          doc.setTextColor(100, 100, 100);
          doc.text(`[...${codeLines.length - maxLines} more lines...]`, margins.left + 4, currentY + 4);
          currentY += styles.code.lineHeight * 2;
        } else {
          currentY += styles.code.lineHeight;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      };

      const processElements = (): void => {
        const root = previewElement.querySelector('div');
        if (!root) {
          return;
        }

        const titleElement = root.querySelector('h1');
        if (titleElement) {
          addText(titleElement.textContent ?? '', styles.h1);
        }

        Array.from(root.children).forEach((element) => {
          if (element === titleElement) {
            return;
          }

          const tagName = element.tagName;

          if (tagName === 'H1') {
            if (currentY > margins.top + styles.h1.lineHeight) {
              doc.addPage();
              currentY = margins.top;
            }
            addText(element.textContent ?? '', styles.h1);
            return;
          }

          if (tagName === 'H2') {
            currentY += styles.h2.lineHeight;
            addText(element.textContent ?? '', styles.h2);
            return;
          }

          if (tagName === 'H3') {
            addText(element.textContent ?? '', styles.h3);
            return;
          }

          if (tagName === 'P') {
            addText(element.textContent ?? '', styles.normal);
            return;
          }

          if (tagName === 'UL' || tagName === 'OL') {
            Array.from(element.children).forEach((li, index) => {
              const prefix = tagName === 'UL' ? '• ' : `${index + 1}. `;
              addText(prefix + (li.textContent ?? ''), styles.normal);
            });
            return;
          }

          if (tagName === 'PRE') {
            const code = element.textContent ?? '';
            const codeElement = element.querySelector('code');
            const language = codeElement?.className.replace('language-', '') ?? '';
            addCodeBlock(code, language);
            return;
          }

          if (element.className.includes('mermaid')) {
            addText('[Mermaid Diagram - See original document]', styles.normal);
            currentY += styles.normal.lineHeight;
            return;
          }

          addText(element.textContent ?? '', styles.normal);
        });
      };

      const addTableOfContents = (): void => {
        const headings = Array.from(previewElement.querySelectorAll('h1, h2, h3'));
        if (headings.length <= 1) {
          return;
        }

        doc.setPage(1);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Contents', margins.left, currentY);
        currentY += 10;

        headings.forEach((heading) => {
          const level = Number.parseInt(heading.tagName.slice(1), 10);
          const indent = (level - 1) * 5;

          doc.setFontSize(10);
          doc.setFont('helvetica', level === 1 ? 'bold' : 'normal');
          doc.text(heading.textContent ?? '', margins.left + indent, currentY);
          currentY += 5;
        });

        currentY += 10;
      };

      addTableOfContents();
      processElements();
      doc.save('sql-diagram-generator-plan.pdf');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('PDF generation error:', error);
      alert(`Error generating PDF: ${errorMessage}`);
    }
  }
}