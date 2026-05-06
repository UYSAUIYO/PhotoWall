import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { saveFile } from '@/lib/upload-server';
import { ALLOWED_TYPES, MAX_FILE_SIZE } from '@/lib/upload';

// GET /api/photos — 获取公开照片列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    let where = "WHERE p.visibility = 'public'";
    const params: any[] = [];

    if (category) {
      where += ' AND p.category = ?';
      params.push(category);
    }
    if (tag) {
      where += ` AND p.tags LIKE ?`;
      params.push(`%${tag}%`);
    }
    if (search) {
      where += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM photos p ${where}`,
      params
    );
    const total = (countRows as any[])[0].total;

    const [rows] = await pool.query(
      `SELECT p.*, u.username FROM photos p
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
    });
  } catch (error: any) {
    console.error('GET /api/photos error:', error);
    return NextResponse.json({ success: false, error: '服务器错误', detail: error?.message || String(error) }, { status: 500 });
  }
}

// POST /api/photos — 上传照片
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const userId = parseInt(token.id as string);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: '请选择文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: '仅支持 JPG/PNG/WebP/GIF 格式' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: '文件大小不能超过 10MB' }, { status: 400 });
    }

    const { filename } = await saveFile(userId, file);

    const title = (formData.get('title') as string) || file.name.replace(/\.[^.]+$/, '');
    const description = (formData.get('description') as string) || '';
    const category = (formData.get('category') as string) || '其他';
    const tags = (formData.get('tags') as string) || '';
    const visibility = (formData.get('visibility') as string) || 'public';

    // Get image dimensions
    const buffer = Buffer.from(await file.arrayBuffer());
    const { default: sharp } = await import('sharp');
    const metadata = await sharp(buffer).metadata();

    const [result] = await pool.query(
      `INSERT INTO photos (user_id, filename, title, description, category, tags, visibility, width, height, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, filename, title, description, category, tags, visibility, metadata.width || 0, metadata.height || 0, file.size]
    );

    return NextResponse.json({
      success: true,
      data: { id: (result as any).insertId, filename },
    });
  } catch (error: any) {
    console.error('POST /api/photos error:', error);
    return NextResponse.json({ success: false, error: '服务器错误', detail: error?.message || String(error) }, { status: 500 });
  }
}
