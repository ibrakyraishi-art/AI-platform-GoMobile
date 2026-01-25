'use client';

import { Database, Table2, Sparkles, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Добро пожаловать в AI GoMobile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Начните с подключения источника данных
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <QuickActionCard
          icon={<Database className="w-8 h-8" />}
          title="Добавить источник"
          description="Google Sheets, Supabase, БД"
          href="/dashboard/datasources/new"
          color="blue"
        />
        <QuickActionCard
          icon={<Table2 className="w-8 h-8" />}
          title="Создать датасет"
          description="Настройка полей и типов"
          href="/dashboard/datasets/new"
          color="green"
        />
        <QuickActionCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Сводная таблица"
          description="Группировки и агрегации"
          href="/dashboard/pivot/new"
          color="purple"
        />
        <QuickActionCard
          icon={<Sparkles className="w-8 h-8" />}
          title="AI-анализ"
          description="Получите рекомендации"
          href="/dashboard/ai"
          color="orange"
        />
      </div>

      {/* Getting Started */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Быстрый старт
        </h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Подключите источник данных"
            description="Добавьте ссылку на Google Sheets с вашими данными или подключите базу данных"
            completed={false}
            href="/dashboard/datasources/new"
          />
          <Step
            number={2}
            title="Создайте датасет"
            description="Настройте типы полей и создайте вычисляемые метрики (CPC, CTR, ROI)"
            completed={false}
            href="/dashboard/datasets/new"
          />
          <Step
            number={3}
            title="Постройте сводную таблицу"
            description="Группируйте данные по дням, неделям, кампаниям и анализируйте метрики"
            completed={false}
            href="/dashboard/pivot/new"
          />
          <Step
            number={4}
            title="Получите AI-анализ"
            description="Попросите ChatGPT проанализировать данные и дать рекомендации"
            completed={false}
            href="/dashboard/ai"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Недавняя активность
        </h2>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Пока нет активности</p>
          <p className="text-sm mt-2">Начните с подключения источника данных</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ 
  icon, 
  title, 
  description, 
  href,
  color 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  }[color];

  return (
    <Link
      href={href}
      className="card hover:shadow-lg transition-all group cursor-pointer"
    >
      <div className={`w-16 h-16 rounded-lg ${colorClasses} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </Link>
  );
}

function Step({
  number,
  title,
  description,
  completed,
  href,
}: {
  number: number;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          completed 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {description}
        </p>
        {!completed && (
          <Link href={href} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Начать →
          </Link>
        )}
      </div>
    </div>
  );
}
