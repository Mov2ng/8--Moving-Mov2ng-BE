import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";
import ApiError from "../../core/http/ApiError";
import ApiResponse from "../../core/http/ApiResponse";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { Request, Response } from "express";
import uploadService from "./upload.service";

/**
 * 업로드용 presigned url 생성 및 반환
 * @param fileName - 파일 이름
 * @param category - 파일 카테고리 (예: "PROFILE", "SAMPLE", 선택)
 * @param contentType - 파일 MIME 타입 (선택, 기본값: "image/jpeg")
 * @returns { presignedUrl: string, fileKey: string }
 */
const postPresignedUrl = asyncWrapper(async (req: Request, res: Response) => {
  const { fileName, category, contentType } = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // fileName 필수 검증
  if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "파일명은 필수입니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  // category 타입 검증 및 기본값 설정
  // TODO: 추후 SAMPLE 수정
  let validCategory: "PROFILE" | "SAMPLE";
  if (category === undefined || category === "PROFILE") {
    validCategory = "PROFILE";
  } else if (category === "SAMPLE") {
    validCategory = "SAMPLE";
  } else {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "파일 카테고리는 PROFILE 또는 SAMPLE만 가능합니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  return ApiResponse.success(
    res,
    await uploadService.postPresignedUrl({
      userId,
      userRole,
      fileName,
      category: validCategory,
      contentType: contentType || "image/jpeg",
    }),
    "파일 업로드 presigned url 생성 성공"
  );
});

/**
 * 조회용 presigned url 생성 및 반환
 * @param fileKey - 파일 key
 * @returns { presignedUrl: string }
 */
const getPresignedUrl = asyncWrapper(async (req: Request, res: Response) => {
  const { fileKey } = req.query;
  if (!fileKey || typeof fileKey !== "string") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "파일 조회 실패",
      HTTP_CODE.BAD_REQUEST
    );
  }

  return ApiResponse.success(
    res,
    await uploadService.getPresignedUrl(fileKey),
    "파일 조회용 presigned url 생성 성공"
  );
});

/**
 * 삭제용 presigned url 생성 및 반환
 * @param fileKey - 파일 key
 * @returns { presignedUrl: string }
 */
const deletePresignedUrl = asyncWrapper(async (req: Request, res: Response) => {
  const { fileKey } = req.query;
  if (!fileKey || typeof fileKey !== "string") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "파일 삭제 실패",
      HTTP_CODE.BAD_REQUEST
    );
  }

  return ApiResponse.success(
    res,
    await uploadService.deletePresignedUrl(fileKey),
    "파일 삭제용 presigned url 생성 성공"
  );
});

export default {
  postPresignedUrl,
  getPresignedUrl,
  deletePresignedUrl,
};
