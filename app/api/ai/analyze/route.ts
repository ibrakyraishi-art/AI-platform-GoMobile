import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AIAnalyzer } from '@/lib/openai';
import type { AIAnalysisRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: AIAnalysisRequest = await request.json();
    const { datasetId, pivotTableId, prompt, context } = body;

    if (!datasetId || !prompt) {
      return NextResponse.json(
        { error: 'Dataset ID and prompt are required' },
        { status: 400 }
      );
    }

    // Получаем данные для анализа
    let data: any[] = [];

    if (pivotTableId) {
      // Если указана сводная таблица, получаем её данные
      const { data: pivotTable, error: pivotError } = await supabase
        .from('pivot_tables')
        .select('*')
        .eq('id', pivotTableId)
        .single();

      if (pivotError) throw pivotError;

      // TODO: Получить данные сводной таблицы
      data = [];
    } else {
      // Иначе получаем данные датасета
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('*, data_sources(*)')
        .eq('id', datasetId)
        .single();

      if (datasetError) throw datasetError;

      // TODO: Получить данные датасета
      data = [];
    }

      // Ключ должен быть передан пользователем через localStorage
      // Проверка будет на клиенте

    // Анализируем данные
    const analysis = await AIAnalyzer.analyzeData(
      {
        datasetId,
        pivotTableId,
        prompt,
        context,
      },
      data
    );

    // Сохраняем результат анализа
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analyses')
      .insert([
        {
          project_id: body.projectId || null,
          dataset_id: datasetId,
          pivot_table_id: pivotTableId,
          prompt: analysis.prompt,
          analysis: analysis.analysis,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          metadata: analysis.metadata,
        },
      ])
      .select()
      .single();

    if (saveError) console.error('Error saving analysis:', saveError);

    return NextResponse.json({ data: analysis });
  } catch (error: any) {
    console.error('Error in AI analysis:', error);
    
    // Обработка ошибок OpenAI
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to analyze data' },
      { status: 500 }
    );
  }
}
