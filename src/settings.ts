import { App, PluginSettingTab, Setting } from 'obsidian';
import { TrainerSettings } from './types';

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

    // 1. API Key
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Anthropic API key for Claude')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('sk-ant-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
      });

    // 2. Generation model
    new Setting(containerEl)
      .setName('Модель для генерации')
      .setDesc('Модель Claude для генерации вопросов')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('claude-haiku-4-5-20251001', 'claude-haiku-4-5-20251001')
          .addOption('claude-sonnet-4-6-20250514', 'claude-sonnet-4-6-20250514')
          .setValue(this.plugin.settings.generationModel)
          .onChange(async (value) => {
            this.plugin.settings.generationModel = value;
            await this.plugin.saveSettings();
          });
      });

    // 3. Evaluation model
    new Setting(containerEl)
      .setName('Модель для оценки')
      .setDesc('Модель Claude для оценки ответов')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('claude-haiku-4-5-20251001', 'claude-haiku-4-5-20251001')
          .addOption('claude-sonnet-4-6-20250514', 'claude-sonnet-4-6-20250514')
          .setValue(this.plugin.settings.evaluationModel)
          .onChange(async (value) => {
            this.plugin.settings.evaluationModel = value;
            await this.plugin.saveSettings();
          });
      });

    // 4. Scan folders
    new Setting(containerEl)
      .setName('Папки для сканирования')
      .setDesc('Через запятую, например: Marketing,Business/Frameworks')
      .addText((text) => {
        text
          .setPlaceholder('Marketing,Business/Frameworks')
          .setValue(this.plugin.settings.scanFolders.join(','))
          .onChange(async (value) => {
            this.plugin.settings.scanFolders = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          });
      });

    // 5. Scan tags
    new Setting(containerEl)
      .setName('Теги для сканирования')
      .setDesc('Через запятую, без #, например: study,learn')
      .addText((text) => {
        text
          .setPlaceholder('study,learn')
          .setValue(this.plugin.settings.scanTags.join(','))
          .onChange(async (value) => {
            this.plugin.settings.scanTags = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          });
      });

    // 6. Questions per session
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

    // 7. Language
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

    // 8. Mock mode
    new Setting(containerEl)
      .setName('Mock режим')
      .setDesc('Использовать тестовые данные вместо API (для разработки)')
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

    // 9. Flashcard %
    new Setting(containerEl)
      .setName('Флеш-карточки %')
      .setDesc('Процент флеш-карточек в сессии')
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

    // 10. Quiz %
    new Setting(containerEl)
      .setName('Квизы %')
      .setDesc('Процент квизов в сессии')
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

    // 11. Open %
    new Setting(containerEl)
      .setName('Открытые вопросы %')
      .setDesc('Процент открытых вопросов в сессии')
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
