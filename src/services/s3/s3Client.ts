import { S3Client } from "@aws-sdk/client-s3";
import env from "../../config/env";

/**
 * S3 클라이언트 생성
 * @returns S3 클라이언트
 */
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    // IAM 사용자 또는 Role 기반 자격 증명
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
