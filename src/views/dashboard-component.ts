import { ProgressData } from '../types';

export class DashboardComponent {
    private container: HTMLElement;
    private stats: ProgressData['stats'];
    private dueCount: number;
    private onRepeat: () => void;
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        stats: ProgressData['stats'],
        dueCount: number,
        onRepeat: () => void
    ) {
        this.container = container;
        this.stats = stats;
        this.dueCount = dueCount;
        this.onRepeat = onRepeat;
        this.render();
    }

    render(): void {
        this.rootEl = this.container.createDiv({ cls: 'kt-dashboard' });

        // --- Streak section ---
        const streakSection = this.rootEl.createDiv({ cls: 'kt-dashboard-streak' });

        const streakLine = streakSection.createDiv({ cls: 'kt-dashboard-streak-main' });
        streakLine.setText(`🔥 Серия: ${this.stats.streakDays} дней`);

        const totalLine = streakSection.createDiv({ cls: 'kt-dashboard-streak-total' });
        totalLine.setText(`Всего повторений: ${this.stats.totalReviews}`);

        if (this.stats.lastReviewDate) {
            const dateLine = streakSection.createDiv({ cls: 'kt-dashboard-streak-date' });
            dateLine.setText(`Последнее повторение: ${this.stats.lastReviewDate}`);
        }

        // --- Mastery by topic section ---
        const masteryEntries = Object.entries(this.stats.masteryByTopic);
        if (masteryEntries.length > 0) {
            const masterySection = this.rootEl.createDiv({ cls: 'kt-dashboard-mastery' });
            masterySection.createEl('h3', { text: 'Владение по темам' });

            for (const [topic, mastery] of masteryEntries) {
                const percent = Math.round(mastery * 100);

                const item = masterySection.createDiv({ cls: 'kt-mastery-item' });

                const label = item.createDiv({ cls: 'kt-mastery-label' });
                label.setText(topic);

                const barTrack = item.createDiv({ cls: 'kt-mastery-bar' });
                const barFill = barTrack.createDiv({ cls: 'kt-mastery-fill' });
                barFill.style.width = `${percent}%`;

                if (percent < 40) {
                    barFill.addClass('kt-mastery-red');
                } else if (percent <= 70) {
                    barFill.addClass('kt-mastery-yellow');
                } else {
                    barFill.addClass('kt-mastery-green');
                }

                const valueEl = item.createDiv({ cls: 'kt-mastery-value' });
                valueEl.setText(`${percent}%`);
            }
        }

        // --- Due cards section ---
        const dueSection = this.rootEl.createDiv({ cls: 'kt-dashboard-due' });
        dueSection.createDiv({
            cls: 'kt-dashboard-due-text',
            text: `Карточек на повторение: ${this.dueCount}`,
        });

        if (this.dueCount > 0) {
            const repeatBtn = dueSection.createEl('button', {
                text: 'Повторить',
                cls: 'kt-start-btn',
            });
            repeatBtn.addEventListener('click', () => {
                this.onRepeat();
            });
        }
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }
}
