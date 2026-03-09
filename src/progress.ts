import { App } from 'obsidian';
import { ProgressData, CardProgress, ReviewEntry, QuestionType } from './types';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export class ProgressTracker {
  private data: ProgressData = {
    cards: {},
    stats: {
      totalReviews: 0,
      streakDays: 0,
      lastReviewDate: '',
      masteryByTopic: {},
    },
  };

  constructor(private app: App, private pluginDir: string) {}

  async load(): Promise<void> {
    const filePath = this.pluginDir + '/progress.json';
    try {
      const raw = await this.app.vault.adapter.read(filePath);
      const parsed = JSON.parse(raw) as ProgressData;
      this.data = parsed;
    } catch {
      // File not found or invalid JSON — use defaults
      this.data = {
        cards: {},
        stats: {
          totalReviews: 0,
          streakDays: 0,
          lastReviewDate: '',
          masteryByTopic: {},
        },
      };
    }
  }

  async save(): Promise<void> {
    const filePath = this.pluginDir + '/progress.json';
    const json = JSON.stringify(this.data, null, 2);
    await this.app.vault.adapter.write(filePath, json);
  }

  recordReview(
    questionId: string,
    sourceNote: string,
    type: QuestionType,
    score: number,
    responseTimeMs: number
  ): void {
    // Create card if it doesn't exist
    if (!this.data.cards[questionId]) {
      this.data.cards[questionId] = {
        sourceNote,
        type,
        easeFactor: 2.5,
        intervalDays: 0,
        nextReview: today(),
        history: [],
      };
    }

    const card = this.data.cards[questionId];

    // Map score (1-5) to SM-2 quality (0-5)
    const qualityMap: Record<number, number> = {
      1: 0,
      2: 1,
      3: 3,
      4: 4,
      5: 5,
    };
    const quality = qualityMap[score] ?? 0;

    // SM-2 interval calculation
    const repetition = card.history.length;
    let interval: number;

    if (quality >= 3) {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(card.intervalDays * card.easeFactor);
      }
    } else {
      interval = 1;
    }

    // SM-2 ease factor update
    const newEaseFactor = Math.max(
      1.3,
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    card.easeFactor = newEaseFactor;
    card.intervalDays = interval;
    card.nextReview = addDays(today(), interval);

    // Push review entry to history
    const entry: ReviewEntry = {
      date: today(),
      score,
      responseTimeMs,
    };
    card.history.push(entry);

    // Update stats
    this.data.stats.totalReviews++;

    // Update streak
    const todayStr = today();
    const yesterdayStr = yesterday();

    if (this.data.stats.lastReviewDate === yesterdayStr) {
      this.data.stats.streakDays++;
    } else if (this.data.stats.lastReviewDate === todayStr) {
      // Same day, keep streak as is
    } else {
      this.data.stats.streakDays = 1;
    }
    this.data.stats.lastReviewDate = todayStr;

    // Update mastery by topic
    // Collect all reviews for this sourceNote across all cards
    const relevantScores: number[] = [];
    for (const cardId of Object.keys(this.data.cards)) {
      const c = this.data.cards[cardId];
      if (c.sourceNote === sourceNote) {
        const last5 = c.history.slice(-5);
        for (const h of last5) {
          relevantScores.push(h.score);
        }
      }
    }
    // Take the last 5 scores from this topic and compute mastery (0-1)
    const recentScores = relevantScores.slice(-5);
    const sum = recentScores.reduce((a, b) => a + b, 0);
    this.data.stats.masteryByTopic[sourceNote] = sum / (5 * 5); // max score is 5, 5 reviews

    this.save();
  }

  getDueCards(): string[] {
    const todayStr = today();
    const dueIds: string[] = [];
    for (const [id, card] of Object.entries(this.data.cards)) {
      if (card.nextReview <= todayStr) {
        dueIds.push(id);
      }
    }
    return dueIds;
  }

  getStats(): ProgressData['stats'] {
    return this.data.stats;
  }

  getData(): ProgressData {
    return this.data;
  }
}
