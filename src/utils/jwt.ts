import jwt, { SignOptions } from "jsonwebtoken";
import env from "../config/env";
import ApiError from "../core/http/ApiError";
import { HTTP_CODE, HTTP_STATUS } from "../constants/http";

/**
 * JWT 토큰 관리 유틸
 */

// JWT 비밀키
const SECRET_KEY = env.JWT_SECRET;

// JWT 기본 옵션
const DEFAULT_SIGN_OPTIONS: SignOptions = {
  expiresIn: "2h", // 기본 만료 시간
};

/**
 * JWT 토큰 생성
 * @param payload - 토큰에 담을 데이터 객체
 * @param options - jwt.sign에 전달할 옵션, 기본 옵션과 병합
 * @returns 생성된 JWT 문자열
 */
export function generateToken(payload: object, options: SignOptions = {}) {
  return jwt.sign(payload, SECRET_KEY, {
    ...DEFAULT_SIGN_OPTIONS,
    ...options,
  });
}

/**
 * JWT 토큰 검증
 * @param token - 클라이언트에서 받은 JWT 문자열
 * @returns 토큰이 유효하면 payload 반환
 * @throws ApiError - 토큰이 유효하지 않으면 401 에러 발생
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(HTTP_STATUS.AUTH_INVALID_TOKEN, error.message, HTTP_CODE.AUTH_INVALID_TOKEN);
    }
  }
}
