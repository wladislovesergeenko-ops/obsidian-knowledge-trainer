import { OpenQuestion, IQuestionGenerator } from '../types';

export class OpenQuestionComponent {
    private container: HTMLElement;
    private question: OpenQuestion;
    private generator: IQuestionGenerator;
    private onResult: (score: number, answer: string) => void;
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        question: OpenQuestion,
        generator: IQuestionGenerator,
        onResult: (score: number, answer: string) => void
    ) {
        this.container = container;
        this.question = question;
        this.generator = generator;
        this.onResult = onResult;
        this.render();
    }

    render(): void {
        this.rootEl = this.container.createDiv({ cls: 'kt-open' });

        this.rootEl.createDiv({ cls: 'kt-open-question', text: this.question.question });

        const textarea = this.rootEl.createEl('textarea', {
            cls: 'kt-open-textarea',
            attr: { placeholder: 'Введите ваш ответ...' },
        });

        const submitBtn = this.rootEl.createEl('button', {
            text: 'Проверить ответ',
            cls: 'kt-open-submit',
        });

        let submitted = false;

        submitBtn.addEventListener('click', () => {
            const userAnswer = textarea.value.trim();
            if (!userAnswer || submitted) return;

            submitted = true;
            submitBtn.disabled = true;
            submitBtn.setText('Проверяю...');
            textarea.disabled = true;

            this.generator.evaluateAnswer(this.question, userAnswer).then((evaluation) => {
                // Remove submit button
                submitBtn.remove();

                // Show evaluation
                const evalContainer = this.rootEl!.createDiv({ cls: 'kt-evaluation' });

                const scoreDiv = evalContainer.createDiv({ cls: `kt-score score-${evaluation.score}` });
                scoreDiv.setText(`${evaluation.score} / 5`);

                evalContainer.createDiv({ cls: 'kt-feedback', text: evaluation.feedback });

                const details = evalContainer.createEl('details');
                details.createEl('summary', { text: 'Эталонный ответ' });
                details.createDiv({ cls: 'kt-reference', text: evaluation.referenceAnswer });

                // Show next button
                this.rootEl!.createEl('button', {
                    text: 'Далее',
                    cls: 'kt-nav-next',
                });

                this.onResult(evaluation.score, userAnswer);
            }).catch(() => {
                submitBtn.setText('Ошибка. Попробуйте ещё раз.');
                submitBtn.disabled = false;
                textarea.disabled = false;
                submitted = false;
            });
        });
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }
}
