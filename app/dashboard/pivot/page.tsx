'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Edit, Trash2, Download } from 'lucide-react';

export default function PivotTablesPage() {
  const [pivotTables, setPivotTables] = useState<any[]>([]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Сводные таблицы
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Создавайте группировки и агрегации данных
          </p>
        </div>
        <Link href="/dashboard/pivot/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать таблицу
        </Link>
      </div>

      {pivotTables.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет сводных таблиц
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Создайте сводную таблицу для анализа данных
          </p>
          <Link href="/dashboard/pivot/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать первую таблицу
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pivotTables.map((table) => (
            <PivotTableCard key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  );
}

function PivotTableCard({ table }: { table: any }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {table.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Группировки: {table.groupBy?.join(', ')} • Метрики: {table.metrics?.join(', ')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-secondary p-2" title="Скачать">
            <Download className="w-4 h-4" />
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
