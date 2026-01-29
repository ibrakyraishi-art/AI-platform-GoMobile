'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, TrendingUp, AlertTriangle, CheckCircle, Calendar, Filter } from 'lucide-react';

export default function AIAnalysisPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedPivotTable, setSelectedPivotTable] = useState('');
  const [datasets, setDatasets] = useState<any[]>([]);
  const [pivotTables, setPivotTables] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState('last_7_days');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Загружаем данные из localStorage
  useEffect(() => {
    const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
    const loadedPivotTables = JSON.parse(localStorage.getItem('pivotTables') || '[]');
    setDatasets(loadedDatasets);
    setPivotTables(loadedPivotTables);
  }, []);

  // Фильтруем сводные таблицы по выбранному датасету
  const filteredPivotTables = selectedDataset 
    ? pivotTables.filter(p => p.datasetId === selectedDataset)
    : pivotTables;

  const handleAnalyze = async () => {
    if (!prompt) return;

    setLoading(true);

    try {
      // TODO: Вызов API для анализа
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Мок-данные для демонстрации
      setAnalysis({
        prompt,
        analysis: `Проведя анализ данных за указанный период, можно выделить несколько ключевых наблюдений:\n\n1. **Динамика показателей**: Средний CPC составляет $2.45, что на 15% выше среднерыночного значения для данной категории.\n\n2. **Эффективность кампаний**: Кампания "Brand Awareness" показывает лучший CTR (3.2%), в то время как кампания "Conversion" имеет самый высокий ROI (187%).\n\n3. **Временные паттерны**: Наблюдается значительный рост активности в выходные дни, с пиком в субботу (на 42% выше среднего).`,
        insights: [
          'CPC на 15% выше среднерыночного - стоит пересмотреть стратегию ставок',
          'Кампания "Brand Awareness" имеет высокий CTR, но низкую конверсию',
          'Выходные дни показывают на 42% больше активности - возможность для масштабирования',
          'Источник "Facebook" демонстрирует лучший ROI среди всех каналов'
        ],
        recommendations: [
          'Увеличить бюджет на выходные дни, когда активность пользователей максимальна',
          'Оптимизировать целевые страницы для кампании "Brand Awareness"',
          'Снизить ставки в будние дни с 9:00 до 12:00, когда конверсия минимальна',
          'Перераспределить 20-30% бюджета с низкоэффективных источников на Facebook',
          'Провести A/B тестирование креативов для улучшения CTR на Google Ads'
        ],
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error analyzing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          AI-анализ данных
        </h1>
        <p className="text-gray-400 text-lg">
          Получите умные выводы и рекомендации на основе ваших данных
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Панель ввода */}
        <div className="lg:col-span-2 space-y-6">
          {/* Выбор данных */}
          <div className="glass-card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Filter className="w-6 h-6 text-orange-400" />
              Выберите данные для анализа
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Датасет <span className="text-orange-400">*</span>
                </label>
                <select
                  value={selectedDataset}
                  onChange={(e) => {
                    setSelectedDataset(e.target.value);
                    setSelectedPivotTable(''); // Сбрасываем выбор сводной при смене датасета
                  }}
                  className="input w-full"
                >
                  <option value="">Выберите датасет</option>
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.fields?.length || 0} полей)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Сводная таблица (опционально)
                </label>
                <select
                  value={selectedPivotTable}
                  onChange={(e) => setSelectedPivotTable(e.target.value)}
                  className="input w-full"
                  disabled={!selectedDataset}
                >
                  <option value="">Все данные датасета</option>
                  {filteredPivotTables.map((pivot) => (
                    <option key={pivot.id} value={pivot.id}>
                      {pivot.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Если не выбрана - анализируются все данные датасета
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Период данных
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">Все данные</option>
                  <option value="last_7_days">Последние 7 дней</option>
                  <option value="last_14_days">Последние 14 дней</option>
                  <option value="last_30_days">Последние 30 дней</option>
                  <option value="last_90_days">Последние 90 дней</option>
                  <option value="current_month">Текущий месяц</option>
                  <option value="last_month">Прошлый месяц</option>
                </select>
              </div>
            </div>
          </div>

          {/* Промпт */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Что вы хотите узнать?
            </h2>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: Проанализируй динамику CPC за последний месяц, обрати внимание на кампании с высоким расходом, но низкой конверсией. Дай рекомендации по оптимизации."
              rows={6}
              className="input w-full resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !prompt || !selectedDataset}
              className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Анализирую...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Анализировать
                </>
              )}
            </button>
          </div>

          {/* Результаты анализа */}
          {analysis && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Результаты анализа
              </h2>

              {/* Анализ */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Детальный анализ
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {analysis.analysis}
                  </p>
                </div>
              </div>

              {/* Выводы */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Ключевые выводы
                </h3>
                <ul className="space-y-2">
                  {analysis.insights.map((insight: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-green-600 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Рекомендации */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Рекомендации
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-orange-600 font-bold mt-1">{index + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель с примерами */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Примеры промптов
            </h3>

            <div className="space-y-3">
              <PromptExample
                title="Анализ эффективности"
                prompt="Проанализируй эффективность рекламных кампаний за последний месяц. На какие кампании стоит увеличить бюджет?"
                onClick={() => setPrompt('Проанализируй эффективность рекламных кампаний за последний месяц. На какие кампании стоит увеличить бюджет?')}
              />

              <PromptExample
                title="Оптимизация расходов"
                prompt="Найди кампании с высоким CPC и низкой конверсией. Дай рекомендации по оптимизации."
                onClick={() => setPrompt('Найди кампании с высоким CPC и низкой конверсией. Дай рекомендации по оптимизации.')}
              />

              <PromptExample
                title="Временные паттерны"
                prompt="Проанализируй динамику метрик по дням недели и времени суток. В какое время лучше показывать рекламу?"
                onClick={() => setPrompt('Проанализируй динамику метрик по дням недели и времени суток. В какое время лучше показывать рекламу?')}
              />

              <PromptExample
                title="Сравнение источников"
                prompt="Сравни эффективность разных рекламных источников (Facebook, Google, TikTok) по ROI."
                onClick={() => setPrompt('Сравни эффективность разных рекламных источников (Facebook, Google, TikTok) по ROI.')}
              />
            </div>
          </div>

          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Советы по написанию промптов
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Будьте конкретны в вопросах</li>
              <li>• Указывайте период анализа</li>
              <li>• Называйте конкретные метрики</li>
              <li>• Запрашивайте рекомендации</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptExample({
  title,
  prompt,
  onClick,
}: {
  title: string;
  prompt: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
        {title}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-300">
        {prompt}
      </div>
    </button>
  );
}
