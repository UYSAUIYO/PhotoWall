import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { deleteFile } from '@/lib/upload-server';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const userId = parseInt(token.id as string);
    const { action, ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: '请选择照片' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ success: false, error: '请指定操作' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');

    if (token.role !== 'admin') {
      const [check] = await pool.query(
        `SELECT id FROM photos WHERE id IN (${placeholders}) AND user_id != ?`,
        [...ids, userId]
      );
      if ((check as any[]).length > 0) {
        return NextResponse.json({ success: false, error: '无权操作部分照片' }, { status: 403 });
      }
    }

    switch (action) {
      case 'delete': {
        const [photos] = await pool.query(
          `SELECT id, user_id, filename FROM photos WHERE id IN (${placeholders})`,
          ids
        );
        for (const photo of photos as any[]) {
          await deleteFile(photo.user_id, photo.filename);
        }
        await pool.query(`DELETE FROM photos WHERE id IN (${placeholders})`, ids);
        break;
      }
      case 'categorize': {
        const { category } = await request.json();
        if (!category) {
          return NextResponse.json({ success: false, error: '请选择分类' }, { status: 400 });
        }
        await pool.query(
          `UPDATE photos SET category = ? WHERE id IN (${placeholders})`,
          [category, ...ids]
        );
        break;
      }
      case 'visibility': {
        const { visibility } = await request.json();
        if (!visibility || !['public', 'private'].includes(visibility)) {
          return NextResponse.json({ success: false, error: '无效的可见性' }, { status: 400 });
        }
        await pool.query(
          `UPDATE photos SET visibility = ? WHERE id IN (${placeholders})`,
          [visibility, ...ids]
        );
        break;
      }
      case 'tag': {
        const { tag } = await request.json();
        if (!tag) {
          return NextResponse.json({ success: false, error: '请提供标签' }, { status: 400 });
        }
        const [photos] = await pool.query(
          `SELECT id, tags FROM photos WHERE id IN (${placeholders})`,
          ids
        );
        for (const photo of photos as any[]) {
          const currentTags = photo.tags ? photo.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
          if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            await pool.query('UPDATE photos SET tags = ? WHERE id = ?', [
              currentTags.join(','),
              photo.id,
            ]);
          }
        }
        break;
      }
      default:
        return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/photos/batch error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
