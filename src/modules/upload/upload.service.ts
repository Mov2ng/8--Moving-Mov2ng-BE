import s3PresignedService from "../../services/s3/presignedUrl";
import { GenerateS3FileKeyParams } from "../../services/s3/s3FileKey";
import { Role } from "@prisma/client";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";

interface PostPresignedUrlParams {
  userId: string;
  userRole: Role;
  fileName: string;
  category: "PROFILE" | "SAMPLE";
  contentType: string;
}

/**
 * 업로드용 presigned url 생성 및 반환
 * - 사용자 role에 따라 ownerType 결정
 * - category 유효성 검증
 * - 파일키 생성 및 presigned URL 생성까지 처리
 * @param params - 사용자 정보 및 파일 정보
 * @returns { presignedUrl: string, fileKey: string }
 */
async function postPresignedUrl(
  params: PostPresignedUrlParams
): Promise<{ presignedUrl: string; fileKey: string }> {
  const { userId, userRole, fileName, category, contentType } = params;

  // role에 따라 ownerType 결정 (타입 단언 없이)
  let ownerType: "USER" | "DRIVER";
  if (userRole === Role.USER) {
    ownerType = "USER";
  } else if (userRole === Role.DRIVER) {
    ownerType = "DRIVER";
  } else {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "유효하지 않은 사용자 역할입니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  // 파일 메타데이터 구성 (category는 이미 Controller에서 검증되고 기본값 설정됨)
  const fileKeyParams: GenerateS3FileKeyParams = {
    ownerType,
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

export default {
  postPresignedUrl,
  getPresignedUrl,
};
