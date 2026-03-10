import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TrainerSettings, DEFAULT_SETTINGS, VIEW_TYPE_TRAINER, NoteChunk, IQuestionGenerator } from './types';
import { NoteParser } from './parser';
import { MockGenerator, ClaudeGenerator, OpenAIGenerator } from './generator';
import { ProgressTracker } from './progress';
import { QuestionCache } from './cache';
import { TrainerSettingTab } from './settings';
import { TrainerView } from './views/trainer-view';

export default class KnowledgeTrainerPlugin extends Plugin {
  settings!: TrainerSettings;
  parser!: NoteParser;
  progress!: ProgressTracker;
  cache!: QuestionCache;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.parser = new NoteParser(this.app);
    this.progress = new ProgressTracker(this.app, this.manifest.dir!);
    await this.progress.load();
    this.cache = new QuestionCache(this.app, this.manifest.dir!);
    await this.cache.load();
    this.cache.clearExpired(7);

    this.registerView(VIEW_TYPE_TRAINER, (leaf: WorkspaceLeaf) => new TrainerView(leaf));

    this.addRibbonIcon('brain', 'Knowledge trainer', () => {
      void this.activateView();
    });

    this.addCommand({
      id: 'start-training',
      name: 'Start training session',
      callback: () => {
        void this.activateView();
      },
    });

    this.addSettingTab(new TrainerSettingTab(this.app, this));

    // Auto-update when user switches to a different file
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        void this.updateViewIfOpen();
      })
    );
  }

  async activateView(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      await this.openView([], 'Нет открытого файла');
      return;
    }

    const parsed = await this.parser.parseNote(activeFile);
    const chunks = this.parser.chunkByHeadings(parsed);
    await this.openView(chunks, parsed.title);
  }

  /**
   * If trainer view is already open, update it with the current file's data.
   * Does NOT open the view if it's not already visible.
   */
  private async updateViewIfOpen(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_TRAINER);
    if (existing.length === 0) return;

    const view = existing[0].view as TrainerView;
    if (view.isSessionActive()) return; // Don't interrupt an active session

    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      view.setNoteData([], 'Нет открытого файла');
      return;
    }

    const parsed = await this.parser.parseNote(activeFile);
    const chunks = this.parser.chunkByHeadings(parsed);
    view.setSettings(this.settings);
    view.setGenerator(this.createGenerator());
    view.setProgressTracker(this.progress);
    view.setCache(this.cache);
    view.setNoteData(chunks, parsed.title);
  }

  private async openView(chunks: NoteChunk[], noteTitle: string): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_TRAINER);

    let leaf: WorkspaceLeaf;
    if (existing.length > 0) {
      leaf = existing[0];
    } else {
      const rightLeaf = this.app.workspace.getRightLeaf(false);
      if (!rightLeaf) return;
      await rightLeaf.setViewState({
        type: VIEW_TYPE_TRAINER,
        active: true,
      });
      leaf = rightLeaf;
    }

    await this.app.workspace.revealLeaf(leaf);

    const view = leaf.view as TrainerView;
    view.setSettings(this.settings);
    view.setGenerator(this.createGenerator());
    view.setProgressTracker(this.progress);
    view.setCache(this.cache);
    view.setNoteData(chunks, noteTitle);
  }

  private createGenerator(): IQuestionGenerator {
    if (this.settings.useMockData) {
      return new MockGenerator();
    }

    if (this.settings.provider === 'anthropic') {
      return new ClaudeGenerator(
        this.settings.apiKey,
        this.settings.generationModel,
        this.settings.evaluationModel,
        this.settings.language
      );
    }

    // OpenAI, OpenRouter, Custom — all use OpenAI-compatible API
    return new OpenAIGenerator(
      this.settings.apiKey,
      this.settings.baseUrl,
      this.settings.generationModel,
      this.settings.evaluationModel,
      this.settings.language
    );
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  onunload(): void {
    // Cleanup handled by Obsidian's view unregistration
  }
}
