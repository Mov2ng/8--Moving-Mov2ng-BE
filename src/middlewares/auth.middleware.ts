import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../core/http/ApiError";
import env from "../config/env";
import prisma from "../config/db";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";

// Request 타입 확장 // 이유: Express 기본 Request 객체에는 'user' 속성이 없기 때문에, TS 컴파일 에러를 방지하기 위해 확장합니다.
// (권장: src/types/express.d.ts 에서 전역으로 선언하면 이 인터페이스는 필요 없어집니다)
interface AuthRequest extends Request {
  user?: { id: string };
}

// JWT Payload 타입 정의 (예상치 못한 에러 방지를 위해)
interface JwtUserPayload extends JwtPayload {
  id?: number;
}

/**
 * JWT 토큰 검증 및 사용자 인증 미들웨어
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 */
export async function authMiddleware(
  req: AuthRequest,
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

    // DB에서 사용자 존재여부 확인
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(
        new ApiError(
          HTTP_STATUS.USER_NOT_FOUND,
          HTTP_MESSAGE.USER_NOT_FOUND,
          HTTP_CODE.USER_NOT_FOUND
        )
      ); 
    }

    // req.user에 안전히 ID 할당
    req.user = { id: user.id };

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
