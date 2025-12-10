/**
 * 환경 변수 로드 및 검증 모듈
 * - dotenc로 .env 로드
 * - zod로 exprected 환경 변수의 타입, 필수 여부 검증
 * 해당 파일 import시 검증된 env 객체 사용 가능
 */
import dotenv from "dotenv";
import z from "zod";

// .env 파일 로드
dotenv.config();

// env 타입/기본값 정의용 zod 스키마
const envSchema = z.object({
  // 개발/운영/테스트 필수, 기본값 설정
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // 포트번호 숫자 변환, 기본값 설정
  PORT: z.coerce.number().default(3000),

  // DB 연결 URL이 빈 문자열이나 없을 시 에러
  DATABASE_URL: z.string().min(1),

  // JWT 서명용 비밀키 검증
  JWT_SECRET: z.string().min(1),
});

// zod 스키마로 파싱 및 검증
const parsedEnv = envSchema.safeParse(process.env);

// 검증 실패시 에러 출력 및 프로세스 중단
if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables: ", parsedEnv.error.message);

  throw new Error("Invalid environment variables.");
}

// 검증된 환경 변수를 export
export default parsedEnv.data;
