import { AfterViewInit, Component, OnDestroy } from "@angular/core";

type DiffResult = {
    matches: Map<number, number>;
    deletions: Set<number>;
    additions: Set<number>;
};

@Component({
    selector: 'app-text-diff',
    standalone: true,
    templateUrl: './text-diff.component.html',
    styleUrls: ['./text-diff.component.scss']
})
export class TextDiffComponent implements AfterViewInit, OnDestroy {
    // Keep references to bound event handlers so we can remove them on destroy
    private compareHandler = () => this.onCompare();
    private toggleHandler = () => this.onToggle();
    private clearHandler = () => this.onClear();
    private autoSaveTimeout = 0 as any;

    ngAfterViewInit(): void {
        // Attach event listeners like the original plain-js implementation
        const compareBtn = document.getElementById('compareBtn') as HTMLButtonElement | null;
        const toggleBtn = document.getElementById('toggleBtn') as HTMLButtonElement | null;
        const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement | null;
        const leftText = document.getElementById('leftText') as HTMLTextAreaElement | null;
        const rightText = document.getElementById('rightText') as HTMLTextAreaElement | null;

        if (compareBtn) compareBtn.addEventListener('click', this.compareHandler);
        if (toggleBtn) toggleBtn.addEventListener('click', this.toggleHandler);
        if (clearBtn) clearBtn.addEventListener('click', this.clearHandler);

        if (leftText) leftText.addEventListener('input', () => this.autoSave('left'));
        if (rightText) rightText.addEventListener('input', () => this.autoSave('right'));

        // Load last saved state
        this.loadLastState();
    }

    ngOnDestroy(): void {
        const compareBtn = document.getElementById('compareBtn') as HTMLButtonElement | null;
        const toggleBtn = document.getElementById('toggleBtn') as HTMLButtonElement | null;
        const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement | null;
        const leftText = document.getElementById('leftText') as HTMLTextAreaElement | null;
        const rightText = document.getElementById('rightText') as HTMLTextAreaElement | null;

        if (compareBtn) compareBtn.removeEventListener('click', this.compareHandler);
        if (toggleBtn) toggleBtn.removeEventListener('click', this.toggleHandler);
        if (clearBtn) clearBtn.removeEventListener('click', this.clearHandler);

        if (leftText) leftText.removeEventListener('input', () => this.autoSave('left'));
        if (rightText) rightText.removeEventListener('input', () => this.autoSave('right'));

        window.clearTimeout(this.autoSaveTimeout);
    }

    // ------------------------- Diff utilities -------------------------
    private findLCS(lines1: string[], lines2: string[]): DiffResult {
        const m = lines1.length;
        const n = lines2.length;
        const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        const backtrack: string[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(''));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (lines1[i - 1] === lines2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    backtrack[i][j] = 'diagonal';
                } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                    dp[i][j] = dp[i - 1][j];
                    backtrack[i][j] = 'up';
                } else {
                    dp[i][j] = dp[i][j - 1];
                    backtrack[i][j] = 'left';
                }
            }
        }

        const diff: DiffResult = { matches: new Map(), deletions: new Set(), additions: new Set() };

        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (backtrack[i][j] === 'diagonal') {
                diff.matches.set(i - 1, j - 1);
                i--; j--;
            } else if (backtrack[i][j] === 'up') {
                diff.deletions.add(i - 1);
                i--;
            } else {
                diff.additions.add(j - 1);
                j--;
            }
        }

        while (i > 0) { diff.deletions.add(i - 1); i--; }
        while (j > 0) { diff.additions.add(j - 1); j--; }

        return diff;
    }

    private findInlineDiff(str1: string, str2: string): DiffResult {
        const words1 = str1.split(/(\s+)/);
        const words2 = str2.split(/(\s+)/);
        return this.findLCS(words1, words2);
    }

    // ------------------------- Core UI methods -------------------------
    private escapeHtml(str: string): string {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    }

    compareTexts(leftText: string, rightText: string): void {
        const leftTextArea = document.getElementById('leftText') as HTMLTextAreaElement | null;
        const rightTextArea = document.getElementById('rightText') as HTMLTextAreaElement | null;
        const leftDiffDisplay = document.getElementById('leftDiff') as HTMLElement | null;
        const rightDiffDisplay = document.getElementById('rightDiff') as HTMLElement | null;

        if (!leftDiffDisplay || !rightDiffDisplay || !leftTextArea || !rightTextArea) return;

        leftTextArea.style.display = 'none';
        rightTextArea.style.display = 'none';
        leftDiffDisplay.style.display = 'block';
        rightDiffDisplay.style.display = 'block';

        const leftLines = leftText.split('\n');
        const rightLines = rightText.split('\n');

        const lineDiff = this.findLCS(leftLines, rightLines);

        let leftHtml = '';
        let rightHtml = '';

        for (let i = 0; i < leftLines.length; i++) {
            if (lineDiff.deletions.has(i)) {
                leftHtml += `<div class="deletion"><span class="deletion-inline">${this.escapeHtml(leftLines[i]) || ' '}</span></div>`;
            } else {
                const matchingLineIndex = lineDiff.matches.get(i);
                if (matchingLineIndex === undefined) {
                    // no match found (defensive)
                    leftHtml += `<div>${this.escapeHtml(leftLines[i]) || ' '}</div>`;
                } else if (leftLines[i] === rightLines[matchingLineIndex]) {
                    leftHtml += `<div>${this.escapeHtml(leftLines[i]) || ' '}</div>`;
                } else {
                    const inlineDiff = this.findInlineDiff(leftLines[i], rightLines[matchingLineIndex]);
                    // iterate over words rather than characters
                    const leftWords = leftLines[i].split(/(\s+)/);
                    let lineHtml = '';
                    for (let j = 0; j < leftWords.length; j++) {
                        const word = this.escapeHtml(leftWords[j]);
                        if (inlineDiff.deletions.has(j)) {
                            lineHtml += `<span class="deletion-inline">${word}</span>`;
                        } else {
                            lineHtml += word;
                        }
                    }
                    leftHtml += `<div>${lineHtml || ' '}</div>`;
                }
            }
        }

        for (let i = 0; i < rightLines.length; i++) {
            if (lineDiff.additions.has(i)) {
                rightHtml += `<div class="addition"><span class="addition-inline">${this.escapeHtml(rightLines[i]) || ' '}</span></div>`;
            } else {
                const matchingLineIndex = Array.from(lineDiff.matches.entries()).find(([_, rightIdx]) => rightIdx === i)?.[0];
                if (matchingLineIndex === undefined) {
                    rightHtml += `<div>${this.escapeHtml(rightLines[i]) || ' '}</div>`;
                } else if (leftLines[matchingLineIndex] === rightLines[i]) {
                    rightHtml += `<div>${this.escapeHtml(rightLines[i]) || ' '}</div>`;
                } else {
                    const inlineDiff = this.findInlineDiff(leftLines[matchingLineIndex], rightLines[i]);
                    const rightWords = rightLines[i].split(/(\s+)/);
                    let lineHtml = '';
                    for (let j = 0; j < rightWords.length; j++) {
                        const word = this.escapeHtml(rightWords[j]);
                        if (inlineDiff.additions.has(j)) {
                            lineHtml += `<span class="addition-inline">${word}</span>`;
                        } else {
                            lineHtml += word;
                        }
                    }
                    rightHtml += `<div>${lineHtml || ' '}</div>`;
                }
            }
        }

        leftDiffDisplay.innerHTML = leftHtml;
        rightDiffDisplay.innerHTML = rightHtml;

        const hideHandler = () => {
            leftDiffDisplay.style.display = 'none';
            rightDiffDisplay.style.display = 'none';
            leftTextArea.style.display = 'block';
            rightTextArea.style.display = 'block';
        };

        leftDiffDisplay.addEventListener('click', hideHandler);
        rightDiffDisplay.addEventListener('click', hideHandler);
    }

    // ------------------------- File handling utilities -------------------------
    chooseFile(side: 'left' | 'right'): void {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.js,.css,.html,.md';
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files ? target.files[0] : null;
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev: ProgressEvent<FileReader>) => {
                    const content = ev.target?.result as string;
                    const textEl = document.getElementById(`${side}Text`) as HTMLTextAreaElement | null;
                    const nameEl = document.getElementById(`${side}FileName`) as HTMLInputElement | null;
                    if (textEl) textEl.value = content;
                    if (nameEl) nameEl.value = file.name;

                    // Save to localStorage
                    localStorage.setItem(`last${this.capitalize(side)}Text`, content);
                    localStorage.setItem(`last${this.capitalize(side)}FileName`, file.name);
                };
                reader.readAsText(file);
            }
        };
        fileInput.click();
    }

    saveText(side: 'left' | 'right'): void {
        const textArea = document.getElementById(`${side}Text`) as HTMLTextAreaElement | null;
        const nameInput = document.getElementById(`${side}FileName`) as HTMLInputElement | null;
        if (!textArea) return;
        const content = textArea.value;
        const suggestedName = (nameInput && nameInput.value) ? nameInput.value : 'untitled.txt';

        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = suggestedName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 0);

        localStorage.setItem(`last${this.capitalize(side)}Text`, content);
        localStorage.setItem(`last${this.capitalize(side)}FileName`, suggestedName);
    }

    loadText(fileName: string, side: 'left' | 'right'): void {
        const savedText = localStorage.getItem(`last${this.capitalize(side)}Text`);
        if (savedText) {
            const textEl = document.getElementById(`${side}Text`) as HTMLTextAreaElement | null;
            if (textEl) textEl.value = savedText;
        }
        const savedFileName = localStorage.getItem(`last${this.capitalize(side)}FileName`);
        if (savedFileName) {
            const nameEl = document.getElementById(`${side}FileName`) as HTMLInputElement | null;
            if (nameEl) nameEl.value = savedFileName;
        }
    }

    // ------------------------- UI action handlers (wired to the original button IDs) -------------------------
    private onCompare(): void {
        const leftText = (document.getElementById('leftText') as HTMLTextAreaElement | null)?.value || '';
        const rightText = (document.getElementById('rightText') as HTMLTextAreaElement | null)?.value || '';
        this.compareTexts(leftText, rightText);
    }

    private onToggle(): void {
        const leftText = document.getElementById('leftText') as HTMLTextAreaElement | null;
        const rightText = document.getElementById('rightText') as HTMLTextAreaElement | null;
        const leftDiff = document.getElementById('leftDiff') as HTMLElement | null;
        const rightDiff = document.getElementById('rightDiff') as HTMLElement | null;
        const leftFileName = document.getElementById('leftFileName') as HTMLInputElement | null;
        const rightFileName = document.getElementById('rightFileName') as HTMLInputElement | null;

        if (!leftText || !rightText || !leftDiff || !rightDiff || !leftFileName || !rightFileName) return;

        leftDiff.style.display = 'none';
        rightDiff.style.display = 'none';
        leftText.style.display = 'block';
        rightText.style.display = 'block';

        const tempText = leftText.value;
        leftText.value = rightText.value;
        rightText.value = tempText;

        const tempFileName = leftFileName.value;
        leftFileName.value = rightFileName.value;
        rightFileName.value = tempFileName;
    }

    private onClear(): void {
        const leftText = document.getElementById('leftText') as HTMLTextAreaElement | null;
        const rightText = document.getElementById('rightText') as HTMLTextAreaElement | null;
        if (leftText) leftText.value = '';
        if (rightText) rightText.value = '';

        const leftFileName = document.getElementById('leftFileName') as HTMLInputElement | null;
        const rightFileName = document.getElementById('rightFileName') as HTMLInputElement | null;
        if (leftFileName) leftFileName.value = '';
        if (rightFileName) rightFileName.value = '';

        const leftDiff = document.getElementById('leftDiff') as HTMLElement | null;
        const rightDiff = document.getElementById('rightDiff') as HTMLElement | null;
        if (leftDiff) leftDiff.style.display = 'none';
        if (rightDiff) rightDiff.style.display = 'none';

        localStorage.removeItem('lastLeftText');
        localStorage.removeItem('lastRightText');
        localStorage.removeItem('lastLeftFileName');
        localStorage.removeItem('lastRightFileName');
    }

    // ------------------------- Autosave & persistence -------------------------
    private autoSave(side: 'left' | 'right'): void {
        window.clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = window.setTimeout(() => {
            const fileNameEl = document.getElementById(`${side}FileName`) as HTMLInputElement | null;
            if (fileNameEl && fileNameEl.value) {
                this.saveText(side);
            }
        }, 1000);
    }

    private loadLastState(): void {
        const lastLeftText = localStorage.getItem('lastLeftText');
        const lastRightText = localStorage.getItem('lastRightText');
        const lastLeftFileName = localStorage.getItem('lastLeftFileName');
        const lastRightFileName = localStorage.getItem('lastRightFileName');

        if (lastLeftText) {
            const leftText = document.getElementById('leftText') as HTMLTextAreaElement | null;
            if (leftText) leftText.value = lastLeftText;
            const leftFile = document.getElementById('leftFileName') as HTMLInputElement | null;
            if (leftFile && lastLeftFileName) leftFile.value = lastLeftFileName;
        }
        if (lastRightText) {
            const rightText = document.getElementById('rightText') as HTMLTextAreaElement | null;
            if (rightText) rightText.value = lastRightText;
            const rightFile = document.getElementById('rightFileName') as HTMLInputElement | null;
            if (rightFile && lastRightFileName) rightFile.value = lastRightFileName;
        }
    }

    // ------------------------- Small helpers -------------------------
    private capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}