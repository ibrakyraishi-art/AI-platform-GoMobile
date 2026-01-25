'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Calculator } from 'lucide-react';
import type { Field, FieldType } from '@/types';

export default function NewDatasetPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dataSourceId, setDataSourceId] = useState('');
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем источники данных из localStorage
  useEffect(() => {
    const sources = JSON.parse(localStorage.getItem('dataSources') || '[]');
    setDataSources(sources);
  }, []);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        name: '',
        displayName: '',
        type: 'string',
        isCalculated: false,
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Создаем датасет
      const dataset = {
        id: crypto.randomUUID(),
        name,
        dataSourceId,
        fields,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Сохраняем в localStorage
      const existingDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
      existingDatasets.push(dataset);
      localStorage.setItem('datasets', JSON.stringify(existingDatasets));
      
      router.push('/dashboard/datasets');
    } catch (error) {
      console.error('Error creating dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Создать датасет
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Настройте поля и создайте вычисляемые метрики
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
                Название датасета <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Рекламные кампании - январь 2026"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Источник данных <span className="text-orange-400">*</span>
              </label>
              <select
                value={dataSourceId}
                onChange={(e) => setDataSourceId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Выберите источник</option>
                {dataSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              {dataSources.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Сначала подключите источник данных
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Поля */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Поля
            </h2>
            <button
              type="button"
              onClick={addField}
              className="btn btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Добавить поле
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Добавьте поля для вашего датасета</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              💡 Вычисляемые поля
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Создайте метрики на основе других полей. Например:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 list-disc list-inside mt-2 space-y-1">
              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{ spend} / {clicks}'}</code> = CPC</li>
              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'({clicks} / {impressions}) * 100'}</code> = CTR</li>
              <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'({revenue} - {spend}) / {spend} * 100'}</code> = ROI</li>
            </ul>
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
            disabled={loading || !name || fields.length === 0}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать датасет'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldEditor({
  field,
  onUpdate,
  onRemove,
}: {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onRemove: () => void;
}) {
  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'string', label: 'Строка' },
    { value: 'number', label: 'Число' },
    { value: 'float', label: 'Дробное число' },
    { value: 'integer', label: 'Целое число' },
    { value: 'date', label: 'Дата' },
    { value: 'datetime', label: 'Дата и время' },
    { value: 'boolean', label: 'Да/Нет' },
    { value: 'currency', label: 'Валюта' },
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Название */}
        <div className="col-span-4">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Название поля
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="clicks"
            className="input w-full text-sm"
            required
          />
        </div>

        {/* Отображаемое имя */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Отображаемое имя
          </label>
          <input
            type="text"
            value={field.displayName}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            placeholder="Клики"
            className="input w-full text-sm"
          />
        </div>

        {/* Тип */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Тип
          </label>
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
            className="input w-full text-sm"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопки */}
        <div className="col-span-2 flex items-end gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ isCalculated: !field.isCalculated })}
            className={`p-2 rounded ${
              field.isCalculated
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
            }`}
            title="Вычисляемое поле"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded bg-red-100 text-red-600 dark:bg-red-900/20 hover:bg-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Формула (если вычисляемое) */}
        {field.isCalculated && (
          <div className="col-span-12">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Формула
            </label>
            <input
              type="text"
              value={field.formula || ''}
              onChange={(e) => onUpdate({ formula: e.target.value })}
              placeholder="{spend} / {clicks}"
              className="input w-full text-sm font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Используйте {'{fieldName}'} для ссылки на другие поля
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
