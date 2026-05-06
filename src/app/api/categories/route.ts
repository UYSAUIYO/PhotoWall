import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT category, COUNT(*) as count FROM photos WHERE visibility = 'public' GROUP BY category ORDER BY count DESC"
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
