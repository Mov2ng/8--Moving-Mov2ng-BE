import { NextFunction, Request, Response } from "express";
import ApiError, { ApiErrorResponse } from "../core/http/ApiError";
import logger from "../utils/logger";
import env from "../config/env";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";
import { messageLink } from "discord.js";

/**
 * 에러 처리 및 응답 반환 공통 미들웨어
 * - ApiError 인스턴스: 클라이언트에게 상태코드/메세지 반환
 * - 그 외 예기치 않은 에러: 500 처리, 개발 환경에서만 스택 노출
 * - logger 모듈 사용해 파일/콘솔/Sentry로 로그 전송 가능
 */
function errorMiddleware(
  err: Error, // 왜 unknown이라고 둔거지?
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  // ANCHOR: middleware 함수기 때문에 예외적으로 err라고 선언하나, 필요시 error로 변경

  console.log(err);

  // 기본 응답 객체 (예기치 않은 에러)
  let response: ApiErrorResponse = {
    success: false,
    message: HTTP_MESSAGE.INTERNAL_ERROR,
    code: HTTP_CODE.INTERNAL_ERROR,
  };

  // ApiError 타입이면 내부 응답값 사용
  if (err instanceof ApiError) {
    response = {
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    };

    // 개발 환경일 때만 스택 노출 (보안)
    if (env.NODE_ENV === "development") {
      response.stack = err.stack;
    }

    // 에러 로깅: 스택이 있으면 메세지 대신 스택을 메인 출력으로 사용
    logger.error(err.stack || response.message, {
      message: response.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      stack: response.stack,
    });
  }

  return res
    .status(
      err instanceof ApiError ? err.statusCode : HTTP_STATUS.INTERNAL_ERROR
    )
    .json(response);
}

export default errorMiddleware;
