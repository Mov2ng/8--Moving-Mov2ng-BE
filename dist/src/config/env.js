"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 환경 변수 로드 및 검증 모듈
 * - dotenc로 .env 로드
 * - zod로 exprected 환경 변수의 타입, 필수 여부 검증
 * 해당 파일 import시 검증된 env 객체 사용 가능
 */
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = __importDefault(require("zod"));
// .env 파일 로드
dotenv_1.default.config();
// env 타입/기본값 정의용 zod 스키마
const envSchema = zod_1.default.object({
    // 개발/운영/테스트 필수, 기본값 설정
    NODE_ENV: zod_1.default
        .enum(["development", "production", "test"])
        .default("development"),
    // 포트번호 숫자 변환, 기본값 설정
    PORT: zod_1.default.coerce.number().default(3000),
    // DB 연결 URL이 빈 문자열이나 없을 시 에러
    DATABASE_URL: zod_1.default.string().min(1),
    // JWT 서명용 비밀키 검증
    JWT_SECRET: zod_1.default.string().min(1),
});
let env;
try {
    // zod 스키마로 파싱 및 검증
    env = envSchema.parse(process.env); // parse는 항상 T 반환
}
catch (error) {
    // 검증 실패시 에러 출력 및 프로세스 중단
    console.error("❌ Invalid environment variables:", error);
    throw error;
}
exports.default = env;
//# sourceMappingURL=env.js.map