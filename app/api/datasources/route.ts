import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleSheetsService, fetchPublicGoogleSheet } from '@/lib/googlesheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;

    return NextResponse.json({ data });
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
            { error: 'No data found in the sheet. Make sure the sheet is public and contains data.' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to connect to Google Sheets. Make sure the sheet is public and the URL is correct.' },
          { status: 400 }
        );
      }
    }

    // Сохранение в БД
    const { data, error } = await supabase
      .from('data_sources')
      .insert([
        {
          project_id: projectId,
          name,
          type,
          config,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json({ error: 'Failed to create data source' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('data_sources')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data source:', error);
    return NextResponse.json({ error: 'Failed to delete data source' }, { status: 500 });
  }
}
