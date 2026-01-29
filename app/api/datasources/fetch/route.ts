import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('📥 Fetching data from:', url);

    // Загружаем данные из публичной Google таблицы
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    
    // Парсим JSON из ответа Google Sheets
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    
    if (!jsonMatch) {
      throw new Error('Invalid Google Sheets response format');
    }

    const jsonData = JSON.parse(jsonMatch[1]);

    if (!jsonData.table || !jsonData.table.rows) {
      throw new Error('No data in the sheet');
    }

    // Преобразуем в массив массивов
    const headers = jsonData.table.cols.map((col: any) => col.label || `Column ${col.id}`);
    const rows = jsonData.table.rows.map((row: any) => {
      return row.c.map((cell: any) => cell ? cell.v : null);
    });

    const data = [headers, ...rows];

    console.log('✅ Fetched', data.length, 'rows');

    return NextResponse.json({ 
      data,
      rowCount: data.length - 1 // минус заголовок
    });

  } catch (error: any) {
    console.error('❌ Error fetching data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
