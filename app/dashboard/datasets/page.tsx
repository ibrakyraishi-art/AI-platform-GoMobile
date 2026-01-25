'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Table2, Edit, Trash2, Eye } from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Датасеты
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Настройте поля и создайте вычисляемые метрики
          </p>
        </div>
        <Link href="/dashboard/datasets/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать датасет
        </Link>
      </div>

      {datasets.length === 0 ? (
        <div className="card text-center py-12">
          <Table2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет датасетов
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Создайте датасет на основе подключенного источника данных
          </p>
          <Link href="/dashboard/datasets/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать первый датасет
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      )}
    </div>
  );
}

function DatasetCard({ dataset }: { dataset: any }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Table2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {dataset.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {dataset.fields?.length || 0} полей • {dataset.rowCount || 0} строк
            </p>
            <div className="flex flex-wrap gap-2">
              {dataset.fields?.slice(0, 5).map((field: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                >
                  {field.name}
                </span>
              ))}
              {dataset.fields?.length > 5 && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                  +{dataset.fields.length - 5} еще
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-secondary p-2" title="Просмотр">
            <Eye className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary p-2" title="Редактировать">
            <Edit className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary p-2 text-red-600" title="Удалить">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
