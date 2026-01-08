import { randomUUID } from "crypto";
import path from "path";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";

export interface GenerateS3FileKeyParams {
  ownerId: string;
  category: "PROFILE" | "SAMPLE";
  originalFileName: string;
}

/**
 * 파일 키 생성
 * @param params - 파일 키 생성 파라미터
 * @returns 파일 키
 */
export function generateS3FileKey({
  ownerId,
  category,
  originalFileName,
}: GenerateS3FileKeyParams) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // 파일 경로에서 확장자만 추출
  const extension = path.extname(originalFileName);
  if (!extension) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "파일 확장자를 찾을 수 없습니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  const uuid = randomUUID();
  return `${ownerId}/${category}/${year}/${month}/${day}/${uuid}${extension}`;
}
