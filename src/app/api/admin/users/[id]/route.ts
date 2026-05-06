import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 });
    }

    const { role } = await request.json();

    if (!['visitor', 'user', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, error: '无效角色' }, { status: 400 });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/admin/users/[id] error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 });
    }

    if (String(token.id) === id) {
      return NextResponse.json({ success: false, error: '不能删除自己' }, { status: 400 });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
