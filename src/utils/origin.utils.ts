import { Request } from "express";
import env from "../config/env";
import logger from "./logger";

/**
 * origin 문자열이 localhost인지 확인하는 함수
 * @param origin 체크할 origin 문자열 (예: "http://localhost:3000", "http://127.0.0.1:3000")
 * @returns localhost이고 포트가 3000인지 여부
 */
export function isLocalhostOrigin(origin: string | undefined | null): boolean {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const port = url.port || (url.protocol === "https:" ? "443" : "80");

    // localhost 또는 127.0.0.1 체크
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (!isLocalhost) return false;

    // 포트 번호가 3000인지 확인
    return port === "3000";
  } catch {
    // URL 파싱 실패 시 기본 체크
    const isLocalhost = 
      origin.includes("localhost") ||
      origin.includes("127.0.0.1");

    if (!isLocalhost) return false;

    // 포트 번호가 3000인지 확인
    return origin.includes(":3000");
  }
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
    logger.debug("CORS: No origin header, allowing request");
    callback(null, true);
    return;
  }

  // 로컬 BE: localhost만 허용
  if (env.NODE_ENV === "local") {
    const allowed = isLocalhostOrigin(origin);
    if (allowed) {
      logger.debug(`CORS: Allowed localhost origin: ${origin}`);
    } else {
      logger.warn(`CORS: Blocked origin in local environment: ${origin} (only localhost:3000 allowed)`);
    }
    callback(null, allowed);
    return;
  }

  // 개발 deployed BE: localhost + CORS_ORIGIN에 설정된 도메인 허용
  if (env.NODE_ENV === "development") {
    // localhost는 허용 (local FE가 dev deployed BE에 접근 가능)
    if (isLocalhostOrigin(origin)) {
      logger.debug(`CORS: Allowed localhost origin: ${origin}`);
      callback(null, true);
      return;
    }

    // CORS_ORIGIN에 설정된 도메인만 허용
    if (env.CORS_ORIGIN) {
      const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
      const allowed = allowedOrigins.includes(origin);
      if (allowed) {
        logger.debug(`CORS: Allowed origin from CORS_ORIGIN: ${origin}`);
      } else {
        logger.warn(`CORS: Blocked origin in development: ${origin} (allowed: ${allowedOrigins.join(", ")})`);
      }
      callback(null, allowed);
      return;
    }

    // CORS_ORIGIN이 없으면 localhost 외의 origin은 차단
    logger.warn(`CORS: Blocked origin in development (no CORS_ORIGIN set): ${origin}`);
    callback(null, false);
    return;
  }

  // 운영 deployed BE: CORS_ORIGIN에 설정된 도메인만 허용 (localhost 차단)
  if (env.NODE_ENV === "production") {
    // CORS_ORIGIN에 설정된 도메인만 허용
    if (env.CORS_ORIGIN) {
      const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
      const allowed = allowedOrigins.includes(origin);
      if (allowed) {
        logger.debug(`CORS: Allowed origin from CORS_ORIGIN: ${origin}`);
      } else {
        logger.warn(`CORS: Blocked origin in production: ${origin} (allowed: ${allowedOrigins.join(", ")})`);
      }
      callback(null, allowed);
      return;
    }

    // CORS_ORIGIN이 없으면 모든 origin 차단
    logger.warn(`CORS: Blocked origin in production (no CORS_ORIGIN set): ${origin}`);
    callback(null, false);
    return;
  }

  // 그 외의 경우 차단
  logger.warn(`CORS: Blocked origin (unknown NODE_ENV: ${env.NODE_ENV}): ${origin}`);
  callback(null, false);
}
