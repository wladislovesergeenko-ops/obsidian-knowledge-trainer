import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { TrainerSettings, DEFAULT_SETTINGS, VIEW_TYPE_TRAINER, NoteChunk } from './types';
import { NoteParser } from './parser';
import { MockGenerator, ClaudeGenerator } from './generator';
import { ProgressTracker } from './progress';
import { TrainerSettingTab } from './settings';
import { TrainerView } from './views/trainer-view';

export default class KnowledgeTrainerPlugin extends Plugin {
  settings!: TrainerSettings;
  parser!: NoteParser;
  progress!: ProgressTracker;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.parser = new NoteParser(this.app);
    this.progress = new ProgressTracker(this.app, this.manifest.dir!);
    await this.progress.load();

    this.registerView(VIEW_TYPE_TRAINER, (leaf: WorkspaceLeaf) => new TrainerView(leaf));

    this.addRibbonIcon('brain', 'Knowledge Trainer', () => {
      this.activateView();
    });

    this.addCommand({
      id: 'start-training',
      name: 'Start training session',
      callback: () => {
        this.activateView();
      },
    });

    this.addSettingTab(new TrainerSettingTab(this.app, this));
  }

  async activateView(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      // No file open — still open the view with empty state
      await this.openView([], 'No file');
      return;
    }

    const parsed = await this.parser.parseNote(activeFile);
    const chunks = this.parser.chunkByHeadings(parsed);
    await this.openView(chunks, parsed.title);
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

    this.app.workspace.revealLeaf(leaf);

    const view = leaf.view as TrainerView;

    view.setSettings(this.settings);

    let generator;
    if (this.settings.useMockData) {
      generator = new MockGenerator();
    } else {
      generator = new ClaudeGenerator(
        this.settings.apiKey,
        this.settings.generationModel,
        this.settings.evaluationModel,
        this.settings.language
      );
    }
    view.setGenerator(generator);
    view.setNoteData(chunks, noteTitle);
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
