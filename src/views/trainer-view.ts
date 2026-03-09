import { ItemView, WorkspaceLeaf } from 'obsidian';
import { VIEW_TYPE_TRAINER, Question, QuestionResult, SessionResult, TrainerSettings, IQuestionGenerator, NoteChunk, QuestionType } from '../types';
import { ProgressTracker } from '../progress';
import { QuestionCache } from '../cache';
import { FlashcardComponent } from './flashcard-component';
import { QuizComponent } from './quiz-component';
import { OpenQuestionComponent } from './open-question-component';
import { ResultsComponent } from './results-component';
import { SessionStartComponent } from './session-start-component';
import { DashboardComponent } from './dashboard-component';

export class TrainerView extends ItemView {
    private settings!: TrainerSettings;
    private generator!: IQuestionGenerator;
    private progressTracker!: ProgressTracker;
    private cache!: QuestionCache;
    private availableChunks: NoteChunk[] = [];
    private noteTitle: string = '';
    private questions: Question[] = [];
    private currentIndex: number = 0;
    private questionResults: QuestionResult[] = [];
    private sessionStartTime: number = 0;
    private currentComponent: { destroy: () => void } | null = null;
    private progressBarEl: HTMLElement | null = null;
    private questionStartTime: number = 0;

    getViewType(): string {
        return VIEW_TYPE_TRAINER;
    }

    getDisplayText(): string {
        return 'Knowledge Trainer';
    }

    getIcon(): string {
        return 'brain';
    }

    isSessionActive(): boolean {
        return this.questions.length > 0;
    }

    setSettings(settings: TrainerSettings): void {
        this.settings = settings;
    }

    setGenerator(generator: IQuestionGenerator): void {
        this.generator = generator;
    }

    setProgressTracker(tracker: ProgressTracker): void {
        this.progressTracker = tracker;
    }

    setCache(cache: QuestionCache): void {
        this.cache = cache;
    }

    setNoteData(chunks: NoteChunk[], noteTitle: string): void {
        this.availableChunks = chunks;
        this.noteTitle = noteTitle;
        // Re-render start screen with new data
        if (this.questions.length === 0) {
            this.showStartScreen();
        }
    }

    async onOpen(): Promise<void> {
        this.contentEl.empty();
        this.contentEl.addClass('kt-container');
        this.showStartScreen();
    }

    private showStartScreen(): void {
        this.destroyCurrentComponent();
        this.contentEl.empty();
        this.progressBarEl = null;
        this.questions = [];
        this.currentIndex = 0;
        this.questionResults = [];

        const dueCount = this.progressTracker ? this.progressTracker.getDueCards().length : 0;

        this.currentComponent = new SessionStartComponent(
            this.contentEl,
            this.availableChunks,
            this.noteTitle,
            async (selectedChunks: NoteChunk[], types: QuestionType[], count: number) => {
                await this.startSession(selectedChunks, types, count);
            },
            dueCount,
            () => this.showDashboard()
        );
    }

    private async startSession(selectedChunks: NoteChunk[], types: QuestionType[], count: number): Promise<void> {
        this.destroyCurrentComponent();
        this.contentEl.empty();

        const loading = this.contentEl.createDiv({ cls: 'kt-loading' });
        loading.setText('Генерация вопросов...');

        // Check cache (skip for mock data)
        const useMock = this.settings?.useMockData;
        const notePath = selectedChunks.length > 0 ? selectedChunks[0].notePath : '';
        let contentHash = '';
        let cached: Question[] | null = null;

        if (!useMock && this.cache && notePath) {
            contentHash = this.cache.computeHash(selectedChunks);
            cached = this.cache.getQuestions(notePath, contentHash);
        }

        if (cached && cached.length > 0) {
            this.questions = cached;
        } else {
            try {
                this.questions = await this.generator.generateQuestions(selectedChunks, types, count);
            } catch (error) {
                loading.setText('Ошибка при генерации вопросов. Попробуйте ещё раз.');
                const retryBtn = this.contentEl.createEl('button', {
                    text: 'Назад',
                    cls: 'kt-start-btn',
                });
                retryBtn.addEventListener('click', () => this.showStartScreen());
                return;
            }

            if (this.questions.length === 0) {
                loading.setText('Не удалось сгенерировать вопросы.');
                const retryBtn = this.contentEl.createEl('button', {
                    text: 'Назад',
                    cls: 'kt-start-btn',
                });
                retryBtn.addEventListener('click', () => this.showStartScreen());
                return;
            }

            // Store in cache (skip for mock data)
            if (!useMock && this.cache && notePath && contentHash) {
                await this.cache.setQuestions(notePath, contentHash, this.questions);
            }
        }

        this.currentIndex = 0;
        this.questionResults = [];
        this.sessionStartTime = Date.now();

        loading.remove();
        this.showQuestion(0);
    }

    private showQuestion(index: number): void {
        this.destroyCurrentComponent();
        this.contentEl.empty();

        if (index >= this.questions.length) {
            this.showResults();
            return;
        }

        this.currentIndex = index;
        this.questionStartTime = Date.now();

        this.renderProgressBar();

        const questionContainer = this.contentEl.createDiv({ cls: 'kt-question-container' });
        const question = this.questions[index];

        questionContainer.createDiv({ cls: 'kt-source-note', text: question.sourceNote });

        const onResult = (score: number, answer: string) => {
            const timeMs = Date.now() - this.questionStartTime;

            const result: QuestionResult = {
                questionId: question.id,
                type: question.type,
                userAnswer: answer,
                correct: score >= 4,
                score,
                timeMs,
            };

            this.questionResults.push(result);

            // Record review in progress tracker for spaced repetition
            if (this.progressTracker) {
                this.progressTracker.recordReview(
                    question.id,
                    question.sourceNote,
                    question.type,
                    score,
                    timeMs
                );
            }

            if (question.type === 'flashcard') {
                this.showQuestion(index + 1);
            }
        };

        switch (question.type) {
            case 'flashcard':
                this.currentComponent = new FlashcardComponent(
                    questionContainer,
                    question,
                    onResult
                );
                break;
            case 'quiz':
                this.currentComponent = new QuizComponent(
                    questionContainer,
                    question,
                    (score: number, answer: string) => {
                        onResult(score, answer);
                        const nextBtn = questionContainer.querySelector('.kt-nav-next') as HTMLButtonElement | null;
                        if (nextBtn) {
                            nextBtn.addEventListener('click', () => {
                                this.showQuestion(index + 1);
                            });
                        }
                    }
                );
                break;
            case 'open':
                this.currentComponent = new OpenQuestionComponent(
                    questionContainer,
                    question,
                    this.generator,
                    (score: number, answer: string) => {
                        onResult(score, answer);
                        const nextBtn = questionContainer.querySelector('.kt-nav-next') as HTMLButtonElement | null;
                        if (nextBtn) {
                            nextBtn.addEventListener('click', () => {
                                this.showQuestion(index + 1);
                            });
                        }
                    }
                );
                break;
        }
    }

    private showResults(): void {
        this.destroyCurrentComponent();
        this.contentEl.empty();

        const totalQuestions = this.questionResults.length;
        const correct = this.questionResults.filter(r => r.score >= 4).length;
        const incorrect = this.questionResults.filter(r => r.score <= 1).length;
        const partial = totalQuestions - correct - incorrect;
        const totalScore = this.questionResults.reduce((sum, r) => sum + r.score, 0);
        const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
        const timeSpentMs = Date.now() - this.sessionStartTime;

        const sessionResult: SessionResult = {
            date: new Date().toISOString(),
            totalQuestions,
            correct,
            incorrect,
            partial,
            averageScore,
            timeSpentMs,
            questionResults: this.questionResults,
        };

        const progressStats = this.progressTracker ? this.progressTracker.getStats() : undefined;

        this.currentComponent = new ResultsComponent(
            this.contentEl,
            sessionResult,
            () => {
                this.showStartScreen();
            },
            progressStats
        );
    }

    private showDashboard(): void {
        this.destroyCurrentComponent();
        this.contentEl.empty();

        const stats = this.progressTracker ? this.progressTracker.getStats() : {
            totalReviews: 0, streakDays: 0, lastReviewDate: '', masteryByTopic: {}
        };
        const dueCount = this.progressTracker ? this.progressTracker.getDueCards().length : 0;

        this.currentComponent = new DashboardComponent(
            this.contentEl,
            stats,
            dueCount,
            () => this.showStartScreen()
        );
    }

    private renderProgressBar(): void {
        this.progressBarEl = this.contentEl.createDiv({ cls: 'kt-progress-bar' });

        const total = this.questions.length;
        const current = this.currentIndex + 1;

        this.progressBarEl.createDiv({ cls: 'kt-progress-text', text: `Вопрос ${current} из ${total}` });

        const track = this.progressBarEl.createDiv({ cls: 'kt-progress-track' });
        const fill = track.createDiv({ cls: 'kt-progress-fill' });
        fill.style.width = `${(current / total) * 100}%`;
    }

    private destroyCurrentComponent(): void {
        if (this.currentComponent) {
            this.currentComponent.destroy();
            this.currentComponent = null;
        }
    }

    async onClose(): Promise<void> {
        this.destroyCurrentComponent();
        this.contentEl.empty();
    }
}
