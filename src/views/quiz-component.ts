import { QuizQuestion } from '../types';

export class QuizComponent {
    private container: HTMLElement;
    private question: QuizQuestion;
    private onResult: (score: number, answer: string) => void;
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        question: QuizQuestion,
        onResult: (score: number, answer: string) => void
    ) {
        this.container = container;
        this.question = question;
        this.onResult = onResult;
        this.render();
    }

    render(): void {
        this.rootEl = this.container.createDiv({ cls: 'kt-quiz' });

        this.rootEl.createDiv({ cls: 'kt-quiz-question', text: this.question.question });

        const optionsContainer = this.rootEl.createDiv({ cls: 'kt-quiz-options' });

        const optionButtons: HTMLButtonElement[] = [];
        let answered = false;

        for (let i = 0; i < this.question.options.length; i++) {
            const optionBtn = optionsContainer.createEl('button', {
                text: this.question.options[i],
                cls: 'kt-quiz-option',
            });
            optionButtons.push(optionBtn);

            optionBtn.addEventListener('click', () => {
                if (answered) return;
                answered = true;

                // Disable all buttons
                for (const btn of optionButtons) {
                    btn.disabled = true;
                }

                // Mark selected
                optionBtn.addClass('selected');

                // Mark correct answer
                optionButtons[this.question.correctIndex].addClass('correct');

                // If wrong, mark as incorrect
                const isCorrect = i === this.question.correctIndex;
                if (!isCorrect) {
                    optionBtn.addClass('incorrect');
                }

                // Show explanation
                this.rootEl!.createDiv({
                    cls: 'kt-quiz-explanation',
                    text: this.question.explanation,
                });

                // Show next button
                this.rootEl!.createEl('button', {
                    text: 'Далее',
                    cls: 'kt-nav-next',
                });

                const score = isCorrect ? 5 : 1;
                const selectedText = this.question.options[i];

                this.onResult(score, selectedText);
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
