import { NextFunction, Request, Response } from "express";
import ApiError, { ApiErrorDetail } from "../core/http/ApiError";
import z from "zod";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";

/**
 * Zod 기반 요청 데이터 검증 미들웨어
 * - 요청 body, query, params 검증
 * - 에러는 에러 미들웨어로 전달
 */
function validate<T>(schema: z.ZodType<T>) {
  // 실제 미들웨어 반환
  return (req: Request, res: Response, next: NextFunction) => {
    // safeParse 사용해 success/error로 분기
    const result = schema.safeParse({
      body: req.body, // JSON body
      query: req.query, // url query string
      params: req.params, // url path params
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
