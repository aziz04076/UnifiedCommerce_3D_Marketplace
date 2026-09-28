import crypto from 'crypto';
import path from 'path';

// Allowed image MIME types and their magic bytes
const ALLOWED_TYPES: Record<string, { magic: number[]; ext: string }> = {
  'image/jpeg': { magic: [0xff, 0xd8, 0xff], ext: '.jpg' },
  'image/png':  { magic: [0x89, 0x50, 0x4e, 0x47], ext: '.png' },
  'image/webp': { magic: [0x52, 0x49, 0x46, 0x46], ext: '.webp' },
  'image/gif':  { magic: [0x47, 0x49, 0x46, 0x38], ext: '.gif' },
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
  safeFilename?: string;
}

/**
 * Validates an uploaded file by its content (magic bytes), not just Content-Type.
 * Returns a safe random filename with the correct extension.
 */
export function validateUpload(buffer: Buffer, declaredMimeType: string): ValidationResult {
  if (buffer.length > MAX_SIZE_BYTES) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_SIZE_BYTES / 1024 / 1024} MB` };
  }

  // Check magic bytes for each allowed type
  for (const [mimeType, info] of Object.entries(ALLOWED_TYPES)) {
    const { magic, ext } = info;
    const matches = magic.every((byte, i) => buffer[i] === byte);
    if (matches) {
      const safeFilename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
      return { valid: true, detectedType: mimeType, safeFilename };
    }
  }

  return {
    valid: false,
    error: `File type not allowed. Declared: ${declaredMimeType}. Only JPEG, PNG, WebP, and GIF images are accepted.`,
  };
}

/**
 * Returns a safe upload path — files are stored outside web root.
 * In production, store in cloud storage (S3/GCS), not local filesystem.
 */
export function getSafeUploadPath(filename: string): string {
  // Sanitize: take only the basename, strip directory traversal
  const safe = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '');
  return `/uploads/${safe}`; // map to storage outside public/
}
