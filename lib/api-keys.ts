/**
 * Утилиты для работы с API ключами
 * Ключи могут храниться либо в localStorage (клиент), либо в env (сервер)
 */

// Клиентская версия - получение ключей из localStorage
export function getClientApiKeys() {
  if (typeof window === 'undefined') {
    return {
      openaiKey: null,
      supabaseUrl: null,
      supabaseKey: null,
    };
  }

  return {
    openaiKey: localStorage.getItem('openai_key'),
    supabaseUrl: localStorage.getItem('supabase_url'),
    supabaseKey: localStorage.getItem('supabase_key'),
  };
}

// Серверная версия - получение ключей из env или из запроса
export function getServerApiKeys(headers?: Headers) {
  // Сначала пробуем получить из заголовков (если клиент передал)
  if (headers) {
    const openaiKey = headers.get('x-openai-key');
    const supabaseUrl = headers.get('x-supabase-url');
    const supabaseKey = headers.get('x-supabase-key');

    if (openaiKey || supabaseUrl || supabaseKey) {
      return {
        openaiKey: openaiKey || process.env.OPENAI_API_KEY,
        supabaseUrl: supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      };
    }
  }

  // Fallback на env переменные
  return {
    openaiKey: process.env.OPENAI_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

// Проверка наличия ключей
export function hasRequiredKeys(keys: ReturnType<typeof getClientApiKeys>) {
  return {
    hasOpenAI: !!keys.openaiKey,
    hasSupabase: !!keys.supabaseUrl && !!keys.supabaseKey,
    allKeysPresent: !!keys.openaiKey && !!keys.supabaseUrl && !!keys.supabaseKey,
  };
}

// Маскировка ключей для отображения
export function maskApiKey(key: string | null): string {
  if (!key) return 'Не указан';
  if (key.length < 8) return '***';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}
