# Obsidian Knowledge Trainer

AI-powered training plugin for Obsidian that generates flashcards, quizzes, and open questions from your notes.

## Architecture

```
src/
  main.ts              # Plugin entry point, commands, ribbon icon
  types.ts             # All shared TypeScript interfaces and constants
  parser.ts            # NoteParser: reads .md files, chunks by headings
  generator.ts         # MockGenerator + ClaudeGenerator (Anthropic API)
  progress.ts          # SM-2 spaced repetition algorithm, progress.json storage
  settings.ts          # Plugin settings tab (API key, models, mock mode, etc.)
  views/
    trainer-view.ts           # Main ItemView, manages session flow
    session-start-component.ts # Start screen: current note info + format selection
    flashcard-component.ts    # Flashcard with flip and self-rating (1/3/5)
    quiz-component.ts         # 4-option quiz with correct/incorrect feedback
    open-question-component.ts # Free-text answer + AI evaluation
    results-component.ts      # Session results summary
```

## Key Design Decisions

- **Current note mode**: plugin trains on the currently open note (not vault-wide selection)
- **Mock mode** enabled by default (`useMockData: true`) — no API key needed for testing
- **Two generators**: MockGenerator (hardcoded questions) and ClaudeGenerator (API calls)
- **Models**: Haiku 4.5 for generation, Sonnet 4.6 for answer evaluation
- **SM-2 algorithm** for spaced repetition (same as Anki)
- **CSS uses Obsidian variables** for dark/light theme compatibility
- **Single-column quiz layout** — optimized for narrow sidebar panel

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
