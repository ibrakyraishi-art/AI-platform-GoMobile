import OpenAI from 'openai';
import type { AIAnalysisRequest, AIAnalysisResponse } from '@/types';

// Используем placeholder если ключ не задан
// Реальный ключ будет передан из localStorage пользователя
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

export class AIAnalyzer {
  /**
   * Анализ данных с помощью GPT
   */
  static async analyzeData(
    request: AIAnalysisRequest,
    data: any[]
  ): Promise<AIAnalysisResponse> {
    try {
      // Подготовка контекста для AI
      const context = this.prepareContext(request, data);
      
      // Системный промпт
      const systemPrompt = `Ты опытный аналитик данных, специализирующийся на мобильном маркетинге и рекламной аналитике.
Твоя задача - анализировать данные из рекламных кампаний и давать конкретные, действенные рекомендации.

При анализе обращай внимание на:
- Тренды и аномалии в метриках (CPC, CTR, CPM, конверсии)
- Эффективность по дням недели и времени
- Сравнение кампаний и источников трафика
- ROI и окупаемость рекламных расходов
- Качество трафика и конверсий

Твой ответ должен быть структурированным:
1. Краткое резюме основных находок
2. Детальный анализ данных
3. Конкретные выводы (insights)
4. Рекомендации с приоритетами`;

      // Пользовательский промпт
      const userPrompt = `${request.prompt}

${context}

Пожалуйста, проанализируй эти данные и дай подробный ответ.`;

      // Запрос к OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const analysisText = completion.choices[0]?.message?.content || '';
      
      // Парсинг ответа для извлечения insights и recommendations
      const { insights, recommendations } = this.parseAnalysis(analysisText);

      return {
        id: crypto.randomUUID(),
        prompt: request.prompt,
        analysis: analysisText,
        insights,
        recommendations,
        createdAt: new Date(),
        metadata: {
          model: completion.model,
          tokensUsed: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw error;
    }
  }

  /**
   * Подготовка контекста для AI
   */
  private static prepareContext(request: AIAnalysisRequest, data: any[]): string {
    let context = '';

    // Добавляем информацию о данных
    context += `\nДанные (${data.length} строк):\n`;
    
    // Выводим первые несколько строк как примеры
    const sampleSize = Math.min(5, data.length);
    const samples = data.slice(0, sampleSize);
    context += JSON.stringify(samples, null, 2);
    
    if (data.length > sampleSize) {
      context += `\n... и еще ${data.length - sampleSize} строк`;
    }

    // Добавляем статистику
    context += '\n\nСтатистика по данным:\n';
    const stats = this.calculateStats(data);
    context += JSON.stringify(stats, null, 2);

    // Добавляем контекст от пользователя
    if (request.context) {
      context += '\n\nДополнительный контекст:\n';
      
      if (request.context.dateRange) {
        context += `Период: ${request.context.dateRange.from.toISOString()} - ${request.context.dateRange.to.toISOString()}\n`;
      }
      
      if (request.context.campaigns && request.context.campaigns.length > 0) {
        context += `Кампании: ${request.context.campaigns.join(', ')}\n`;
      }
      
      if (request.context.metrics && request.context.metrics.length > 0) {
        context += `Метрики для анализа: ${request.context.metrics.join(', ')}\n`;
      }
      
      if (request.context.customContext) {
        context += `\n${request.context.customContext}\n`;
      }
    }

    return context;
  }

  /**
   * Вычисление базовой статистики
   */
  private static calculateStats(data: any[]): any {
    if (data.length === 0) return {};

    const stats: any = {};
    const numericFields = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );

    numericFields.forEach(field => {
      const values = data.map(row => row[field]).filter(v => typeof v === 'number');
      
      if (values.length > 0) {
        stats[field] = {
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });

    return stats;
  }

  /**
   * Парсинг ответа AI для извлечения insights и recommendations
   */
  private static parseAnalysis(text: string): { 
    insights: string[]; 
    recommendations: string[]; 
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Ищем секции с insights (выводы, находки, insights)
    const insightsMatch = text.match(/(?:выводы|insights|находки)[:\s]*([\s\S]*?)(?=рекомендаци|recommendation|$)/i);
    if (insightsMatch) {
      const lines = insightsMatch[1].split('\n')
        .filter(line => line.trim().match(/^[-*•\d.]/))
        .map(line => line.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(line => line.length > 0);
      insights.push(...lines);
    }

    // Ищем секции с recommendations
    const recsMatch = text.match(/(?:рекомендаци|recommendation)[:\s]*([\s\S]*?)$/i);
    if (recsMatch) {
      const lines = recsMatch[1].split('\n')
        .filter(line => line.trim().match(/^[-*•\d.]/))
        .map(line => line.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(line => line.length > 0);
      recommendations.push(...lines);
    }

    return { insights, recommendations };
  }
}
