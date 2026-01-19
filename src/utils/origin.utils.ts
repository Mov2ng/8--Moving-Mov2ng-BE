import { Request } from "express";
import env from "../config/env";

/**
 * origin 문자열이 localhost인지 확인하는 함수
 * @param origin 체크할 origin 문자열 (예: "http://localhost:3000", "http://127.0.0.1:3000")
 * @returns localhost인지 여부
 */
export function isLocalhostOrigin(origin: string | undefined | null): boolean {
  if (!origin) return false;

  // localhost 또는 127.0.0.1 체크 (포트 번호 포함/미포함 모두 지원)
  return (
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1")
  );
}

/**
 * Express Request 객체에서 origin을 추출하여 localhost인지 확인하는 함수
 * @param req Express Request 객체
 * @returns localhost인지 여부
 */
export function isLocalhostRequest(req?: Request): boolean {
  if (!req) return false;
  return isLocalhostOrigin(req.get("origin"));
}

/**
 * CORS origin 체크 함수
 *
 * 규칙:
 * - local FE → local BE: localhost만 허용
 * - local FE → dev deployed BE: localhost + CORS_ORIGIN에 설정된 도메인 허용
 * - deployed FE → 운영 deployed BE: CORS_ORIGIN에 설정된 도메인만 허용
 *
 * @param origin - 요청한 클라이언트의 origin (예: "http://localhost:3000")
 * @param callback - 결과를 전달하는 콜백 함수
 */
export function checkCorsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {

  // origin이 없을 때는 허용 (같은 origin 요청이거나 서버 간 요청)
  if (!origin) {
    callback(null, true);
    return;
  }

  // 로컬 BE: localhost만 허용
  if (env.NODE_ENV === "local") {
    callback(null, isLocalhostOrigin(origin));
    return;
  }

  // 개발 deployed BE: localhost + CORS_ORIGIN에 설정된 도메인 허용
  if (env.NODE_ENV === "development") {
    // localhost는 허용 (local FE가 dev deployed BE에 접근 가능)
    if (isLocalhostOrigin(origin)) {
      callback(null, true);
      return;
    }

    // CORS_ORIGIN에 설정된 도메인만 허용
    if (env.CORS_ORIGIN) {
      const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
      callback(null, allowedOrigins.includes(origin));
      return;
    }

    // CORS_ORIGIN이 없으면 localhost 외의 origin은 차단
    callback(null, false);
    return;
  }

  // 운영 deployed BE: CORS_ORIGIN에 설정된 도메인만 허용 (localhost 차단)
  if (env.NODE_ENV === "production") {
    // CORS_ORIGIN에 설정된 도메인만 허용
    if (env.CORS_ORIGIN) {
      const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
      callback(null, allowedOrigins.includes(origin));
      return;
    }

    // CORS_ORIGIN이 없으면 모든 origin 차단
    callback(null, false);
    return;
  }

  // 그 외의 경우 차단
  callback(null, false);
}
