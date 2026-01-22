import rateLimit from "express-rate-limit";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";

/**
 * 로그인 시도 제한 미들웨어
 * - 15분 동안 최대 5번의 로그인 시도 허용
 * - 브루트포스 공격(비밀번호 추측 공격) 방지
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5번의 요청
  message: {
    success: false,
    message: HTTP_MESSAGE.RATE_LIMIT_EXCEEDED,
    code: HTTP_CODE.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
  skipSuccessfulRequests: false, // 성공한 요청도 카운트 (실패한 시도만 세려면 true)
  skipFailedRequests: false, // 실패한 요청도 카운트
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: "너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.",
      code: HTTP_CODE.BAD_REQUEST,
    });
  },
});

/**
 * 비밀번호 재설정 요청 제한 미들웨어
 * - 1시간 동안 최대 3번의 비밀번호 재설정 요청 허용
 * - 이메일 스팸 및 계정 탈취 시도 방지
 * - 비밀번호 변경 필드가 없는 요청은 rate limit 카운트에서 제외
 * - currentPassword와 newPassword가 둘 다 있어야 비밀번호 변경 시도로 간주
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3번의 요청
  message: {
    success: false,
    message: HTTP_MESSAGE.RATE_LIMIT_EXCEEDED,
    code: HTTP_CODE.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: true, // 실패한 요청(비밀번호 검증 실패 등)은 rate limit 카운트에서 제외
  // 비밀번호 변경 필드가 없는 요청은 rate limit 카운트에서 제외
  // currentPassword와 newPassword가 둘 다 있고, 둘 다 비어있지 않아야 비밀번호 변경 시도로 간주
  skip: (req) => {
    const body = req.body || {};
    // currentPassword와 newPassword가 둘 다 있고, 둘 다 비어있지 않아야 비밀번호 변경 시도로 간주
    // undefined, null, 빈 문자열(""), 공백만 있는 문자열 모두 제외
    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;
    const hasCurrentPassword =
      currentPassword !== undefined &&
      currentPassword !== null &&
      typeof currentPassword === "string" &&
      currentPassword.trim() !== "";
    const hasNewPassword =
      newPassword !== undefined &&
      newPassword !== null &&
      typeof newPassword === "string" &&
      newPassword.trim() !== "";
    const isPasswordChangeAttempt = hasCurrentPassword && hasNewPassword;
    // 비밀번호 변경 시도가 아니면 skip (rate limit 카운트 안 함)
    return !isPasswordChangeAttempt;
  },
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message:
        "너무 많은 비밀번호 재설정 요청이 있었습니다. 1시간 후 다시 시도해주세요.",
      code: HTTP_CODE.RATE_LIMIT_EXCEEDED,
    });
  },
});
