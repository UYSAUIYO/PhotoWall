import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      where += ' AND (p.title LIKE ? OR p.filename LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM photos p ${where}`,
      params
    );
    const total = (countRows as any[])[0].total;

    const [statRows] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(visibility = 'public'), 0) AS publicTotal,
              COALESCE(SUM(file_size), 0) AS totalSize
       FROM photos`
    );
    const stats = (statRows as any[])[0];

    const [rows] = await pool.query(
      `SELECT p.*, u.username, u.role as user_role FROM photos p
       JOIN users u ON p.user_id = u.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: Number(stats.total) || 0,
        publicTotal: Number(stats.publicTotal) || 0,
        totalSize: Number(stats.totalSize) || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/photos error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
