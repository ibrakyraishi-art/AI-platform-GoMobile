'use client';

import { Database, Table2, Sparkles, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="glass-card mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-orange-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">
                <span className="text-white">Добро пожаловать в </span>
                <span className="text-gradient">AI GoMobile</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Начните с подключения источника данных и получите мощные AI-инсайты за секунды
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/datasources/new" className="btn btn-primary flex items-center gap-2">
              <Database className="w-5 h-5" />
              Подключить данные
            </Link>
            <Link href="/dashboard/ai" className="btn btn-secondary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-анализ
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <QuickActionCard
          icon={<Database className="w-8 h-8" />}
          title="Добавить источник"
          description="Google Sheets, Supabase, БД"
          href="/dashboard/datasources/new"
          gradient="from-blue-500 to-cyan-500"
        />
        <QuickActionCard
          icon={<Table2 className="w-8 h-8" />}
          title="Создать датасет"
          description="Настройка полей и типов"
          href="/dashboard/datasets/new"
          gradient="from-purple-500 to-pink-500"
        />
        <QuickActionCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Сводная таблица"
          description="Группировки и агрегации"
          href="/dashboard/pivot/new"
          gradient="from-green-500 to-emerald-500"
        />
        <QuickActionCard
          icon={<Sparkles className="w-8 h-8" />}
          title="AI-анализ GPT-4"
          description="Получите рекомендации"
          href="/dashboard/ai"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Getting Started */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            <span className="text-white">Быстрый </span>
            <span className="text-gradient">старт</span>
          </h2>
          <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold">
            4 простых шага
          </div>
        </div>
        <div className="space-y-6">
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
        <h2 className="text-2xl font-bold text-white mb-6">
          Недавняя активность
        </h2>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 mb-2">Пока нет активности</p>
          <p className="text-sm text-gray-500">Начните с подключения источника данных</p>
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
  gradient 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group card hover:shadow-2xl hover:shadow-orange-500/10 transition-all hover:-translate-y-2 cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
      <div className="relative">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold group-hover:gap-3 transition-all">
          Начать <ArrowRight className="w-4 h-4" />
        </div>
      </div>
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
    <div className="flex gap-6 group">
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${
          completed 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
            : 'bg-dark-800 text-gray-400 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30'
        }`}>
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mb-3 leading-relaxed">
          {description}
        </p>
        {!completed && (
          <Link href={href} className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-semibold group/link">
            Начать 
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
