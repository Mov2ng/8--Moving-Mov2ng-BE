import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import env from "./env";

/**
 * DB 연결 설정
 * - $connect() 첫 호출에 DB 연결 지연 생성
 */

const databaseUrl = env.DATABASE_URL;

// PrismaPg 어댑터 생성
const adapter = new PrismaPg({
  // 데이터베이스 URL
  connectionString: databaseUrl,
});

// PrismaClient 인스턴스 생성
const prisma = new PrismaClient({ adapter });

export default prisma;
