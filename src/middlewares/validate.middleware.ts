import { NextFunction, Request, Response } from "express";
import ApiError, { ApiErrorDetail } from "../core/http/ApiError";
import z from "zod";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";

/**
 * Zod 기반 요청 데이터 검증 미들웨어
 * - 요청 body, query, params 검증
 * - 에러는 에러 미들웨어로 전달
 * - schema 또는 schema 함수를 타입 가능 (schema 함수인 경우 req를 전달)
 * - req.params, req.query, req.user 등 요청 정보에 따라 동적으로 검증 규칙을 변경해야 할 때
 * - 예: 사용자 역할에 따라 필수 필드가 다른 경우
 * - 예: URL 파라미터의 값에 따라 다른 검증 규칙을 적용해야 하는 경우
 */
function validate<T>(schema: z.ZodType<T> | ((req: Request) => z.ZodType<T>)) {
  // 실제 미들웨어 반환
  return (req: Request, res: Response, next: NextFunction) => {
    // schema가 함수인 경우 요청 시점의 req 정보를 바탕으로 동적으로 검증 스키마 결정 가능
    const resolvedSchema = typeof schema === "function" ? schema(req) : schema;

    // safeParse 사용해 success/error로 분기
    const result = resolvedSchema.safeParse({
      body: req.body, // JSON body
      query: req.query, // url query string
      params: req.params, // url path params
      cookies: req.cookies, // HTTP cookies
    });

    if (!result.success) {
      const errorMessage: ApiErrorDetail[] = result.error.issues.map(
        (issue) => ({
          // 오류 발생 필드
          field: issue.path.length > 0 ? issue.path.join(".") : "root",
          // 오류 메세지 (zod 생성)
          reason: issue.message,
        })
      );
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          HTTP_MESSAGE.BAD_REQUEST,
          HTTP_CODE.BAD_REQUEST,
          errorMessage
        )
      );
    }
    // 성공할 경우 타입을 안전한 값으로 저장
    res.locals.validated = result.data;

    return next();
  };
}

export default validate;

// 사용 예시 (auth.routes.ts);
// import validate from '../middlewares/validate.middleware';
// import { loginSchema } from './auth.validation';
// ...
// router.post('/login', validate(loginSchema), authController.login);
