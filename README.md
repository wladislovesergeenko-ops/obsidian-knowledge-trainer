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

The plugin parses your note's content, splits it by headings into chunks, and sends them to your AI provider to generate relevant questions. Switching between notes auto-updates the trainer.

## Supported AI Providers

| Provider | Models | API Key |
|----------|--------|---------|
| **Anthropic** (Claude) | claude-haiku-4-5, claude-sonnet-4-6 | [console.anthropic.com](https://console.anthropic.com/) |
| **OpenAI** (GPT) | gpt-4o-mini, gpt-4o | [platform.openai.com](https://platform.openai.com/) |
| **OpenRouter** | Any model (Claude, GPT, Llama, Mistral...) | [openrouter.ai](https://openrouter.ai/) |
| **Custom** | Any OpenAI-compatible API | Your server URL |

## Installation

### From Obsidian Community Plugins (coming soon)

Search for "Knowledge Trainer" in Settings → Community Plugins.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/wladislovesergeenko-ops/obsidian-knowledge-trainer/releases)
2. Create folder: `<your-vault>/.obsidian/plugins/knowledge-trainer/`
3. Copy the three files into that folder
4. Restart Obsidian
5. Enable the plugin in Settings → Community Plugins

## Setup

1. Open Settings → Knowledge Trainer
2. Choose your AI provider (Anthropic, OpenAI, OpenRouter, or Custom)
3. Paste your API key
4. Disable "Mock mode"
5. You're ready to train!

You can try the plugin without an API key — Mock mode is enabled by default and provides sample questions for testing.

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Provider | Anthropic | AI provider for question generation |
| API Key | — | API key for the selected provider |
| Generation model | claude-haiku-4-5 | Cheaper model for generating questions |
| Evaluation model | claude-sonnet-4-6 | Smarter model for evaluating open answers |
| Questions per session | 5 | How many questions per training |
| Language | Russian | Language for generated questions (Russian / English) |
| Mock mode | On | Use test data without API calls |

## Cost

The plugin uses your own API key (BYOK — Bring Your Own Key). Estimated costs for Anthropic:

| Action | Cost |
|--------|------|
| Generate 5 questions (Haiku) | ~$0.002 |
| Evaluate 1 open answer (Sonnet) | ~$0.01 |
| Full session (5 questions, 2 open) | ~$0.03 |
| Daily training for a month | ~$0.90 |

Costs vary by provider. OpenRouter often offers competitive pricing across models.

## Features

### Question Formats

**Flashcards** — See the question → click to reveal the answer → rate yourself: "Didn't know" / "Partially" / "Knew"

**Quiz** — 4 answer options → pick one → see if you're correct with explanation

**Open Questions** — Write your answer → AI evaluates it (score 1-5) → see detailed feedback and reference answer

### Spaced Repetition

Progress is tracked using the SM-2 algorithm (same as Anki). Questions you struggle with appear more often. View your stats in the dashboard.

### Question Caching

Generated questions are cached per note. If the note content hasn't changed, the plugin reuses cached questions instead of calling the API again. Cache auto-expires after 7 days.

### Progress Dashboard

Track your learning progress:
- Streak (consecutive days of training)
- Mastery by topic (per-note progress bars)
- Due cards for review

## Support

If you find this plugin useful, consider supporting development:

- [Boosty](https://boosty.to/wladislove/donate) — subscription or one-time donation
- Crypto: BTC / USDT (TRC-20)
- Telegram: contact the author directly

## License

MIT
