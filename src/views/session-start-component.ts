import { NoteChunk, QuestionType } from '../types';

export class SessionStartComponent {
    private container: HTMLElement;
    private chunks: NoteChunk[];
    private noteTitle: string;
    private onStart: (selectedChunks: NoteChunk[], types: QuestionType[], count: number) => void;
    private dueCount: number;
    private onDashboard: (() => void) | null;
    private rootEl: HTMLElement | null = null;

    constructor(
        container: HTMLElement,
        chunks: NoteChunk[],
        noteTitle: string,
        onStart: (selectedChunks: NoteChunk[], types: QuestionType[], count: number) => void,
        dueCount: number = 0,
        onDashboard: (() => void) | null = null
    ) {
        this.container = container;
        this.chunks = chunks;
        this.noteTitle = noteTitle;
        this.onStart = onStart;
        this.dueCount = dueCount;
        this.onDashboard = onDashboard;
        this.render();
    }

    render(): void {
        this.rootEl = this.container.createDiv({ cls: 'kt-start-screen' });

        this.rootEl.createEl('h2', { text: 'Knowledge trainer' });

        if (this.chunks.length === 0) {
            this.rootEl.createEl('p', {
                text: 'Откройте заметку и нажмите на иконку мозга, чтобы начать тренировку.',
                cls: 'kt-notice',
            });
            return;
        }

        // Current note info
        const noteInfo = this.rootEl.createDiv({ cls: 'kt-current-note' });
        noteInfo.createEl('p', { text: 'Тренировка по заметке:' });
        noteInfo.createEl('h3', { text: this.noteTitle });
        noteInfo.createEl('p', {
            text: `${this.chunks.length} ${this.getSectionsWord(this.chunks.length)} для изучения`,
            cls: 'kt-note-meta',
        });

        if (this.dueCount > 0) {
            noteInfo.createEl('p', {
                text: `${this.dueCount} ${this.getCardsWord(this.dueCount)} на повторение`,
                cls: 'kt-due-notice',
            });
        }

        // Question format section
        this.rootEl.createEl('h3', { text: 'Формат вопросов:' });

        const typesContainer = this.rootEl.createDiv({ cls: 'kt-types-list' });

        const typeOptions: { type: QuestionType; label: string }[] = [
            { type: 'flashcard', label: 'Флеш-карточки' },
            { type: 'quiz', label: 'Квиз' },
            { type: 'open', label: 'Открытые вопросы' },
        ];

        const typeCheckboxes: { checkbox: HTMLInputElement; type: QuestionType }[] = [];

        for (const opt of typeOptions) {
            const typeItem = typesContainer.createDiv({ cls: 'kt-type-item' });
            const label = typeItem.createEl('label', { cls: 'kt-type-label' });
            const checkbox = label.createEl('input', { type: 'checkbox' });
            checkbox.checked = true;
            label.createSpan({ text: ` ${opt.label}` });
            typeCheckboxes.push({ checkbox, type: opt.type });
        }

        // Question count
        const countContainer = this.rootEl.createDiv({ cls: 'kt-count-container' });
        countContainer.createEl('label', { text: 'Количество вопросов: ', cls: 'kt-count-label' });
        const countInput = countContainer.createEl('input', {
            type: 'number',
            cls: 'kt-count-input',
        });
        countInput.value = '5';
        countInput.min = '1';
        countInput.max = '30';

        // Start button
        const startBtn = this.rootEl.createEl('button', {
            text: 'Начать тренировку',
            cls: 'kt-start-btn',
        });

        startBtn.addEventListener('click', () => {
            const selectedTypes: QuestionType[] = [];
            for (const { checkbox, type } of typeCheckboxes) {
                if (checkbox.checked) {
                    selectedTypes.push(type);
                }
            }

            const count = Math.max(1, Math.min(30, parseInt(countInput.value) || 5));

            if (selectedTypes.length === 0) {
                const notice = this.rootEl!.createDiv({ cls: 'kt-notice' });
                notice.setText('Выберите хотя бы один формат вопросов.');
                setTimeout(() => notice.remove(), 3000);
                return;
            }

            this.onStart(this.chunks, selectedTypes, count);
        });

        // Dashboard button
        if (this.onDashboard) {
            const dashBtn = this.rootEl.createEl('button', {
                text: 'Статистика',
                cls: 'kt-nav-btn',
            });
            dashBtn.addEventListener('click', () => this.onDashboard!());
        }
    }

    private getSectionsWord(n: number): string {
        if (n % 10 === 1 && n % 100 !== 11) return 'секция';
        if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'секции';
        return 'секций';
    }

    private getCardsWord(n: number): string {
        if (n % 10 === 1 && n % 100 !== 11) return 'карточка';
        if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'карточки';
        return 'карточек';
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }
}
