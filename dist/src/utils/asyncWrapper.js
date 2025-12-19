"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncWrapper = asyncWrapper;
/**
 * 비동기 핸들러 래퍼 함수
 * - 비동기 핸들러(fn) 받아 새로운 동기 핸들러 형태로 반환
 * - 반환된 함수는 (req, res, next) 시그니처
 * - Promise rejection 에러를 에러 미들웨어로 전달
 */
function asyncWrapper(fn) {
    return async (req, res, next) => {
        try {
            return await fn(req, res, next);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error(typeof error === "string" ? error : "Unknown error"));
            }
        }
    };
}
// 사용 예시 (auth.controller.ts)
// import asyncWrapper from '../utils/asyncWrapper';
// ...
// export const login = asyncWrapper(async (req, res) => {
//   // try/catch 없이 비즈니스 로직만 작성
//   // 라우터(RequestHandler)가 제네릭 타입을 결정 → 타입이 asyncWrapper로 전달
//   // → 타입을 별도 지정할 필요 XX
//   // 에러 발생 시 next(err)로 자동 전달되어 공통 errorMiddleware에서 처리
// });
//# sourceMappingURL=asyncWrapper.js.map