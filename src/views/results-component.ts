import { SessionResult, ProgressData } from '../types';

export class ResultsComponent {
    private container: HTMLElement;
    private result: SessionResult;
    private onRestart: () => void;
    private progressStats?: ProgressData['stats'];
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        result: SessionResult,
        onRestart: () => void,
        progressStats?: ProgressData['stats']
    ) {
        this.container = container;
        this.result = result;
        this.onRestart = onRestart;
        this.progressStats = progressStats;
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

        // Progress stats (spaced repetition)
        if (this.progressStats) {
            const statsSection = this.rootEl.createDiv({ cls: 'kt-progress-stats' });
            statsSection.createEl('h3', { text: 'Общий прогресс' });

            const statsGrid = statsSection.createDiv({ cls: 'kt-results-summary' });
            this.createStatItem(statsGrid, 'Всего повторений', String(this.progressStats.totalReviews), '');
            this.createStatItem(statsGrid, 'Серия дней', String(this.progressStats.streakDays), '');

            const topicEntries = Object.entries(this.progressStats.masteryByTopic);
            if (topicEntries.length > 0) {
                const masterySection = statsSection.createDiv({ cls: 'kt-mastery-section' });
                masterySection.createEl('h4', { text: 'Освоение по темам' });

                for (const [topic, mastery] of topicEntries) {
                    const masteryItem = masterySection.createDiv({ cls: 'kt-mastery-item' });
                    masteryItem.createSpan({ cls: 'kt-mastery-topic', text: topic });
                    const barTrack = masteryItem.createDiv({ cls: 'kt-mastery-track' });
                    const barFill = barTrack.createDiv({ cls: 'kt-mastery-fill' });
                    barFill.style.width = `${Math.round(mastery * 100)}%`;
                    masteryItem.createSpan({ cls: 'kt-mastery-percent', text: `${Math.round(mastery * 100)}%` });
                }
            }
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
