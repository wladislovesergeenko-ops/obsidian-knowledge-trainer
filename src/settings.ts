import { App, PluginSettingTab, Setting } from 'obsidian';
import { TrainerSettings, ApiProvider, PROVIDER_DEFAULTS } from './types';

interface KnowledgeTrainerPlugin {
  settings: TrainerSettings;
  saveSettings(): Promise<void>;
}

export class TrainerSettingTab extends PluginSettingTab {
  private plugin: KnowledgeTrainerPlugin;

  constructor(app: App, plugin: KnowledgeTrainerPlugin) {
    super(app, plugin as any);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Knowledge Trainer Settings' });

    // === Provider ===
    containerEl.createEl('h3', { text: 'API провайдер' });

    new Setting(containerEl)
      .setName('Провайдер')
      .setDesc('Выберите AI-провайдер для генерации вопросов')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('anthropic', 'Anthropic (Claude)')
          .addOption('openai', 'OpenAI (GPT)')
          .addOption('openrouter', 'OpenRouter (любые модели)')
          .addOption('custom', 'Custom (свой URL)')
          .setValue(this.plugin.settings.provider)
          .onChange(async (value) => {
            const provider = value as ApiProvider;
            this.plugin.settings.provider = provider;

            // Auto-fill defaults for selected provider
            const defaults = PROVIDER_DEFAULTS[provider];
            this.plugin.settings.baseUrl = defaults.baseUrl;
            this.plugin.settings.generationModel = defaults.genModel;
            this.plugin.settings.evaluationModel = defaults.evalModel;

            await this.plugin.saveSettings();
            this.display(); // Re-render to update fields
          });
      });

    // API Key
    const keyPlaceholders: Record<ApiProvider, string> = {
      anthropic: 'sk-ant-...',
      openai: 'sk-...',
      openrouter: 'sk-or-...',
      custom: 'your-api-key',
    };

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('API ключ выбранного провайдера')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder(keyPlaceholders[this.plugin.settings.provider])
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
      });

    // Base URL (show for openrouter and custom)
    if (this.plugin.settings.provider === 'openrouter' || this.plugin.settings.provider === 'custom') {
      new Setting(containerEl)
        .setName('Base URL')
        .setDesc('Базовый URL API (без /v1/...)')
        .addText((text) => {
          text
            .setPlaceholder('https://api.example.com')
            .setValue(this.plugin.settings.baseUrl)
            .onChange(async (value) => {
              this.plugin.settings.baseUrl = value;
              await this.plugin.saveSettings();
            });
        });
    }

    // === Models ===
    containerEl.createEl('h3', { text: 'Модели' });

    new Setting(containerEl)
      .setName('Модель для генерации')
      .setDesc('Более дешёвая модель для генерации вопросов')
      .addText((text) => {
        text
          .setPlaceholder(PROVIDER_DEFAULTS[this.plugin.settings.provider].genModel)
          .setValue(this.plugin.settings.generationModel)
          .onChange(async (value) => {
            this.plugin.settings.generationModel = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Модель для оценки')
      .setDesc('Более умная модель для оценки открытых ответов')
      .addText((text) => {
        text
          .setPlaceholder(PROVIDER_DEFAULTS[this.plugin.settings.provider].evalModel)
          .setValue(this.plugin.settings.evaluationModel)
          .onChange(async (value) => {
            this.plugin.settings.evaluationModel = value;
            await this.plugin.saveSettings();
          });
      });

    // === Training ===
    containerEl.createEl('h3', { text: 'Тренировка' });

    new Setting(containerEl)
      .setName('Вопросов за сессию')
      .setDesc('Количество вопросов в одной тренировке')
      .addSlider((slider) => {
        slider
          .setLimits(5, 50, 5)
          .setValue(this.plugin.settings.questionsPerSession)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.questionsPerSession = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Язык вопросов')
      .setDesc('Язык генерируемых вопросов')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('ru', 'Русский')
          .addOption('en', 'English')
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as 'ru' | 'en';
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Mock режим')
      .setDesc('Тестовые данные вместо API (для разработки)')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.useMockData)
          .onChange(async (value) => {
            this.plugin.settings.useMockData = value;
            await this.plugin.saveSettings();
          });
      });

    // === Format ratios ===
    containerEl.createEl('h3', { text: 'Соотношение форматов' });

    new Setting(containerEl)
      .setName('Флеш-карточки %')
      .addSlider((slider) => {
        slider
          .setLimits(0, 100, 10)
          .setValue(this.plugin.settings.questionRatio.flashcard)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.questionRatio.flashcard = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Квизы %')
      .addSlider((slider) => {
        slider
          .setLimits(0, 100, 10)
          .setValue(this.plugin.settings.questionRatio.quiz)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.questionRatio.quiz = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Открытые вопросы %')
      .addSlider((slider) => {
        slider
          .setLimits(0, 100, 10)
          .setValue(this.plugin.settings.questionRatio.open)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.questionRatio.open = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
