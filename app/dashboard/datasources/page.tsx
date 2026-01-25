'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Database, Trash2, Edit, RefreshCw } from 'lucide-react';

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<any[]>([]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Источники данных
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Подключите Google Sheets, Supabase или базу данных
          </p>
        </div>
        <Link href="/dashboard/datasources/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить источник
        </Link>
      </div>

      {dataSources.length === 0 ? (
        <div className="card text-center py-12">
          <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет подключенных источников
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Начните с подключения Google Sheets или базы данных
          </p>
          <Link href="/dashboard/datasources/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить первый источник
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSources.map((source) => (
            <DataSourceCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}

function DataSourceCard({ source }: { source: any }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Database className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {source.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {source.type}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
        <button className="btn btn-secondary p-2">
          <Edit className="w-4 h-4" />
        </button>
        <button className="btn btn-secondary p-2 text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
