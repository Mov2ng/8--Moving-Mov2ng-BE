import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../src/generated/prisma";
import * as argon2 from "argon2";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function resetDatabase() {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
  try {
    console.log("🔄 데이터베이스 리셋 시작...");

    await prisma.estimate.deleteMany();
    await prisma.request.deleteMany();
    await prisma.favoriteDriver.deleteMany();
    await prisma.review.deleteMany();
    await prisma.like.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.region.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
    //히스토리는 제외
    //await prisma.history.deleteMany();

    console.log("✅ 데이터베이스 리셋 완료!");
  } catch (error) {
    console.error("❌ 데이터베이스 리셋 중 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

