import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "./s3Client";
import env from "../../config/env";
import { generateS3FileKey, GenerateS3FileKeyParams } from "./s3FileKey";

/**
 * 파일 메타데이터로부터 파일키 생성 + 업로드용 presigned URL 생성
 * - 새로운 파일키를 생성하여 업로드용 presigned URL 발급 (대부분의 케이스)
 * @param params - 파일 메타데이터 (ownerType, ownerId, category, originalFileName)
 * @param contentType - 파일 MIME 타입 - 예: "image/jpeg"
 * @param expiration - 만료 시간 (초) - 예: 3600 (1시간), 기본값 3600
 * @returns { presignedUrl: string, fileKey: string }
 */
async function generatePresignedUrl(
  params: GenerateS3FileKeyParams,
  contentType: string,
  expiration: number = 3600
): Promise<{ presignedUrl: string; fileKey: string }> {
  // 파일키 생성 (파일 메타데이터 기반)
  const fileKey = generateS3FileKey(params);

  // S3에 파일 업로드용 명령 생성 (이 조건으로 업로드를 허용)
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME, // 파일이 저장될 S3 버킷 이름
    Key: fileKey, // S3 버킷 안에서의 파일 경로
    ContentType: contentType, // 업로드될 파일의 Content-Type 고정 (다를시 업로드 거부)
  });

  // PutObjectCommand 기반으로 presigned url 생성
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiration,
  });

  return { presignedUrl, fileKey };
}

/**
 * 이미 만들어진 fileKey로 조회용 presigned URL 생성
 * - DB에서 조회한 파일키로 조회용 presigned URL 발급
 * @param fileKey - S3 파일 key - 예: "USER/123/PROFILE/2025/01/07/uuid.jpg"
 * @param expiration - 만료 시간 (초) - 예: 3600 (1시간)
 * @returns { presignedUrl: string }
 */
async function generateViewPresignedUrl(
  fileKey: string,
  expiration: number
): Promise<string> {
  // S3에 파일 조회용 명령 생성 (이 조건으로 조회를 허용)
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME, // 파일이 저장될 S3 버킷 이름
    Key: fileKey, // S3 버킷 안에서의 파일 경로
  });

  // GetObjectCommand 기반으로 presigned url 생성
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiration,
  });
  return presignedUrl;
}

/**
 * 이미 만들어진 fileKey로 삭제용 presigned URL 생성
 * - DB에서 조회한 파일키로 삭제용 presigned URL 발급
 * @param fileKey - S3 파일 key - 예: "USER/123/PROFILE/2025/01/07/uuid.jpg"
 * @param expiration - 만료 시간 (초) - 예: 3600 (1시간)
 * @returns { presignedUrl: string }
 */
async function generateDeletePresignedUrl(
  fileKey: string,
  expiration: number
): Promise<string> {
  // S3에 파일 삭제용 명령 생성 (이 조건으로 삭제를 허용)
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME, // 파일이 저장된 S3 버킷 이름
    Key: fileKey, // S3 버킷 안에서의 파일 경로
  });

  // DeleteObjectCommand 기반으로 presigned url 생성
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiration,
  });
  return presignedUrl;
}

export default {
  generatePresignedUrl,
  generateViewPresignedUrl,
  generateDeletePresignedUrl,
};
