import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const userId = parseInt(token.id as string);
    const { username, bio } = await request.json();

    if (username && username.trim()) {
      await pool.query('UPDATE users SET username = ?, bio = ? WHERE id = ?', [
        username.trim(),
        bio || null,
        userId,
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/user/profile error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
