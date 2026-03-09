import { SessionResult } from '../types';

export class ResultsComponent {
    private container: HTMLElement;
    private result: SessionResult;
    private onRestart: () => void;
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        result: SessionResult,
        onRestart: () => void
    ) {
        this.container = container;
        this.result = result;
        this.onRestart = onRestart;
        this.render();
    }

    render(): void {
        this.rootEl = this.container.createDiv({ cls: 'kt-results' });

        this.rootEl.createEl('h2', { text: 'Результаты тренировки' });

        // Large average score
        const scoreDiv = this.rootEl.createDiv({ cls: 'kt-results-score' });
        scoreDiv.setText(this.result.averageScore.toFixed(1));

        // Summary grid
        const summary = this.rootEl.createDiv({ cls: 'kt-results-summary' });

        this.createStatItem(summary, 'Всего вопросов', String(this.result.totalQuestions), '');
        this.createStatItem(summary, 'Правильно', String(this.result.correct), 'green');
        this.createStatItem(summary, 'Неправильно', String(this.result.incorrect), 'red');
        this.createStatItem(summary, 'Частично', String(this.result.partial), 'yellow');
        this.createStatItem(summary, 'Время', this.formatTime(this.result.timeSpentMs), '');

        // Details list
        const details = this.rootEl.createDiv({ cls: 'kt-results-details' });
        details.createEl('h3', { text: 'Детали' });

        for (const qr of this.result.questionResults) {
            const item = details.createDiv({ cls: 'kt-result-item' });

            let icon: string;
            let iconCls: string;
            if (qr.score >= 4) {
                icon = '\u2713';
                iconCls = 'kt-icon-correct';
            } else if (qr.score >= 2) {
                icon = '~';
                iconCls = 'kt-icon-partial';
            } else {
                icon = '\u2717';
                iconCls = 'kt-icon-incorrect';
            }

            item.createSpan({ cls: `kt-result-icon ${iconCls}`, text: icon });
            item.createSpan({ cls: 'kt-result-type', text: qr.type });
            item.createSpan({ cls: 'kt-result-score', text: `${qr.score}/5` });
        }

        // Restart button
        const restartBtn = this.rootEl.createEl('button', {
            text: 'Новая тренировка',
            cls: 'kt-start-btn',
        });

        restartBtn.addEventListener('click', () => {
            this.onRestart();
        });
    }

    private createStatItem(parent: HTMLElement, label: string, value: string, colorClass: string): void {
        const item = parent.createDiv({ cls: 'kt-stat-item' });
        item.createDiv({ cls: 'kt-stat-label', text: label });
        item.createDiv({ cls: `kt-stat-value ${colorClass ? 'kt-color-' + colorClass : ''}`, text: value });
    }

    private formatTime(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} мин ${seconds} сек`;
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }
}
