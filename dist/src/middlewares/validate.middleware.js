"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../core/http/ApiError"));
const http_1 = require("../constants/http");
/**
 * Zod 기반 요청 데이터 검증 미들웨어
 * - 요청 body, query, params 검증
 * - 에러는 에러 미들웨어로 전달
 */
function validate(schema) {
    // 실제 미들웨어 반환
    return (req, res, next) => {
        // safeParse 사용해 success/error로 분기
        const result = schema.safeParse({
            body: req.body, // JSON body
            query: req.query, // url query string
            params: req.params, // url path params
        });
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => ({
                // 오류 발생 필드
                path: issue.path.length > 0 ? issue.path.join(".") : "root",
                // 오류 메세지 (zod 생성)
                message: issue.message,
            }));
            return next(new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, http_1.HTTP_MESSAGE.BAD_REQUEST, http_1.HTTP_CODE.BAD_REQUEST));
        }
        // 성공할 경우 타입을 안전한 값으로 저장
        res.locals.validated = result.data;
        return next();
    };
}
exports.default = validate;
// 사용 예시 (auth.routes.ts);
// import validate from '../middlewares/validate.middleware';
// import { loginSchema } from './auth.validation';
// ...
// router.post('/login', validate(loginSchema), authController.login);
//# sourceMappingURL=validate.middleware.js.map