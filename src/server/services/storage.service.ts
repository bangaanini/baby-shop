import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

/**
 * Helper to determine whether Cloudflare R2 is properly configured with valid credentials.
 */
export function isR2Configured(): boolean {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return false;
  }

  // Check for placeholder / dummy values
  if (
    accountId.includes('your_') ||
    accessKeyId.includes('your_') ||
    secretAccessKey.includes('your_') ||
    publicUrl.includes('pub-xxxxxx') ||
    publicUrl.includes('pub-your-id')
  ) {
    return false;
  }

  return true;
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Upload a file buffer to Cloudflare R2 or fallback to local public directory / base64 data URI.
 *
 * @param buffer - File contents as Buffer
 * @param fileName - Target file name or key (e.g. "products/1725400000-uuid-image.png")
 * @param contentType - MIME type of the file (e.g. "image/png")
 * @returns Public URL or path to access the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const cleanKey = fileName.replace(/^\/+/, '');

  if (isR2Configured()) {
    try {
      const client = getS3Client();
      const bucketName = process.env.R2_BUCKET_NAME;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
        Body: buffer,
        ContentType: contentType,
      });

      await client.send(command);

      const publicBaseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
      return `${publicBaseUrl}/${cleanKey}`;
    } catch (r2Error) {
      console.warn('R2 upload failed, attempting local fallback:', r2Error);
    }
  }

  // Fallback: Local filesystem in public/uploads/
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.join(uploadsDir, cleanKey);
    const targetDirPath = path.dirname(targetFilePath);

    await fs.mkdir(targetDirPath, { recursive: true });
    await fs.writeFile(targetFilePath, buffer);

    return `/uploads/${cleanKey}`;
  } catch (fsError) {
    console.warn('Local disk fallback failed, using Base64 Data URI fallback:', fsError);
    // Ultimate fallback for read-only or serverless environments without R2
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  }
}

export const storageService = {
  isR2Configured,
  uploadFile,
};

export default storageService;
