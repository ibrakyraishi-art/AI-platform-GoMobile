import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleSheetsService, fetchPublicGoogleSheet } from '@/lib/googlesheets';

export async function GET(request: NextRequest) {
  try {
    // Возвращаем пустой массив, так как данные хранятся в localStorage на клиенте
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, type, config } = body;

    // Валидация
    if (!projectId || !name || !type || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Проверка подключения к источнику данных
    if (type === 'google_sheets') {
      try {
        const data = await fetchPublicGoogleSheet(
          config.spreadsheetId,
          config.sheetName,
          config.range
        );
        
        if (!data || data.length === 0) {
          return NextResponse.json(
            { error: 'В таблице нет данных. Убедитесь, что таблица публичная и содержит данные (хотя бы заголовки).' },
            { status: 400 }
          );
        }

        // Возвращаем успешный результат с данными
        const dataSource = {
          id: crypto.randomUUID(),
          project_id: projectId,
          name,
          type,
          config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          preview: data.slice(0, 5), // Первые 5 строк для предпросмотра
        };

        return NextResponse.json({ data: dataSource });
      } catch (error: any) {
        console.error('Google Sheets error:', error);
        return NextResponse.json(
          { error: 'Не удалось подключиться к Google Sheets. Убедитесь, что таблица доступна по ссылке (публичная) и название листа указано правильно.' },
          { status: 400 }
        );
      }
    }

    // Для других типов источников - заглушка
    const dataSource = {
      id: crypto.randomUUID(),
      project_id: projectId,
      name,
      type,
      config,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ data: dataSource });
  } catch (error: any) {
    console.error('Error creating data source:', error);
    return NextResponse.json({ 
      error: error.message || 'Произошла ошибка при подключении источника данных' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Удаление происходит на клиенте через localStorage
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data source:', error);
    return NextResponse.json({ error: 'Failed to delete data source' }, { status: 500 });
  }
}
