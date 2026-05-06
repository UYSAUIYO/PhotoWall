export function getPhotoUrl(userId: number, filename: string): string {
  return `/uploads/${userId}/${filename}`;
}

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
