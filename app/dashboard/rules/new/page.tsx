'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ChevronRight } from 'lucide-react';

export default function NewRulePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [datasets, setDatasets] = useState<any[]>([]);
  const [field, setField] = useState('');
  const [operator, setOperator] = useState('>');
  const [value, setValue] = useState('');
  const [period, setPeriod] = useState('last_7_days');
  const [notificationType, setNotificationType] = useState('browser');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
    setDatasets(loadedDatasets);
  }, []);

  const selectedDataset = datasets.find(d => d.id === datasetId);
  const availableFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'number' || f.type === 'integer' || f.type === 'float' || f.type === 'currency'
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rule = {
        id: crypto.randomUUID(),
        name,
        datasetId,
        field,
        operator,
        value: parseFloat(value),
        period,
        notificationType,
        active: true,
        condition: `${field} ${operator} ${value}`,
        created_at: new Date().toISOString(),
      };

      // Сохраняем через универсальное хранилище
      const supabaseUrl = localStorage.getItem('supabase_url') || '';
      const supabaseKey = localStorage.getItem('supabase_key') || '';
      
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        const { createSupabaseClient, createAutoRule } = await import('@/lib/supabase-client');
        const client = createSupabaseClient(supabaseUrl, supabaseKey);
        await createAutoRule(client, {
          id: rule.id,
          dataset_id: rule.datasetId,
          name: rule.name,
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          period: rule.period,
          notification_type: rule.notificationType,
          active: rule.active,
          condition: rule.condition,
        });
        console.log('✅ Rule saved to Supabase');
      } else {
        const existingRules = JSON.parse(localStorage.getItem('autoRules') || '[]');
        existingRules.push(rule);
        localStorage.setItem('autoRules', JSON.stringify(existingRules));
        console.log('✅ Rule saved to localStorage');
      }
      
      router.push('/dashboard/rules');
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          Создать автоправило
        </h1>
        <p className="text-gray-400 text-lg">
          Настройте условие для автоматических уведомлений
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">
            Основная информация
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Название правила <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Уведомление о высоком CPI"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Датасет <span className="text-orange-400">*</span>
              </label>
              <select
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Выберите датасет</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Условие */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">
            Условие срабатывания
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Период данных
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input w-full"
              >
                <option value="last_7_days">Последние 7 дней</option>
                <option value="last_14_days">Последние 14 дней</option>
                <option value="last_30_days">Последние 30 дней</option>
                <option value="current_month">Текущий месяц</option>
              </select>
            </div>

            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-5">
                <label className="block text-sm font-medium text-white mb-2">
                  Поле <span className="text-orange-400">*</span>
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="input w-full"
                  required
                  disabled={!datasetId}
                >
                  <option value="">Выберите поле</option>
                  {availableFields.map((f: any) => (
                    <option key={f.name} value={f.name}>
                      {f.displayName || f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-white mb-2">
                  Условие
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="input w-full"
                >
                  <option value=">">Больше (&gt;)</option>
                  <option value=">=">Больше или равно (≥)</option>
                  <option value="<">Меньше (&lt;)</option>
                  <option value="<=">Меньше или равно (≤)</option>
                  <option value="=">Равно (=)</option>
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Значение <span className="text-orange-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="45"
                  className="input w-full"
                  required
                />
              </div>
            </div>

            {/* Preview правила */}
            {field && operator && value && (
              <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-sm text-orange-300 font-medium mb-2">
                  Правило будет срабатывать когда:
                </p>
                <div className="flex items-center gap-3 text-lg">
                  <span className="px-4 py-2 bg-dark-800 rounded-lg text-white font-semibold">
                    {field}
                  </span>
                  <ChevronRight className="w-5 h-5 text-orange-400" />
                  <span className="px-4 py-2 bg-dark-800 rounded-lg text-orange-400 font-bold">
                    {operator}
                  </span>
                  <ChevronRight className="w-5 h-5 text-orange-400" />
                  <span className="px-4 py-2 bg-dark-800 rounded-lg text-white font-semibold">
                    {value}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  За период: {period === 'last_7_days' ? 'Последние 7 дней' : period}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Уведомления */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">
            Способ уведомления
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700 transition-colors">
              <input
                type="radio"
                value="browser"
                checked={notificationType === 'browser'}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-5 h-5 text-orange-500"
              />
              <div>
                <div className="font-semibold text-white">Браузер</div>
                <div className="text-sm text-gray-400">Уведомление в браузере</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700 transition-colors opacity-50">
              <input
                type="radio"
                value="email"
                checked={notificationType === 'email'}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-5 h-5 text-orange-500"
                disabled
              />
              <div>
                <div className="font-semibold text-white">Email</div>
                <div className="text-sm text-gray-400">Скоро...</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700 transition-colors opacity-50">
              <input
                type="radio"
                value="telegram"
                checked={notificationType === 'telegram'}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-5 h-5 text-orange-500"
                disabled
              />
              <div>
                <div className="font-semibold text-white">Telegram</div>
                <div className="text-sm text-gray-400">Скоро...</div>
              </div>
            </label>
          </div>
        </div>

        {/* Действия */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading || !name || !datasetId || !field || !value}
            className="btn btn-primary disabled:opacity-50 flex-1"
          >
            {loading ? 'Создание...' : 'Создать правило'}
          </button>
        </div>
      </form>
    </div>
  );
}
