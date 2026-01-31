'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Database, 
  Table2, 
  Sparkles, 
  Settings,
  Menu,
  X,
  Zap,
  Bell,
  BarChart3,
  Layers
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Главная', icon: Home },
    { href: '/dashboard/datasources', label: 'Источники данных', icon: Database },
    { href: '/dashboard/datasets', label: 'Датасеты', icon: Table2 },
    { href: '/dashboard/visualizations', label: 'Визуализации', icon: BarChart3 },
    { href: '/dashboard/pivot', label: 'Сводные таблицы', icon: Layers },
    { href: '/dashboard/ai', label: 'AI-анализ', icon: Sparkles },
    { href: '/dashboard/rules', label: 'Автоправила', icon: Zap },
    { href: '/dashboard/status', label: 'Статус', icon: Bell },
    { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">AI </span>
                <span className="text-gradient">GoMobile</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-dark-800 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400' : 'group-hover:text-orange-400'} transition-colors`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/50 border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">Система активна</p>
                <p className="text-xs text-gray-500">v0.1.0 Beta</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-gray-800 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-dark-800 text-gray-400 hover:text-white transition-all hover:scale-105"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <button className="btn btn-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Новый проект
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
