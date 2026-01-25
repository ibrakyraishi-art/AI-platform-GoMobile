import Link from 'next/link';
import { Database, TrendingUp, Sparkles, Table2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI GoMobile
            </h1>
          </div>
          <Link 
            href="/dashboard" 
            className="btn btn-primary"
          >
            Начать
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Аналитика нового поколения
            <span className="block text-primary-600 mt-2">с искусственным интеллектом</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Подключайте Google Sheets, создавайте сводные таблицы и получайте AI-анализ данных одним кликом
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
              Попробовать бесплатно
            </Link>
            <a href="#features" className="btn btn-secondary text-lg px-8 py-3">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Подключение данных"
            description="Google Sheets, Supabase, PostgreSQL, MySQL - выбирайте любой источник"
          />
          <FeatureCard
            icon={<Table2 className="w-8 h-8" />}
            title="Сводные таблицы"
            description="Группировки, агрегации и вычисляемые поля - как в Excel"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI-анализ"
            description="ChatGPT анализирует данные и дает рекомендации"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Визуализация"
            description="Графики и дашборды для отслеживания метрик"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Как это работает
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <Step 
              number="1" 
              title="Подключите источник данных"
              description="Добавьте ссылку на Google Sheets или подключите базу данных"
            />
            <Step 
              number="2" 
              title="Настройте поля"
              description="Укажите типы полей и создайте вычисляемые метрики (CPC, CTR, ROI)"
            />
            <Step 
              number="3" 
              title="Создайте сводную таблицу"
              description="Группируйте по дням/неделям, выбирайте агрегации"
            />
            <Step 
              number="4" 
              title="Получите AI-анализ"
              description="Напишите промпт и получите выводы и рекомендации"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Готовы начать?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Попробуйте бесплатно - без регистрации
          </p>
          <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
            Начать работу
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 AI GoMobile. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="card text-center hover:shadow-lg transition-shadow">
      <div className="text-primary-600 mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}

function Step({ number, title, description }: { 
  number: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
          {number}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
}
