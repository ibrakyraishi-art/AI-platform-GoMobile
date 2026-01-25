'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import type { GroupByConfig, AggregationConfig, GroupByPeriod, AggregationType } from '@/types';

export default function NewPivotTablePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [rows, setRows] = useState<GroupByConfig[]>([]);
  const [values, setValues] = useState<AggregationConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Доступные поля (TODO: загружать из выбранного датасета)
  const availableFields = [
    { name: 'date', label: 'Дата', type: 'date' },
    { name: 'campaign', label: 'Кампания', type: 'string' },
    { name: 'source', label: 'Источник', type: 'string' },
    { name: 'impressions', label: 'Показы', type: 'number' },
    { name: 'clicks', label: 'Клики', type: 'number' },
    { name: 'spend', label: 'Расход', type: 'number' },
    { name: 'conversions', label: 'Конверсии', type: 'number' },
  ];

  const addRow = () => {
    setRows([...rows, { field: '', period: undefined }]);
  };

  const updateRow = (index: number, updates: Partial<GroupByConfig>) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], ...updates };
    setRows(newRows);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const addValue = () => {
    setValues([...values, { field: '', type: 'sum' }]);
  };

  const updateValue = (index: number, updates: Partial<AggregationConfig>) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], ...updates };
    setValues(newValues);
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Создать сводную таблицу
      console.log('Creating pivot table:', { name, datasetId, rows, values });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard/pivot');
    } catch (error) {
      console.error('Error creating pivot table:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Создать сводную таблицу
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Настройте группировки и агрегации
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Основная информация
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Анализ по дням и кампаниям"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Датасет <span className="text-red-500">*</span>
              </label>
              <select
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Выберите датасет</option>
                <option value="1">Рекламные кампании - январь 2026</option>
                <option value="2">Performance Data</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Строки (Группировки) */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Строки (Группировки)
              </h2>
              <button
                type="button"
                onClick={addRow}
                className="btn btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Добавьте группировку</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <RowEditor
                    key={index}
                    row={row}
                    fields={availableFields}
                    onUpdate={(updates) => updateRow(index, updates)}
                    onRemove={() => removeRow(index)}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              <p className="text-blue-900 dark:text-blue-200">
                💡 Строки - это группировки данных. Например, по датам, кампаниям или источникам.
              </p>
            </div>
          </div>

          {/* Значения (Метрики) */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Значения (Метрики)
              </h2>
              <button
                type="button"
                onClick={addValue}
                className="btn btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>

            {values.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Добавьте метрику</p>
              </div>
            ) : (
              <div className="space-y-3">
                {values.map((value, index) => (
                  <ValueEditor
                    key={index}
                    value={value}
                    fields={availableFields.filter(f => f.type === 'number')}
                    onUpdate={(updates) => updateValue(index, updates)}
                    onRemove={() => removeValue(index)}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm">
              <p className="text-green-900 dark:text-green-200">
                💡 Значения - это агрегации числовых полей. Например, сумма расходов или среднее CPC.
              </p>
            </div>
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
            disabled={loading || !name || rows.length === 0 || values.length === 0}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать таблицу'}
          </button>
        </div>
      </form>
    </div>
  );
}

function RowEditor({
  row,
  fields,
  onUpdate,
  onRemove,
}: {
  row: GroupByConfig;
  fields: any[];
  onUpdate: (updates: Partial<GroupByConfig>) => void;
  onRemove: () => void;
}) {
  const periods: { value: GroupByPeriod; label: string }[] = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'quarter', label: 'Квартал' },
    { value: 'year', label: 'Год' },
  ];

  const selectedField = fields.find(f => f.name === row.field);
  const isDateField = selectedField?.type === 'date';

  return (
    <div className="flex gap-2">
      <select
        value={row.field}
        onChange={(e) => onUpdate({ field: e.target.value })}
        className="input flex-1"
        required
      >
        <option value="">Выберите поле</option>
        {fields.map((field) => (
          <option key={field.name} value={field.name}>
            {field.label}
          </option>
        ))}
      </select>

      {isDateField && (
        <select
          value={row.period || ''}
          onChange={(e) => onUpdate({ period: e.target.value as GroupByPeriod })}
          className="input w-32"
        >
          <option value="">Период</option>
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="p-2 rounded bg-red-100 text-red-600 dark:bg-red-900/20 hover:bg-red-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ValueEditor({
  value,
  fields,
  onUpdate,
  onRemove,
}: {
  value: AggregationConfig;
  fields: any[];
  onUpdate: (updates: Partial<AggregationConfig>) => void;
  onRemove: () => void;
}) {
  const aggregations: { value: AggregationType; label: string }[] = [
    { value: 'sum', label: 'Сумма' },
    { value: 'avg', label: 'Среднее' },
    { value: 'min', label: 'Минимум' },
    { value: 'max', label: 'Максимум' },
    { value: 'count', label: 'Количество' },
  ];

  return (
    <div className="flex gap-2">
      <select
        value={value.type}
        onChange={(e) => onUpdate({ type: e.target.value as AggregationType })}
        className="input w-32"
        required
      >
        {aggregations.map((agg) => (
          <option key={agg.value} value={agg.value}>
            {agg.label}
          </option>
        ))}
      </select>

      <select
        value={value.field}
        onChange={(e) => onUpdate({ field: e.target.value })}
        className="input flex-1"
        required
      >
        <option value="">Выберите поле</option>
        {fields.map((field) => (
          <option key={field.name} value={field.name}>
            {field.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRemove}
        className="p-2 rounded bg-red-100 text-red-600 dark:bg-red-900/20 hover:bg-red-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
