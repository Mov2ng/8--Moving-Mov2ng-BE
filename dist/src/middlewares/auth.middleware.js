"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../core/http/ApiError"));
const env_1 = __importDefault(require("../config/env"));
const db_1 = __importDefault(require("../config/db"));
const http_1 = require("../constants/http");
/**
 * JWT 토큰 검증 및 사용자 인증 미들웨어
 * @param req Express 요청 객체
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 호출
 */
async function authMiddleware(req, res, next) {
    // Authentication 헤더 가져오기
    const authHeader = req.headers.authorization;
    // Bearer 토큰 없을 시 인증 실패
    if (!authHeader || !authHeader?.startsWith("Bearer ")) {
        return next(new ApiError_1.default(http_1.HTTP_STATUS.AUTH_REQUIRED, http_1.HTTP_MESSAGE.AUTH_REQUIRED, http_1.HTTP_CODE.AUTH_REQUIRED));
    }
    // Bearer 제거 후 실제 토큰 추출
    const token = authHeader.split(" ")[1];
    try {
        // JWT 검증
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        // payload 검증
        if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
            return next(new ApiError_1.default(http_1.HTTP_STATUS.AUTH_INVALID_TOKEN, http_1.HTTP_MESSAGE.AUTH_INVALID_TOKEN, http_1.HTTP_CODE.AUTH_INVALID_TOKEN));
        }
        // DB에서 사용자 존재여부 확인
        const user = await db_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return next(new ApiError_1.default(http_1.HTTP_STATUS.USER_NOT_FOUND, http_1.HTTP_MESSAGE.USER_NOT_FOUND, http_1.HTTP_CODE.USER_NOT_FOUND));
        }
        // req.user에 안전히 ID 할당
        req.user = { id: user.id };
        next();
    }
    catch (error) {
        // 토큰 만료
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new ApiError_1.default(http_1.HTTP_STATUS.AUTH_EXPIRED_TOKEN, http_1.HTTP_MESSAGE.AUTH_EXPIRED_TOKEN, http_1.HTTP_CODE.AUTH_EXPIRED_TOKEN));
        }
        // 잘못된 토큰
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new ApiError_1.default(http_1.HTTP_STATUS.AUTH_INVALID_TOKEN, http_1.HTTP_MESSAGE.AUTH_INVALID_TOKEN, http_1.HTTP_CODE.AUTH_INVALID_TOKEN));
        }
        // 예상치 못한 에러
        next(new ApiError_1.default(http_1.HTTP_STATUS.AUTH_FAILED, http_1.HTTP_MESSAGE.AUTH_FAILED, http_1.HTTP_CODE.AUTH_FAILED));
    }
}
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map