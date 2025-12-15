import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express Request 타입의 제네릭
 * - RequestHandler 타입 제네릭 보존
 * - Params / Body / Query 타입 유지
 */
export type AsyncHandler<
  P = unknown, // URL params
  ResBody = unknown, // ResponseBody
  ReqBody = unknown, // Request body
  ReqQuery = unknown // URL query
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<Response<ResBody>>;

/**
 * 비동기 핸들러 래퍼 함수
 * - 비동기 핸들러(fn) 받아 새로운 동기 핸들러 형태로 반환
 * - 반환된 함수는 (req, res, next) 시그니처
 * - Promise rejection 에러를 에러 미들웨어로 전달
 */
export function asyncWrapper<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown // ANCHOR: 위에 타입 설계용 기본값과 달리 실제 타입 추론용 기본값이라 필요
>(
  fn: AsyncHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(typeof error === "string" ? error : "Unknown error"));
      }
    }
  };
}
