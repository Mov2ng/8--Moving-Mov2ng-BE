import s3PresignedService from "../../services/s3/presignedUrl";
import { GenerateS3FileKeyParams } from "../../services/s3/s3FileKey";
import { Role } from "@prisma/client";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";

interface PostPresignedUrlParams {
  userId: string;
  fileName: string;
  category: "PROFILE" | "SAMPLE";
  contentType: string;
}

/**
 * 업로드용 presigned url 생성 및 반환
 * - category 유효성 검증
 * - 파일키 생성 및 presigned URL 생성까지 처리
 * @param params - 사용자 정보 및 파일 정보
 * @returns { presignedUrl: string, fileKey: string }
 */
async function postPresignedUrl(
  params: PostPresignedUrlParams
): Promise<{ presignedUrl: string; fileKey: string }> {
  const { userId, fileName, category, contentType } = params;

  // 파일 메타데이터 구성 (category는 이미 Controller에서 검증되고 기본값 설정됨)
  const fileKeyParams: GenerateS3FileKeyParams = {
    ownerId: userId,
    category,
    originalFileName: fileName,
  };

  // presigned URL 서비스에서 파일키 생성 + presigned URL 생성까지 한 번에 처리
  return await s3PresignedService.generatePresignedUrl(
    fileKeyParams,
    contentType,
    3600
  );
}

/**
 * 조회용 presigned url 생성 및 반환
 * @param fileKey - S3에 저장된 파일 key
 * @returns { presignedUrl: string }
 */
async function getPresignedUrl(
  fileKey: string
): Promise<{ presignedUrl: string }> {
  const presignedUrl = await s3PresignedService.generateViewPresignedUrl(
    fileKey,
    3600
  );
  return { presignedUrl };
}

/**
 * 삭제용 presigned url 생성 및 반환
 * - fileKey 소유권 검증: fileKey가 요청한 사용자의 것인지 확인
 * @param fileKey - S3에 저장된 파일 key
 * @param userId - 요청한 사용자 ID
 * @returns { presignedUrl: string }
 */
async function deletePresignedUrl(
  fileKey: string,
  userId: string
): Promise<{ presignedUrl: string }> {
  // fileKey 소유권 검증: fileKey 형식이 "OWNER_ID/CATEGORY/..." 형태이므로 확인
  const fileKeyParts = fileKey.split("/");
  if (fileKeyParts.length < 2) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "유효하지 않은 파일 키입니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  const ownerId = fileKeyParts[0];

  // 소유자 ID 검증: fileKey의 ownerId가 요청한 사용자의 ID와 일치하는지 확인
  if (ownerId !== userId) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "파일 삭제 권한이 없습니다.",
      HTTP_CODE.FORBIDDEN
    );
  }

  const presignedUrl = await s3PresignedService.generateDeletePresignedUrl(
    fileKey,
    3600
  );
  return { presignedUrl };
}

export default {
  postPresignedUrl,
  getPresignedUrl,
  deletePresignedUrl,
};
