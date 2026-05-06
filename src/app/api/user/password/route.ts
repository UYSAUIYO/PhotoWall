import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const userId = parseInt(token.id as string);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: '请填写所有字段' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: '新密码长度至少 6 位' }, { status: 400 });
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const userList = users as any[];

    if (userList.length === 0) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, userList[0].password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: '当前密码错误' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/user/password error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
