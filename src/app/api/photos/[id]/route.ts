import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { deleteFile } from '@/lib/upload-server';

// PUT /api/photos/[id] — 更新照片信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const userId = parseInt(token.id as string);
    const [photos] = await pool.query('SELECT * FROM photos WHERE id = ?', [id]);
    const photoList = photos as any[];

    if (photoList.length === 0) {
      return NextResponse.json({ success: false, error: '照片不存在' }, { status: 404 });
    }

    if (photoList[0].user_id !== userId && token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权操作' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, tags, visibility } = body;

    await pool.query(
      `UPDATE photos SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        visibility = COALESCE(?, visibility)
       WHERE id = ?`,
      [title ?? null, description ?? null, category ?? null, tags ?? null, visibility ?? null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/photos/[id] error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/photos/[id] — 删除照片
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const userId = parseInt(token.id as string);
    const [photos] = await pool.query('SELECT * FROM photos WHERE id = ?', [id]);
    const photoList = photos as any[];

    if (photoList.length === 0) {
      return NextResponse.json({ success: false, error: '照片不存在' }, { status: 404 });
    }

    if (photoList[0].user_id !== userId && token.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权操作' }, { status: 403 });
    }

    await deleteFile(photoList[0].user_id, photoList[0].filename);
    await pool.query('DELETE FROM photos WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/photos/[id] error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
