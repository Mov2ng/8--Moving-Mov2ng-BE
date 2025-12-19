"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const ApiError_1 = __importDefault(require("../core/http/ApiError"));
const http_1 = require("../constants/http");
/**
 * JWT 토큰 관리 유틸
 */
// JWT 비밀키
const SECRET_KEY = env_1.default.JWT_SECRET;
// JWT 기본 옵션
const DEFAULT_SIGN_OPTIONS = {
    expiresIn: "2h", // 기본 만료 시간
};
/**
 * JWT Access 토큰 생성
 * @param payload - 토큰에 담을 데이터 객체
 * @param options - jwt.sign에 전달할 옵션, 기본 옵션과 병합
 * @returns 생성된 JWT 문자열
 */
function generateToken(payload, options = {}) {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, {
        ...DEFAULT_SIGN_OPTIONS,
        ...options,
    });
}
/**
 * JWT Refresh 토큰 생성
 * @param payload - 토큰에 담을 데이터 객체
 * @param options - jwt.sign에 전달할 옵션, 기본 옵션과 병합
 * @returns 생성된 JWT 문자열
 */
function generateRefreshToken(payload, options = {}) {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, {
        ...DEFAULT_SIGN_OPTIONS,
        ...options,
    });
}
/**
 * JWT 토큰 검증
 * @param token - 클라이언트에서 받은 JWT 문자열
 * @returns 토큰이 유효하면 payload 반환
 * @throws ApiError - 토큰이 유효하지 않으면 401 에러 발생
 */
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError_1.default(http_1.HTTP_STATUS.AUTH_INVALID_TOKEN, error.message, http_1.HTTP_CODE.AUTH_INVALID_TOKEN);
        }
    }
}
//# sourceMappingURL=jwt.js.map