import { requestUrl } from 'obsidian';
import {
  IQuestionGenerator,
  NoteChunk,
  QuestionType,
  Question,
  FlashcardQuestion,
  QuizQuestion,
  OpenQuestion,
  EvaluationResult,
} from './types';

interface RawQuestion {
  type?: string;
  question?: string;
  answer?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  rubric?: string;
  referenceAnswer?: string;
}

interface RawEvaluation {
  score?: number;
  feedback?: string;
  referenceAnswer?: string;
}

// ============================================================
// MockGenerator — hardcoded questions for development/testing
// ============================================================
export class MockGenerator implements IQuestionGenerator {
  generateQuestions(
    chunks: NoteChunk[],
    types: QuestionType[],
    count: number
  ): Promise<Question[]> {
    const sourceNote = chunks.length > 0 ? chunks[0].noteTitle : 'Telegram-канал';

    // --- Flashcards ---
    const flashcards: FlashcardQuestion[] = [
      {
        id: this.generateId(),
        type: 'flashcard',
        sourceNote,
        question: 'Чем Telegram отличается от Instagram в плане алгоритмов?',
        answer:
          'В Telegram нет алгоритмической ленты — подписчик видит каждый пост канала в хронологическом порядке, тогда как в Instagram алгоритм решает, какие посты показывать и в каком порядке.',
      },
      {
        id: this.generateId(),
        type: 'flashcard',
        sourceNote,
        question: 'Что такое Telegram-бот и для чего он используется в каналах?',
        answer:
          'Telegram-бот — это автоматизированный аккаунт, управляемый программой. В каналах боты используются для автопостинга, сбора статистики, обратной связи, проведения конкурсов и интеграции с внешними сервисами.',
      },
      {
        id: this.generateId(),
        type: 'flashcard',
        sourceNote,
        question: 'Какой основной показатель вовлечённости аудитории в Telegram-канале?',
        answer:
          'ERR (Engagement Rate by Reach) — отношение среднего количества просмотров поста к числу подписчиков канала, выраженное в процентах. Хорошим показателем считается ERR выше 40%.',
      },
    ];

    // --- Quiz questions ---
    const quizzes: QuizQuestion[] = [
      {
        id: this.generateId(),
        type: 'quiz',
        sourceNote,
        question: 'Какой формат контента получает наибольший охват в Telegram-каналах?',
        options: [
          'Длинные текстовые посты (более 1000 символов)',
          'Короткие посты с изображением',
          'Голосовые сообщения',
          'Репосты из других каналов',
        ],
        correctIndex: 1,
        explanation:
          'Короткие посты с визуальным контентом получают наибольший охват, так как легко воспринимаются и чаще пересылаются подписчиками.',
      },
      {
        id: this.generateId(),
        type: 'quiz',
        sourceNote,
        question: 'Какой из способов монетизации Telegram-канала является наиболее распространённым?',
        options: [
          'Продажа рекламных постов',
          'Подписка через Telegram Stars',
          'Донаты через ботов',
          'Партнёрские программы',
        ],
        correctIndex: 0,
        explanation:
          'Продажа рекламных постов (интеграций) остаётся самым популярным способом монетизации, особенно для каналов с аудиторией от 5000 подписчиков.',
      },
      {
        id: this.generateId(),
        type: 'quiz',
        sourceNote,
        question: 'Что из перечисленного НЕ является официальной функцией Telegram-каналов?',
        options: [
          'Реакции на посты',
          'Комментарии через привязанную группу',
          'Встроенная аналитика просмотров',
          'Алгоритмическая рекомендация каналов в ленте',
        ],
        correctIndex: 3,
        explanation:
          'Telegram не использует алгоритмическую рекомендательную ленту для каналов. Пользователи видят контент только тех каналов, на которые подписаны, в хронологическом порядке.',
      },
    ];

    // --- Open questions ---
    const openQuestions: OpenQuestion[] = [
      {
        id: this.generateId(),
        type: 'open',
        sourceNote,
        question: 'Опишите 5 способов монетизации Telegram-канала.',
        rubric:
          'Оценивается: полнота (5 способов), конкретность описания, понимание преимуществ и ограничений каждого способа.',
        referenceAnswer:
          '1. Продажа рекламных постов — размещение платных интеграций от рекламодателей. 2. Платная подписка — закрытый контент через Telegram Stars или приватный канал. 3. Партнёрские программы — рекомендация товаров/сервисов за процент от продаж. 4. Продажа собственных продуктов — курсы, консультации, товары. 5. Донаты — добровольные пожертвования от аудитории через ботов или встроенные механизмы.',
      },
      {
        id: this.generateId(),
        type: 'open',
        sourceNote,
        question:
          'Как составить контент-план для Telegram-канала на неделю? Опишите структуру и принципы.',
        rubric:
          'Оценивается: наличие структуры плана, разнообразие типов контента, учёт частоты публикаций, понимание целевой аудитории.',
        referenceAnswer:
          'Контент-план на неделю должен включать: определение 2-3 основных рубрик (экспертный контент, развлекательный, продающий), распределение 5-7 постов по дням с учётом активности аудитории (утро/вечер), чередование форматов (текст, визуал, опросы, видео), 1-2 интерактивных поста для вовлечения, контроль соотношения полезного (70%) и продающего (30%) контента.',
      },
      {
        id: this.generateId(),
        type: 'open',
        sourceNote,
        question:
          'Сравните органические и платные способы продвижения Telegram-канала. Назовите по 3 примера каждого.',
        rubric:
          'Оценивается: правильная классификация (органические vs платные), по 3 примера каждого типа, понимание преимуществ и недостатков.',
        referenceAnswer:
          'Органические способы: 1) взаимный пиар с другими каналами, 2) вирусный контент и репосты, 3) SEO-оптимизация описания канала и индексация в поисковиках. Платные способы: 1) покупка рекламы в других каналах, 2) таргетированная реклама через Telegram Ads, 3) реклама канала через блогеров в других соцсетях (YouTube, Instagram).',
      },
    ];

    // Collect requested question types
    const allMocks: Question[] = [];
    if (types.includes('flashcard')) allMocks.push(...flashcards);
    if (types.includes('quiz')) allMocks.push(...quizzes);
    if (types.includes('open')) allMocks.push(...openQuestions);

    // If no specific types requested, include all
    if (allMocks.length === 0) {
      allMocks.push(...flashcards, ...quizzes, ...openQuestions);
    }

    // Return up to the requested count
    return Promise.resolve(allMocks.slice(0, count));
  }

  evaluateAnswer(
    question: OpenQuestion,
    _userAnswer: string
  ): Promise<EvaluationResult> {
    return Promise.resolve({
      score: 4,
      feedback:
        'Хороший ответ! Вы продемонстрировали понимание основных концепций. Для более высокой оценки добавьте конкретные примеры и углубите анализ.',
      referenceAnswer: question.referenceAnswer,
    });
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================
// ClaudeGenerator — real question generation via Claude API
// ============================================================
export class ClaudeGenerator implements IQuestionGenerator {
  constructor(
    private apiKey: string,
    private genModel: string,
    private evalModel: string,
    private language: string
  ) {}

  async generateQuestions(
    chunks: NoteChunk[],
    types: QuestionType[],
    count: number
  ): Promise<Question[]> {
    if (chunks.length === 0) {
      return [];
    }

    const lang = this.language === 'ru' ? 'русском' : 'английском';
    const typeDescriptions = types
      .map((t) => {
        switch (t) {
          case 'flashcard':
            return '"flashcard" — карточка с вопросом и ответом';
          case 'quiz':
            return '"quiz" — тест с 4 вариантами ответа';
          case 'open':
            return '"open" — открытый вопрос с развёрнутым ответом';
        }
      })
      .join('\n');

    const systemPrompt = `Ты — генератор учебных вопросов. Создавай вопросы на ${lang} языке на основе предоставленного материала.

Формат ответа — строго JSON-массив объектов. Никакого текста вне JSON.

Типы вопросов:
${typeDescriptions}

Структура каждого объекта:

Для flashcard:
{"type": "flashcard", "question": "...", "answer": "..."}

Для quiz:
{"type": "quiz", "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..."}

Для open:
{"type": "open", "question": "...", "rubric": "Критерии оценки...", "referenceAnswer": "..."}

Верни JSON-массив из ${count} вопросов. Распредели типы пропорционально запросу.
Вопросы должны проверять понимание, а не механическое запоминание.`;

    const contentSummary = chunks
      .map(
        (chunk) =>
          `### ${chunk.heading} (из заметки "${chunk.noteTitle}")\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    const userPrompt = `Материал для вопросов:\n\n${contentSummary}\n\nСгенерируй ${count} вопросов следующих типов: ${types.join(', ')}.`;

    try {
      const response = await requestUrl({
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.genModel,
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      });

      const data = response.json;
      const textContent = data.content?.[0]?.text;
      if (!textContent) {
        console.error('Knowledge Trainer: Empty response from Claude API');
        return [];
      }

      const parsed = this.extractJson(textContent);
      if (!Array.isArray(parsed)) {
        console.error('Knowledge Trainer: Response is not a JSON array');
        return [];
      }

      const sourceNote = chunks[0].noteTitle;
      return (parsed as RawQuestion[]).map((item) => this.mapToQuestion(item, sourceNote));
    } catch (error: unknown) {
      console.error('Knowledge Trainer: Failed to generate questions', error);
      return [];
    }
  }

  async evaluateAnswer(
    question: OpenQuestion,
    userAnswer: string
  ): Promise<EvaluationResult> {
    const lang = this.language === 'ru' ? 'русском' : 'английском';

    const systemPrompt = `Ты — преподаватель, оценивающий ответ студента. Отвечай на ${lang} языке.

Оцени ответ по шкале от 1 до 5:
1 — полностью неверно
2 — есть отдельные верные элементы, но ответ в целом неправильный
3 — частично верно, но есть существенные пробелы
4 — в целом верно, незначительные неточности
5 — отлично, полный и точный ответ

Верни строго JSON:
{"score": <число от 1 до 5>, "feedback": "Подробный комментарий...", "referenceAnswer": "Эталонный ответ..."}`;

    const userPrompt = `Вопрос: ${question.question}

Критерии оценки: ${question.rubric}

Эталонный ответ: ${question.referenceAnswer}

Ответ студента: ${userAnswer}

Оцени ответ студента.`;

    try {
      const response = await requestUrl({
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.evalModel,
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      });

      const data = response.json;
      const textContent = data.content?.[0]?.text;
      if (!textContent) {
        console.error('Knowledge Trainer: Empty evaluation response');
        return {
          score: 3,
          feedback: 'Ошибка оценки',
          referenceAnswer: question.referenceAnswer,
        };
      }

      const parsed = this.extractJson(textContent) as RawEvaluation;
      return {
        score: parsed.score ?? 3,
        feedback: parsed.feedback ?? 'Ошибка оценки',
        referenceAnswer: parsed.referenceAnswer ?? question.referenceAnswer,
      };
    } catch (error: unknown) {
      console.error('Knowledge Trainer: Failed to evaluate answer', error);
      return {
        score: 3,
        feedback: 'Ошибка оценки',
        referenceAnswer: question.referenceAnswer,
      };
    }
  }

  private extractJson(text: string): unknown {
    // Try parsing the full text as JSON first
    try {
      return JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        try {
          return JSON.parse(codeBlockMatch[1].trim());
        } catch {
          // fall through
        }
      }

      // Try finding a JSON array or object in the text
      const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          // fall through
        }
      }

      console.error('Knowledge Trainer: Could not extract JSON from response');
      return [];
    }
  }

  private mapToQuestion(item: RawQuestion, sourceNote: string): Question {
    const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    switch (item.type) {
      case 'flashcard':
        return {
          id,
          type: 'flashcard',
          sourceNote,
          question: item.question || '',
          answer: item.answer || '',
        };

      case 'quiz':
        return {
          id,
          type: 'quiz',
          sourceNote,
          question: item.question || '',
          options: item.options || [],
          correctIndex: item.correctIndex ?? 0,
          explanation: item.explanation || '',
        };

      case 'open':
        return {
          id,
          type: 'open',
          sourceNote,
          question: item.question || '',
          rubric: item.rubric || '',
          referenceAnswer: item.referenceAnswer || '',
        };

      default:
        // Default to flashcard if type is unrecognized
        return {
          id,
          type: 'flashcard' as const,
          sourceNote,
          question: item.question || '',
          answer: item.answer || '',
        };
    }
  }
}

// ============================================================
// OpenAIGenerator — works with OpenAI, OpenRouter, and any
// OpenAI-compatible API (Groq, Together, Ollama, etc.)
// ============================================================
export class OpenAIGenerator implements IQuestionGenerator {
  constructor(
    private apiKey: string,
    private baseUrl: string,
    private genModel: string,
    private evalModel: string,
    private language: string
  ) {}

  async generateQuestions(
    chunks: NoteChunk[],
    types: QuestionType[],
    count: number
  ): Promise<Question[]> {
    if (chunks.length === 0) return [];

    const lang = this.language === 'ru' ? 'русском' : 'английском';
    const typeDescriptions = types
      .map((t) => {
        switch (t) {
          case 'flashcard': return '"flashcard" — карточка с вопросом и ответом';
          case 'quiz': return '"quiz" — тест с 4 вариантами ответа';
          case 'open': return '"open" — открытый вопрос с развёрнутым ответом';
        }
      })
      .join('\n');

    const systemPrompt = `Ты — генератор учебных вопросов. Создавай вопросы на ${lang} языке на основе предоставленного материала.

Формат ответа — строго JSON-массив объектов. Никакого текста вне JSON.

Типы вопросов:
${typeDescriptions}

Структура каждого объекта:

Для flashcard:
{"type": "flashcard", "question": "...", "answer": "..."}

Для quiz:
{"type": "quiz", "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..."}

Для open:
{"type": "open", "question": "...", "rubric": "Критерии оценки...", "referenceAnswer": "..."}

Верни JSON-массив из ${count} вопросов. Распредели типы пропорционально запросу.
Вопросы должны проверять понимание, а не механическое запоминание.`;

    const contentSummary = chunks
      .map((chunk) => `### ${chunk.heading} (из заметки "${chunk.noteTitle}")\n${chunk.content}`)
      .join('\n\n---\n\n');

    const userPrompt = `Материал для вопросов:\n\n${contentSummary}\n\nСгенерируй ${count} вопросов следующих типов: ${types.join(', ')}.`;

    try {
      const response = await requestUrl({
        url: `${this.baseUrl}/v1/chat/completions`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.genModel,
          max_tokens: 2000,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      const data = response.json;
      const textContent = data.choices?.[0]?.message?.content;
      if (!textContent) {
        console.error('Knowledge Trainer: Empty response from OpenAI-compatible API');
        return [];
      }

      const parsed = this.extractJson(textContent);
      if (!Array.isArray(parsed)) return [];

      const sourceNote = chunks[0].noteTitle;
      return (parsed as RawQuestion[]).map((item) => this.mapToQuestion(item, sourceNote));
    } catch (error: unknown) {
      console.error('Knowledge Trainer: Failed to generate questions', error);
      return [];
    }
  }

  async evaluateAnswer(
    question: OpenQuestion,
    userAnswer: string
  ): Promise<EvaluationResult> {
    const lang = this.language === 'ru' ? 'русском' : 'английском';

    const systemPrompt = `Ты — преподаватель, оценивающий ответ студента. Отвечай на ${lang} языке.

Оцени ответ по шкале от 1 до 5:
1 — полностью неверно
2 — есть отдельные верные элементы
3 — частично верно, но есть существенные пробелы
4 — в целом верно, незначительные неточности
5 — отлично, полный и точный ответ

Верни строго JSON:
{"score": <число от 1 до 5>, "feedback": "Подробный комментарий...", "referenceAnswer": "Эталонный ответ..."}`;

    const userPrompt = `Вопрос: ${question.question}\n\nКритерии оценки: ${question.rubric}\n\nЭталонный ответ: ${question.referenceAnswer}\n\nОтвет студента: ${userAnswer}\n\nОцени ответ студента.`;

    try {
      const response = await requestUrl({
        url: `${this.baseUrl}/v1/chat/completions`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.evalModel,
          max_tokens: 1000,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      const data = response.json;
      const textContent = data.choices?.[0]?.message?.content;
      if (!textContent) {
        return { score: 3, feedback: 'Ошибка оценки', referenceAnswer: question.referenceAnswer };
      }

      const parsed = this.extractJson(textContent) as RawEvaluation;
      return {
        score: parsed.score ?? 3,
        feedback: parsed.feedback ?? 'Ошибка оценки',
        referenceAnswer: parsed.referenceAnswer ?? question.referenceAnswer,
      };
    } catch (error: unknown) {
      console.error('Knowledge Trainer: Failed to evaluate answer', error);
      return { score: 3, feedback: 'Ошибка оценки', referenceAnswer: question.referenceAnswer };
    }
  }

  private extractJson(text: string): unknown {
    try { return JSON.parse(text); } catch { /* continue */ }
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* continue */ }
    }
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch { /* continue */ }
    }
    return [];
  }

  private mapToQuestion(item: RawQuestion, sourceNote: string): Question {
    const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    switch (item.type) {
      case 'flashcard':
        return { id, type: 'flashcard', sourceNote, question: item.question || '', answer: item.answer || '' };
      case 'quiz':
        return { id, type: 'quiz', sourceNote, question: item.question || '', options: item.options || [], correctIndex: item.correctIndex ?? 0, explanation: item.explanation || '' };
      case 'open':
        return { id, type: 'open', sourceNote, question: item.question || '', rubric: item.rubric || '', referenceAnswer: item.referenceAnswer || '' };
      default:
        return { id, type: 'flashcard' as const, sourceNote, question: item.question || '', answer: item.answer || '' };
    }
  }
}
