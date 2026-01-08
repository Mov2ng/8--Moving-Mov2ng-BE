import { Request, Response } from "express"; // 외부 라이브러리
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http"; // 전역 상수
import ApiResponse from "../../core/http/ApiResponse"; // API 응답 클래스
import ApiError from "../../core/http/ApiError"; // API 에러 클래스
import { asyncWrapper } from "../../utils/asyncWrapper"; // 비동기 핸들러 래퍼 함수
import logger from "../../utils/logger"; // 로깅 유틸리티
import { ProfileRequestDto } from "./user.dto"; // 현재 도메인의 DTO / 타입
import profileService from "./profile.service"; // 현재 도메인의 서비스

/**
 * 사용자 프로필 조회
 * @param req 요청
 * @param res 응답
 * @returns 사용자 프로필
 */
const getProfile = asyncWrapper(
  async (req: Request<{}, {}, ProfileRequestDto>, res: Response) => {
    const { id: userId } = req.user!; // 미들웨어로 인증돼 타입 단언 가능
    const profile = await profileService.getProfile(userId);
    logger.info(
      `[${new Date().toISOString()}] 프로필 조회 성공: ${profile.email}`
    );
    return ApiResponse.success(
      res,
      profile,
      "프로필 조회 성공",
      HTTP_STATUS.OK
    );
  }
);

/**
 * 사용자 프로필 생성
 * @param req 요청
 * @param res 응답
 * @returns 생성된 사용자 프로필
 */
const createProfile = asyncWrapper(
  async (req: Request<{}, {}, ProfileRequestDto>, res: Response) => {
    const { id: userId } = req.user!; // 미들웨어로 인증돼 타입 단언 가능
    const profile = await profileService.createProfile(userId, req.body);
    logger.info(
      `[${new Date().toISOString()}] 프로필 생성 성공: ${profile.email}`
    );
    return ApiResponse.success(
      res,
      profile,
      "프로필 생성 성공",
      HTTP_STATUS.CREATED
    );
  }
);

/**
 * 사용자 프로필 업데이트
 * @param req 요청
 * @param res 응답
 * @returns 업데이트된 사용자 프로필
 */
const updateProfile = asyncWrapper(
  async (req: Request<{}, {}, ProfileRequestDto>, res: Response) => {
    const { id: userId } = req.user!; // 미들웨어로 인증돼 타입 단언 가능
    const profile = await profileService.updateProfile(userId, req.body);
    logger.info(
      `[${new Date().toISOString()}] 프로필 업데이트 성공: ${profile.email}`
    );
    return ApiResponse.success(
      res,
      profile,
      "프로필 업데이트 성공",
      HTTP_STATUS.OK
    );
  }
);

export default {
  getProfile,
  createProfile,
  updateProfile,
};
