import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchPublicGoogleSheet } from '@/lib/googlesheets';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Получаем информацию об источнике данных
    const { data: dataSource, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!dataSource) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
    }

    // Получаем данные в зависимости от типа источника
    let data: any[] = [];

    switch (dataSource.type) {
      case 'google_sheets':
        data = await fetchPublicGoogleSheet(
          dataSource.config.spreadsheetId,
          dataSource.config.sheetName,
          dataSource.config.range
        );
        break;

      case 'supabase':
        const { data: supabaseData, error: supabaseError } = await supabase
          .from(dataSource.config.database)
          .select('*');

        if (supabaseError) throw supabaseError;
        data = supabaseData || [];
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported data source type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from source' },
      { status: 500 }
    );
  }
}
