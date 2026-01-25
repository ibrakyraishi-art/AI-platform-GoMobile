import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PivotTableEngine } from '@/lib/pivot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, config } = body;

    if (!datasetId || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Получаем датасет
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*, data_sources(*)')
      .eq('id', datasetId)
      .single();

    if (datasetError) throw datasetError;

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Получаем сырые данные
    const dataSourceConfig = dataset.data_sources.config;
    let rawData: any[] = [];

    // Здесь можно добавить логику загрузки данных из источника
    // Для примера используем пустой массив
    rawData = [];

    // Создаем сводную таблицу
    const pivotData = PivotTableEngine.createPivotTable(rawData, config);

    return NextResponse.json({ data: pivotData });
  } catch (error) {
    console.error('Error creating pivot table:', error);
    return NextResponse.json({ error: 'Failed to create pivot table' }, { status: 500 });
  }
}
