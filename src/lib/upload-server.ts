import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_BASE = join(process.cwd(), 'public', 'uploads');

export async function ensureUserDir(userId: number): Promise<string> {
  const dir = join(UPLOAD_BASE, String(userId));
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function saveFile(
  userId: number,
  file: File
): Promise<{ filename: string; filepath: string; size: number }> {
  const dir = await ensureUserDir(userId);
  const ext = getExtension(file.name);
  const filename = `${uuidv4()}${ext}`;
  const filepath = join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return { filename, filepath, size: buffer.length };
}

export async function deleteFile(userId: number, filename: string): Promise<void> {
  const filepath = join(UPLOAD_BASE, String(userId), filename);
  try {
    await unlink(filepath);
  } catch {
    // file may not exist, ignore
  }
}

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : '';
}
