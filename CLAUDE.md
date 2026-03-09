# Obsidian Knowledge Trainer

AI-powered training plugin for Obsidian that generates flashcards, quizzes, and open questions from your notes.

## Architecture

```
src/
  main.ts              # Plugin entry point, commands, ribbon icon, auto-update on file switch
  types.ts             # All shared TypeScript interfaces, provider config, constants
  parser.ts            # NoteParser: reads .md files, chunks by headings
  generator.ts         # MockGenerator + ClaudeGenerator + OpenAIGenerator
  progress.ts          # SM-2 spaced repetition algorithm, progress.json storage
  settings.ts          # Plugin settings tab (provider, API key, models, mock mode)
  views/
    trainer-view.ts           # Main ItemView, manages session flow
    session-start-component.ts # Start screen: current note info + format selection
    flashcard-component.ts    # Flashcard with flip and self-rating (1/3/5)
    quiz-component.ts         # 4-option quiz with correct/incorrect feedback
    open-question-component.ts # Free-text answer + AI evaluation
    results-component.ts      # Session results summary
    dashboard-component.ts    # Progress dashboard with stats and mastery
```

## Key Design Decisions

- **Current note mode**: plugin trains on the currently open note, auto-updates on file switch
- **Mock mode** enabled by default (`useMockData: true`) — no API key needed for testing
- **Three generators**: MockGenerator, ClaudeGenerator (Anthropic), OpenAIGenerator (OpenAI/OpenRouter/Custom)
- **Multi-provider**: Anthropic, OpenAI, OpenRouter, any OpenAI-compatible API
- **SM-2 algorithm** for spaced repetition (same as Anki), progress persisted to JSON
- **Question caching** — generated questions cached per note hash, invalidated on content change
- **CSS uses Obsidian variables** for dark/light theme compatibility
- **Single-column layout** — optimized for narrow sidebar panel

## Build & Deploy

```bash
npm run build
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/knowledge-trainer/
```

## Test Vault

Test data located at: `/Users/wladislove/Desktop/Vladislav/3. Курс по Телеграм/`
9 markdown files about Telegram channel management.

Vault path: `/Users/wladislove/Desktop/Vladislav/`

## Bugs Fixed

- `setAvailableChunks` didn't re-render start screen after async loading
- Default `scanTags: ['study']` matched no notes — changed to empty array
- Flashcard CSS `flipped` class was added to wrong element (inner vs root)
- Flashcard used absolute positioning causing overflow — switched to display toggle
- Quiz 2x2 grid caused text overflow in sidebar — changed to single column
- Container `max-width: 700px` caused clipping in sidebar — removed

## Development Cost (2026-03-09)

Built in one session using Claude Code (Opus 4.6).

### Token Usage

| Component | Tokens | Duration |
|-----------|--------|----------|
| Agent: Scaffold (configs, CSS) | 26,747 | 145s |
| Agent: Core logic (types, parser, generator) | 32,578 | 141s |
| Agent: UI views (6 components) | 38,540 | 297s |
| Agent: Progress, settings, main | 32,407 | 128s |
| **Agents total** | **130,272** | **~5 min** |
| Main conversation (planning + bug fixes) | ~150,000 (est.) | ~20 min |
| **Grand total** | **~280,000** | **~25 min** |

### Estimated API Cost

Model: Claude Opus 4.6 ($15/M input, $75/M output)

Rough estimate assuming 70% input / 30% output:
- Input: ~196K tokens = ~$2.94
- Output: ~84K tokens = ~$6.30
- **Total: ~$9-10**

### Parallel Agents Strategy

Ключевое решение — запуск **4 агентов параллельно** вместо последовательной разработки:

1. Каждый агент работал в изолированном контексте (~30K tokens каждый)
2. Все 4 завершились за ~5 минут (вместо ~20 минут последовательно)
3. Основной контекст разговора остался чистым — не засорился тысячами строк кода
4. **Не потребовалось сжатие контекста** — без агентов ~130K tokens кода попали бы в основной контекст, что привело бы к context compression и потере деталей ранних решений
5. После сборки агентов основной контекст использовался только для точечных баг-фиксов — быстро и дёшево

**Вывод:** параллельные агенты дали выигрыш и по времени (~4x быстрее), и по качеству (каждый агент фокусировался на своём модуле с полным контекстом типов).

### What was built

- 20+ files, 3,700+ lines of code
- Fully working Obsidian plugin with mock mode
- 3 question formats: flashcards, quiz, open questions
- SM-2 spaced repetition system with progress tracking
- Multi-provider: Anthropic, OpenAI, OpenRouter, Custom
- Auto-update on file switch
- Question caching to save API tokens
- Progress dashboard with stats
- 6 UI bug fixes during testing
