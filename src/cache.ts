import { App } from 'obsidian';
import { Question, NoteChunk } from './types';

interface CacheEntry {
  contentHash: string;
  questions: Question[];
  timestamp: number;
}

interface CacheData {
  entries: Record<string, CacheEntry>;
}

const MAX_ENTRIES = 50;

export class QuestionCache {
  private data: CacheData = { entries: {} };

  constructor(private app: App, private pluginDir: string) {}

  async load(): Promise<void> {
    const filePath = this.pluginDir + '/cache.json';
    try {
      const raw = await this.app.vault.adapter.read(filePath);
      const parsed = JSON.parse(raw) as CacheData;
      if (parsed && typeof parsed.entries === 'object') {
        this.data = parsed;
      }
    } catch {
      // File not found or invalid JSON — start with empty cache
      this.data = { entries: {} };
    }
  }

  async save(): Promise<void> {
    const filePath = this.pluginDir + '/cache.json';
    const json = JSON.stringify(this.data, null, 2);
    await this.app.vault.adapter.write(filePath, json);
  }

  getQuestions(notePath: string, contentHash: string): Question[] | null {
    const entry = this.data.entries[notePath];
    if (!entry) return null;
    if (entry.contentHash !== contentHash) return null;
    return entry.questions;
  }

  async setQuestions(notePath: string, contentHash: string, questions: Question[]): Promise<void> {
    this.data.entries[notePath] = {
      contentHash,
      questions,
      timestamp: Date.now(),
    };
    this.trimToMax();
    await this.save();
  }

  computeHash(chunks: NoteChunk[]): string {
    const combined = chunks.map(c => c.content).join('\n---\n');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash | 0;
    }
    return (hash >>> 0).toString(16);
  }

  clearExpired(maxAgeDays: number = 7): void {
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const entries = this.data.entries;
    for (const key of Object.keys(entries)) {
      if (now - entries[key].timestamp > maxAgeMs) {
        delete entries[key];
      }
    }
  }

  /**
   * Keep only the most recent MAX_ENTRIES entries to keep cache.json small.
   */
  private trimToMax(): void {
    const keys = Object.keys(this.data.entries);
    if (keys.length <= MAX_ENTRIES) return;

    // Sort by timestamp ascending (oldest first)
    const sorted = keys.sort(
      (a, b) => this.data.entries[a].timestamp - this.data.entries[b].timestamp
    );

    const toRemove = sorted.slice(0, keys.length - MAX_ENTRIES);
    for (const key of toRemove) {
      delete this.data.entries[key];
    }
  }
}
