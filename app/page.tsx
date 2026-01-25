import Link from 'next/link';
import { Database, TrendingUp, Sparkles, Table2, Zap, BarChart3, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 backdrop-blur-sm">
          <nav className="flex justify-between items-center glass-card">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">
                <span className="text-white">AI </span>
                <span className="text-gradient">GoMobile</span>
              </h1>
            </div>
            <Link 
              href="/dashboard" 
              className="btn btn-primary"
            >
              Начать →
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold">
                🚀 Аналитика следующего поколения
              </span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">Умная аналитика</span>
              <br />
              <span className="text-gradient">с AI для вашего бизнеса</span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Подключайте данные из Google Sheets, создавайте сводные таблицы 
              и получайте <span className="text-orange-400 font-semibold">AI-инсайты</span> за секунды
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard" className="btn btn-primary text-lg group">
                Попробовать бесплатно
                <Sparkles className="w-5 h-5 inline ml-2 group-hover:rotate-12 transition-transform" />
              </Link>
              <a href="#features" className="btn btn-secondary text-lg">
                Узнать больше ↓
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">99.9%</div>
                <div className="text-gray-400 text-sm">Точность AI</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">&lt;1с</div>
                <div className="text-gray-400 text-sm">Анализ данных</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Доступность</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-white">Мощные </span>
              <span className="text-gradient">возможности</span>
            </h2>
            <p className="text-gray-400 text-xl">Все инструменты в одном месте</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Database className="w-8 h-8" />}
              title="Подключение данных"
              description="Google Sheets, Supabase, PostgreSQL, MySQL - выбирайте любой источник"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Table2 className="w-8 h-8" />}
              title="Сводные таблицы"
              description="Группировки, агрегации и вычисляемые поля - как в Excel"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI-анализ GPT-4"
              description="ChatGPT анализирует данные и дает персонализированные рекомендации"
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Визуализация"
              description="Интерактивные графики и дашборды для отслеживания метрик"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Прогнозирование"
              description="AI предсказывает тренды и помогает принимать решения"
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Безопасность"
              description="Ваши данные защищены. Ключи API хранятся локально"
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-white">Как это </span>
              <span className="text-gradient">работает</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Step 
              number="1" 
              title="Подключите источник данных"
              description="Добавьте ссылку на Google Sheets или подключите базу данных одним кликом"
            />
            <Step 
              number="2" 
              title="Настройте поля и метрики"
              description="Укажите типы полей и создайте вычисляемые метрики (CPC, CTR, ROI, ROAS)"
            />
            <Step 
              number="3" 
              title="Создайте сводную таблицу"
              description="Группируйте по дням/неделям/кампаниям, выбирайте агрегации"
            />
            <Step 
              number="4" 
              title="Получите AI-инсайты"
              description="Напишите промпт на русском языке и получите детальный анализ с рекомендациями"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-24">
          <div className="glass-card max-w-4xl mx-auto text-center glow">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-white">Готовы начать </span>
              <span className="text-gradient">трансформацию?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Попробуйте бесплатно без регистрации. Никаких ограничений.
            </p>
            <Link href="/dashboard" className="btn btn-primary text-xl">
              Начать работу сейчас →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">AI </span>
                <span className="text-gradient">GoMobile</span>
              </span>
            </div>
            <p className="text-gray-500">&copy; 2026 AI GoMobile. Powered by Next.js & OpenAI</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <div className="group card text-center hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-2">
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gradient transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">
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
    <div className="glass-card flex gap-6 hover:border-orange-500/50 transition-all group">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
          {number}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-gradient transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
