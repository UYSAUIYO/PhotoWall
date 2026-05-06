import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT tags FROM photos WHERE visibility = 'public' AND tags != ''"
    );
    const tagSet = new Set<string>();
    for (const row of rows as any[]) {
      if (row.tags) {
        row.tags.split(',').forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    }
    return NextResponse.json({ success: true, data: Array.from(tagSet).sort() });
  } catch (error) {
    console.error('GET /api/tags error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
