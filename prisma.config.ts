import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // 스키마의 메인 엔트리
  schema: "prisma/schema.prisma",

  // 마이그레이션이 생성되어야 하는 곳
  // "prisma db seed"에 대해 어떤 스크립트를 실행할지
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },

  // 데이터베이스 URL
  datasource: {
    // Safe env() 도우미 입력
    // dotenv의 필요성을 대체하지 않음
    url: env("DATABASE_URL"),
  },
});
