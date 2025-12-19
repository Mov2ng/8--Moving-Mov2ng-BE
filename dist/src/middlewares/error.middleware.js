"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../core/http/ApiError"));
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = __importDefault(require("../config/env"));
const http_1 = require("../constants/http");
/**
 * 에러 처리 및 응답 반환 공통 미들웨어
 * - ApiError 인스턴스: 클라이언트에게 상태코드/메세지 반환
 * - 그 외 예기치 않은 에러: 500 처리, 개발 환경에서만 스택 노출
 * - logger 모듈 사용해 파일/콘솔/Sentry로 로그 전송 가능
 */
function errorMiddleware(err, // 왜 unknown이라고 둔거지?
req, res, next) {
    // ANCHOR: middleware 함수기 때문에 예외적으로 err라고 선언하나, 필요시 error로 변경
    // 기본 응답 객체 (예기치 않은 에러)
    let response = {
        success: false,
        message: http_1.HTTP_MESSAGE.INTERNAL_ERROR,
        code: http_1.HTTP_CODE.INTERNAL_ERROR,
    };
    // ApiError 타입이면 내부 응답값 사용
    if (err instanceof ApiError_1.default) {
        response = {
            success: false,
            message: err.message,
            code: err.code,
            errors: err.errors,
        };
        // 개발 환경일 때만 스택 노출 (보안)
        if (env_1.default.NODE_ENV === "development") {
            response.stack = err.stack;
        }
    }
    // 에러 로깅
    logger_1.default.error({
        message: response.message,
        statusCode: err instanceof ApiError_1.default ? err.statusCode : http_1.HTTP_STATUS.INTERNAL_ERROR,
        stack: err instanceof ApiError_1.default ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });
    return res
        .status(err instanceof ApiError_1.default ? err.statusCode : http_1.HTTP_STATUS.INTERNAL_ERROR)
        .json(response);
}
exports.default = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map