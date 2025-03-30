// src/lib/s3.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.S3_BUCKET_NAME!;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(userId: string, fileType: string) {
  const fileName = `resumes/${userId}_${Date.now()}.pdf`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 seconds

  const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`;

  return { signedUrl, publicUrl };
}
