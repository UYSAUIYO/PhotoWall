import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { deleteFile } from '@/lib/upload-server';

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

    const [photos] = await pool.query('SELECT * FROM photos WHERE id = ?', [id]);
    const photoList = photos as any[];

    if (photoList.length > 0) {
      await deleteFile(photoList[0].user_id, photoList[0].filename);
      await pool.query('DELETE FROM photos WHERE id = ?', [id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/photos/[id] error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
