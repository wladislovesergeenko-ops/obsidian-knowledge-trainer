# Obsidian Knowledge Trainer

AI-powered training plugin for Obsidian that reads your notes and generates interactive exercises in three formats:

- **Flashcards** — flip cards with self-rating
- **Quizzes** — multiple choice with instant feedback
- **Open questions** — free-text answers evaluated by AI

## How it works

1. Open any note in your vault
2. Click the brain icon in the sidebar (or use Command Palette → "Start training session")
3. Choose question formats and count
4. Train and get instant feedback

The plugin parses your note's content, splits it by headings into chunks, and sends them to Claude API to generate relevant questions.

## Installation

### From Obsidian Community Plugins (coming soon)

Search for "Knowledge Trainer" in Settings → Community Plugins.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/anthropics/obsidian-knowledge-trainer/releases)
2. Create folder: `<your-vault>/.obsidian/plugins/knowledge-trainer/`
3. Copy the three files into that folder
4. Restart Obsidian
5. Enable the plugin in Settings → Community Plugins

## Setup

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Open Settings → Knowledge Trainer
3. Paste your API key
4. Disable "Mock mode"
5. You're ready to train!

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| API Key | — | Your Anthropic API key |
| Generation model | claude-haiku-4-5 | Model for generating questions (cheaper) |
| Evaluation model | claude-sonnet-4-6 | Model for evaluating open answers (smarter) |
| Questions per session | 5 | How many questions per training |
| Language | Russian | Language for generated questions |
| Mock mode | On | Use test data without API calls |

## Cost

The plugin uses your own Anthropic API key (BYOK — Bring Your Own Key).

| Action | Cost |
|--------|------|
| Generate 5 questions | ~$0.002 |
| Evaluate 1 open answer | ~$0.01 |
| Full session (5 questions, 2 open) | ~$0.03 |
| Daily training for a month | ~$0.90 |

## Question Formats

### Flashcards
See the question → click to reveal the answer → rate yourself: "Didn't know" / "Partially" / "Knew"

### Quiz
4 answer options → pick one → see if you're correct with explanation

### Open Questions
Write your answer → AI evaluates it (score 1-5) → see detailed feedback and reference answer

## Spaced Repetition

Progress is tracked using the SM-2 algorithm (same as Anki). Questions you struggle with appear more often.

## Support

If you find this plugin useful, consider supporting development:

- [Boosty](https://boosty.to/) — подписка или разовый донат
- Crypto: BTC / USDT (TRC-20) — адреса в разделе ниже
- Telegram: напишите автору для прямого перевода

## License

MIT
