import 'dotenv/config';
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * DB 연결 설정
 * - $connect() 첫 호출에 DB 연결 지연 생성
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
