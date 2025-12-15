import { error } from "console";
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
) => Promise<unknown>;

/**
 * 비동기 핸들러 래퍼 함수
 * - 비동기 핸들러(fn) 받아 새로운 동기 핸들러 형태로 반환
 * - 반환된 함수는 (req, res, next) 시그니처
 * - Promise rejection 에러를 에러 미들웨어로 전달
 */
function asyncWrapper<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown // ANCHOR: 위에 타입 설계용 기본값과 달리 실제 타입 추론용 기본값이라 필요
>(
  fn: AsyncHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(typeof error === "string" ? error : "Unknown error"));
      }
    }
  };
}

export default asyncWrapper;

// 사용 예시 (auth.controller.ts)
// import asyncWrapper from '../utils/asyncWrapper';
// ...
// export const login = asyncWrapper(async (req, res) => {
//   // try/catch 없이 비즈니스 로직만 작성
//   // 라우터(RequestHandler)가 제네릭 타입을 결정 → 타입이 asyncWrapper로 전달
//   // → 타입을 별도 지정할 필요 XX
//   // 에러 발생 시 next(err)로 자동 전달되어 공통 errorMiddleware에서 처리
// });
