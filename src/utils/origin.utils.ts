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
 * 로컬/개발/운영단에 따른 CORS origin 체크 함수
 * @param origin - 요청한 클라이언트의 origin (예: "http://localhost:3000")
 * @param callback - 결과를 전달하는 콜백 함수
 */
export function checkCorsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {
  console.log("[CORS]", {
    nodeEnv: env.NODE_ENV,
    origin,
    corsOrigin: env.CORS_ORIGIN,
  });

  // 로컬 환경: localhost의 모든 포트 허용
  if (env.NODE_ENV === "local") {
    callback(null, isLocalhostOrigin(origin));
    return;
  }

  // 개발 환경: localhost의 모든 포트 자동 허용 + CORS_ORIGIN에 설정된 origin 허용
  if (env.NODE_ENV === "development") {
    // localhost는 자동 허용
    if (isLocalhostOrigin(origin)) {
      callback(null, true);
      return;
    }
    // CORS_ORIGIN에 설정된 origin 체크
    if (env.CORS_ORIGIN) {
      const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
      callback(null, allowedOrigins.includes(origin || ""));
    } else {
      callback(null, false);
    }
    return;
  }

  // 운영 환경: 이 함수는 호출되지 않음 (corsOptions에서 배열로 처리)
  callback(null, false);
}
