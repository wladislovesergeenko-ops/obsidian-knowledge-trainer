import { FlashcardQuestion } from '../types';

export class FlashcardComponent {
    private container: HTMLElement;
    private question: FlashcardQuestion;
    private onResult: (score: number, answer: string) => void;
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        question: FlashcardQuestion,
        onResult: (score: number, answer: string) => void
    ) {
        this.container = container;
        this.question = question;
        this.onResult = onResult;
        this.render();
    }

    render(): void {
        this.rootEl = this.container.createDiv({ cls: 'kt-flashcard' });

        const inner = this.rootEl.createDiv({ cls: 'kt-flashcard-inner' });

        const front = inner.createDiv({ cls: 'kt-flashcard-front' });
        front.createEl('p', { text: this.question.question });

        const back = inner.createDiv({ cls: 'kt-flashcard-back' });
        back.createEl('p', { text: this.question.answer });

        let flipped = false;
        let ratingShown = false;

        this.rootEl.addEventListener('click', (e) => {
            // Don't toggle if clicking on rating buttons
            if ((e.target as HTMLElement).closest('.kt-rating-buttons')) {
                return;
            }

            if (!flipped) {
                flipped = true;
                this.rootEl!.addClass('flipped');

                if (!ratingShown) {
                    ratingShown = true;
                    this.showRatingButtons();
                }
            }
        });
    }

    private showRatingButtons(): void {
        if (!this.rootEl) return;

        const ratingContainer = this.rootEl.createDiv({ cls: 'kt-rating-buttons' });

        const buttons: { text: string; score: number; cls: string }[] = [
            { text: 'Не знал', score: 1, cls: 'bad' },
            { text: 'Частично', score: 3, cls: 'ok' },
            { text: 'Знал', score: 5, cls: 'good' },
        ];

        for (const btn of buttons) {
            const button = ratingContainer.createEl('button', {
                text: btn.text,
                cls: `kt-rating-btn ${btn.cls}`,
            });

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onResult(btn.score, 'self-rated');
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
