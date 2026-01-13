import { NextFunction, Request, Response } from "express";
import ApiError from "../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";
import moverRepository from "../modules/movers/mover.repository";

/**
 * 역할 기반 권한 검증 미들웨어
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 */

/**
 * 일반 회원만 접근 가능
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 * @returns 일반 회원만 접근 가능
 * @throws ApiError 일반 회원만 접근 가능하지 않을 시 에러
 */
export function userOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== Role.USER) {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "일반 회원만 접근 가능합니다.",
        HTTP_CODE.FORBIDDEN
      )
    );
  }

  next();
}

/**
 * 기사님만 접근 가능 (프로필 등록 필수)
 * - Driver 역할인지 확인
 * - Driver 레코드 존재 여부 확인 (프로필 등록 여부)
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 * @returns 기사님만 접근 가능
 * @throws ApiError 기사님만 접근 가능하지 않거나 프로필이 없을 시 에러
 */
export async function driverOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Driver 역할인지 확인
  if (req.user?.role !== Role.DRIVER) {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "기사님만 접근 가능합니다",
        HTTP_CODE.FORBIDDEN
      )
    );
  }

  // 2. Driver 레코드 존재 여부 확인 (프로필 등록 여부)
  const driver = await moverRepository.findDriverByUserId(req.user!.id);
  if (!driver) {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "기사님 프로필을 먼저 등록해주세요.",
        HTTP_CODE.FORBIDDEN
      )
    );
  }

  next();
}

/**
 * 비회원만 접근 가능
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 * @returns 비회원만 접근 가능
 * @throws ApiError 비회원만 접근 가능하지 않을 시 에러
 */
export function guestOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 쿠키에서 refreshToken 확인
  const refreshToken = req.cookies?.refreshToken;

  // 이미 로그인 상태인 경우 체크
  if (refreshToken) {
    try {
      // refreshToken 검증 → 성공하면 유효한 토큰이 있다는 의미 = 이미 로그인 상태
      verifyToken(refreshToken);
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "이미 로그인한 상태입니다.",
          HTTP_CODE.BAD_REQUEST
        )
      );
    } catch {
      // verifyToken 실패 = 토큰 만료/무효 = 로그인 진행 허용
      // 에러 무시하고 계속 진행
    }
  }

  next();
}
