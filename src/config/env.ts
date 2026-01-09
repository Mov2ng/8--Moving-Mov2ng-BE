import dotenv from "dotenv";
import z from "zod";
import { SERVER } from "../constants/http";

/**
 * 환경 변수 로드 및 검증 모듈
 * - dotenc로 .env 로드
 * - zod로 exprected 환경 변수의 타입, 필수 여부 검증
 * 해당 파일 import시 검증된 env 객체 사용 가능
 */

// .env 파일 로드
dotenv.config();

// env 타입/기본값 정의용 zod 스키마
const envSchema = z.object({
  // 개발/운영/테스트 필수, 기본값 설정
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // 포트번호 숫자 변환, 기본값 설정
  PORT: z.coerce.number().default(SERVER.DEFAULT_PORT),

  // DB 연결 URL이 빈 문자열이나 없을 시 에러
  DATABASE_URL: z.string().min(1),

  // JWT 서명용 비밀키 검증
  JWT_SECRET: z.string().min(1),

  // CORS 허용 도메인 (프로덕션용, 쉼표로 구분된 여러 도메인 가능)
  // 개발 환경에서는 없어도 됨 (전체 허용)
  CORS_ORIGIN: z.string().optional(),

  // 로컬 개발 환경 여부 (로컬: true, 배포: false 또는 없음)
  // 로컬: 프론트 3000포트, 백엔드 8080포트 (HTTP, 다른 포트)
  // 배포: Vercel + Render (HTTPS, cross-origin)
  IS_LOCAL: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  // AWS 정보 검증
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
});

// Zod에서 타입 추론
type Env = z.infer<typeof envSchema>;

let env: Env;
try {
  // zod 스키마로 파싱 및 검증
  env = envSchema.parse(process.env); // parse는 항상 T 반환
} catch (error) {
  // 검증 실패시 에러 출력 및 프로세스 중단
  console.error("❌ Invalid environment variables:", error);
  throw error;
}

export default env;
