import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 });
    }

    const [rows] = await pool.query('SELECT * FROM settings');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      await pool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        [key, String(value)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
