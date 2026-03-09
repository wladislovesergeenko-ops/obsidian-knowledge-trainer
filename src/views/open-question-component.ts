import { OpenQuestion, EvaluationResult, IQuestionGenerator } from '../types';

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
        }) as HTMLTextAreaElement;

        const submitBtn = this.rootEl.createEl('button', {
            text: 'Проверить ответ',
            cls: 'kt-open-submit',
        }) as HTMLButtonElement;

        let submitted = false;

        submitBtn.addEventListener('click', async () => {
            const userAnswer = textarea.value.trim();
            if (!userAnswer || submitted) return;

            submitted = true;
            submitBtn.disabled = true;
            submitBtn.setText('Проверяю...');
            textarea.disabled = true;

            let evaluation: EvaluationResult;
            try {
                evaluation = await this.generator.evaluateAnswer(this.question, userAnswer);
            } catch (error) {
                submitBtn.setText('Ошибка. Попробуйте ещё раз.');
                submitBtn.disabled = false;
                textarea.disabled = false;
                submitted = false;
                return;
            }

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
        });
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }
}
