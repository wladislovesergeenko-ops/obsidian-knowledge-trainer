# Obsidian Knowledge Trainer

AI-powered training plugin for Obsidian that generates flashcards, quizzes, and open questions from your notes.

## Architecture

```
src/
  main.ts              # Plugin entry point, commands, ribbon icon, auto-update on file switch
  types.ts             # All shared TypeScript interfaces, provider config, constants
  parser.ts            # NoteParser: reads .md files, chunks by headings
  generator.ts         # MockGenerator + ClaudeGenerator + OpenAIGenerator
  cache.ts             # QuestionCache: caches questions per note hash, auto-expire 7 days
  progress.ts          # SM-2 spaced repetition algorithm, progress.json storage
  settings.ts          # Plugin settings tab (provider, API key, models, mock mode)
  views/
    trainer-view.ts           # Main ItemView, manages session flow
    session-start-component.ts # Start screen: current note info + format selection
    flashcard-component.ts    # Flashcard with flip and self-rating (1/3/5)
    quiz-component.ts         # 4-option quiz with correct/incorrect feedback
    open-question-component.ts # Free-text answer + AI evaluation
    results-component.ts      # Session results summary + progress stats
    dashboard-component.ts    # Progress dashboard: streak, mastery bars, due cards
```

## Key Design Decisions

- **Current note mode**: plugin trains on the currently open note, auto-updates on file switch
- **Mock mode** enabled by default (`useMockData: true`) — no API key needed for testing
- **Three generators**: MockGenerator, ClaudeGenerator (Anthropic), OpenAIGenerator (OpenAI/OpenRouter/Custom)
- **Multi-provider**: Anthropic, OpenAI, OpenRouter, any OpenAI-compatible API
- **SM-2 algorithm** for spaced repetition (same as Anki), progress persisted to JSON
- **Question caching** — generated questions cached per note hash, invalidated on content change, auto-expire 7 days, max 50 notes
- **CSS uses Obsidian variables** for dark/light theme compatibility
- **Single-column layout** — optimized for narrow sidebar panel
- **BYOK model** — users bring their own API key, no backend needed

## Build & Deploy

```bash
npm run build
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/knowledge-trainer/
```

## Links

- **GitHub**: https://github.com/wladislovesergeenko-ops/obsidian-knowledge-trainer
- **Release**: https://github.com/wladislovesergeenko-ops/obsidian-knowledge-trainer/releases/tag/1.0.0
- **Obsidian PR**: https://github.com/obsidianmd/obsidian-releases/pull/10875
- **Boosty**: https://boosty.to/wladislove/donate

## Test Vault

Vault path: `/Users/wladislove/Desktop/Vladislav/`
Test data: `3. Курс по Телеграм/` — 9 markdown files about Telegram channel management.

## Bugs Fixed

- `setAvailableChunks` didn't re-render start screen after async loading
- Default `scanTags: ['study']` matched no notes — changed to empty array
- Flashcard CSS `flipped` class was added to wrong element (inner vs root)
- Flashcard used absolute positioning causing overflow — switched to display toggle
- Quiz 2x2 grid caused text overflow in sidebar — changed to single column
- Container `max-width: 700px` caused clipping in sidebar — removed

## Development Timeline (2026-03-09 → 2026-03-10)

Built in one evening session using Claude Code (Opus 4.6).

### Phase 1: Scaffold + Core (4 parallel agents, ~5 min)
- Config files, types, parser, generator, views, settings, main

### Phase 2: Bug Fixes + UX (main conversation, ~20 min)
- 6 UI bugs fixed during live testing in Obsidian
- Switched from vault-wide to current-note mode
- Added auto-update on file switch

### Phase 3: Multi-provider (main conversation, ~10 min)
- Added OpenAI/OpenRouter/Custom support
- Provider selector with auto-filled defaults

### Phase 4: Features (3 parallel agents, ~5 min)
- Progress tracking wired to SM-2
- Dashboard component with stats
- Question caching

### Phase 5: Publication (~10 min)
- GitHub repo created and pushed
- Release 1.0.0 published
- PR submitted to Obsidian Community Plugins
- README with full docs

### Token Usage

| Component | Tokens | Duration |
|-----------|--------|----------|
| Agent batch 1: Scaffold (4 agents) | 130,272 | ~5 min |
| Agent batch 2: Features (3 agents) | 127,619 | ~5 min |
| Main conversation (planning + fixes) | ~200,000 (est.) | ~40 min |
| **Grand total** | **~460,000** | **~50 min** |

### Estimated API Cost

Model: Claude Opus 4.6 ($15/M input, $75/M output)
- Rough estimate: **~$15-18**

### Parallel Agents Strategy

Key decision — launching **parallel agents** instead of sequential development:

1. Each agent worked in isolated context (~30-50K tokens each)
2. Batch 1 (4 agents): scaffold, core logic, UI views, data layer — all in 5 min
3. Batch 2 (3 agents): progress wiring, dashboard, caching — all in 5 min
4. Main context stayed clean — no code bloat, no context compression needed
5. After agents, main context used only for targeted bug fixes — fast and cheap

**Result:** 7 agents total, ~10 min parallel work replaced ~60 min sequential. Main conversation stayed lightweight for interactive debugging.

### What was built

- 15 source files + configs, ~3,700 lines of TypeScript
- Fully working Obsidian plugin, tested on real vault
- 3 question formats: flashcards, quiz, open questions
- SM-2 spaced repetition with persistent progress
- Progress dashboard with streak, mastery, due cards
- Multi-provider: Anthropic, OpenAI, OpenRouter, Custom
- Question caching (7-day TTL, hash-based invalidation)
- Auto-update on file switch
- Mock mode for API-free testing
- Published to GitHub with release
- PR submitted to Obsidian Community Plugins
- 6 UI bugs found and fixed during live testing
