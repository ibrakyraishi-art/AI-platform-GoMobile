'use client';

import Link from 'next/link';
import { Plus, BarChart3, PieChart, LineChart, TrendingUp, Table2, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VisualizationsPage() {
  const [visualizations, setVisualizations] = useState<any[]>([]);

  useEffect(() => {
    const loadVisualizations = () => {
      const stored = localStorage.getItem('visualizations') || '[]';
      setVisualizations(JSON.parse(stored));
    };
    loadVisualizations();
  }, []);

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'bar':
      case 'column':
        return <BarChart3 className="w-5 h-5" />;
      case 'line':
      case 'area':
        return <LineChart className="w-5 h-5" />;
      case 'pie':
      case 'donut':
        return <PieChart className="w-5 h-5" />;
      case 'pivot':
        return <Layers className="w-5 h-5" />;
      default:
        return <Table2 className="w-5 h-5" />;
    }
  };

  const getVisualizationTypeName = (type: string) => {
    const types: Record<string, string> = {
      bar: 'Столбчатая',
      column: 'Колонки',
      line: 'Линейная',
      area: 'Область',
      pie: 'Круговая',
      donut: 'Кольцевая',
      scatter: 'Точечная',
      pivot: 'Сводная таблица',
      table: 'Таблица'
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Визуализации</h1>
          <p className="text-gray-400">
            Создавайте графики, диаграммы и сводные таблицы
          </p>
        </div>
        <Link href="/dashboard/visualizations/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать визуализацию
        </Link>
      </div>

      {visualizations.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-gray-800 text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Нет визуализаций
          </h2>
          <p className="text-gray-400 mb-6">
            Создайте первую визуализацию: график, диаграмму или сводную таблицу
          </p>
          <Link href="/dashboard/visualizations/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать визуализацию
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizations.map((viz) => (
            <Link
              key={viz.id}
              href={`/dashboard/visualizations/${viz.id}`}
              className="glass p-6 rounded-xl border border-gray-800 hover:border-orange-500 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                  {getVisualizationIcon(viz.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">
                    {viz.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {getVisualizationTypeName(viz.type)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{viz.datasetName || 'Датасет'}</span>
                    <span>•</span>
                    <span>{new Date(viz.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Информационные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="glass p-6 rounded-xl border border-gray-800">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Графики и диаграммы
          </h3>
          <p className="text-sm text-gray-400">
            Столбчатые, линейные, круговые, точечные и другие типы визуализаций
          </p>
        </div>

        <div className="glass p-6 rounded-xl border border-gray-800">
          <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Сводные таблицы
          </h3>
          <p className="text-sm text-gray-400">
            Полноценные pivot-таблицы со строками, столбцами и вычисляемыми полями
          </p>
        </div>

        <div className="glass p-6 rounded-xl border border-gray-800">
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 mb-4">
            <Table2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Таблицы данных
          </h3>
          <p className="text-sm text-gray-400">
            Интерактивные таблицы с сортировкой, фильтрацией и поиском
          </p>
        </div>
      </div>
    </div>
  );
}
