import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../core/http/ApiError";
import env from "../config/env";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";
import authRepository from "../modules/auth/auth.repository";
import { Role } from "@prisma/client";

/**
 * 선택적 인증 미들웨어
 * - 토큰이 있으면 검증 후 req.user 설정
 * - 토큰이 없어도 요청은 계속 진행 (req.user는 undefined)
 * - 비로그인 사용자도 접근 가능한 API에서 사용
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // 토큰이 없으면 그냥 통과 (비로그인 상태)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      const user = await authRepository.findUserById(decoded.id);

      if (user) {
        // password 제외하고 저장
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    }
  } catch (error) {
    // 토큰이 유효하지 않아도 에러 없이 통과 (비로그인 상태로 처리)
  }

  next();
}

/**
 * JWT 토큰 검증 및 사용자 인증 미들웨어 (필수)
 * - 토큰이 없거나 유효하지 않으면 에러 반환
 * - 로그인 필수 API에서 사용
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Authentication 헤더 가져오기
  const authHeader = req.headers.authorization;

  // Bearer 토큰 없을 시 인증 실패
  if (!authHeader || !authHeader?.startsWith("Bearer ")) {
    return next(
      new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      )
    );
  }

  // Bearer 제거 후 실제 토큰 추출
  const token = authHeader.split(" ")[1];

  try {
    // JWT 검증
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // payload 검증
    if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
      return next(
        new ApiError(
          HTTP_STATUS.AUTH_INVALID_TOKEN,
          HTTP_MESSAGE.AUTH_INVALID_TOKEN,
          HTTP_CODE.AUTH_INVALID_TOKEN
        )
      );
    }

    // DB에서 사용자 존재여부 확인 (삭제되지 않은 사용자만)
    const user = await authRepository.findUserById(decoded.id);

    if (!user) {
      return next(
        new ApiError(
          HTTP_STATUS.USER_NOT_FOUND,
          HTTP_MESSAGE.USER_NOT_FOUND,
          HTTP_CODE.USER_NOT_FOUND
        )
      );
    }

    // role 검증 (DB에서 가져왔지만 SQL 직접 수정이나 마이그레이션 이슈 등 발생 가능성 있음)
    if (user.role !== Role.USER && user.role !== Role.DRIVER) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          HTTP_MESSAGE.FORBIDDEN,
          HTTP_CODE.FORBIDDEN
        )
      );
    }

    // TODO: 필요시 추가 검증
    // - 사용자 상태 체크 (isDelete)
    // - 계정 활성화 상태
    // - 토큰 블랙리스트 체크

    // req.user에 전체 사용자 정보 할당 (password 제외)
    // authService.me에서 중복 DB 조회 방지
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    // 토큰 만료
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new ApiError(
          HTTP_STATUS.AUTH_EXPIRED_TOKEN,
          HTTP_MESSAGE.AUTH_EXPIRED_TOKEN,
          HTTP_CODE.AUTH_EXPIRED_TOKEN
        )
      );
    }

    // 잘못된 토큰
    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new ApiError(
          HTTP_STATUS.AUTH_INVALID_TOKEN,
          HTTP_MESSAGE.AUTH_INVALID_TOKEN,
          HTTP_CODE.AUTH_INVALID_TOKEN
        )
      );
    }

    // 예상치 못한 에러
    next(
      new ApiError(
        HTTP_STATUS.AUTH_FAILED,
        HTTP_MESSAGE.AUTH_FAILED,
        HTTP_CODE.AUTH_FAILED
      )
    );
  }
}

export default authMiddleware;
