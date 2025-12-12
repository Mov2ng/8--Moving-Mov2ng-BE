import { PrismaClient } from "../generated/prisma";

/**
 * DB 연결 설정
 * - $connect() 첫 호출에 DB 연결 지연 생성
 */
const prisma = new PrismaClient();

export default prisma;
