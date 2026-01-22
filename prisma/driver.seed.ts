import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SEED_DRIVER_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_ID = "22222222-2222-2222-2222-222222222222";
const SEED_REQUEST_ID = 900001;

async function upsertUser(params: {
  id: string;
  email: string;
  password: string;
  phone_number: string;
  name: string;
  role: "USER" | "DRIVER";
}) {
  try {
    return await prisma.user.upsert({
      where: { id: params.id },
      update: {
        email: params.email,
        password: params.password,
        phone_number: params.phone_number,
        name: params.name,
        role: params.role,
        provider: "LOCAL",
        isDelete: false,
      },
      create: {
        id: params.id,
        email: params.email,
        password: params.password,
        phone_number: params.phone_number,
        name: params.name,
        role: params.role,
        provider: "LOCAL",
      },
    });
  } catch {
    // 동일 email이 이미 다른 id로 존재하는 경우: 기존 계정 재사용 (id는 고정 불가)
    const existingByEmail = await prisma.user.findUnique({
      where: { email_role: { email: params.email, role: params.role } },
    });
    if (!existingByEmail) throw new Error(`[driver.seed] user upsert failed: ${params.email}`);

    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        password: params.password,
        phone_number: params.phone_number,
        name: params.name,
        role: params.role,
        provider: "LOCAL",
        isDelete: false,
      },
    });
  }
}

async function ensureDriverProfile(params: {
  userId: string;
  nickname: string;
  driver_years?: number;
  driver_intro?: string;
  driver_content?: string;
}) {
  const existing = await prisma.driver.findFirst({
    where: { user_id: params.userId, isDelete: false },
  });

  if (existing) {
    return prisma.driver.update({
      where: { id: existing.id },
      data: {
        nickname: params.nickname,
        driver_years: params.driver_years,
        driver_intro: params.driver_intro,
        driver_content: params.driver_content,
        isDelete: false,
      },
    });
  }

  return prisma.driver.create({
    data: {
      user_id: params.userId,
      nickname: params.nickname,
      driver_years: params.driver_years,
      driver_intro: params.driver_intro,
      driver_content: params.driver_content,
    },
  });
}

async function ensureService(params: { userId: string; category: "SMALL" | "HOME" | "OFFICE" }) {
  const existing = await prisma.service.findFirst({
    where: { user_id: params.userId, category: params.category, isDelete: false },
  });
  if (existing) return existing;

  return prisma.service.create({
    data: { user_id: params.userId, category: params.category },
  });
}

async function ensureRegion(params: { userId: string; region: string }) {
  const existing = await prisma.region.findFirst({
    where: { user_id: params.userId, region: params.region as any, isDelete: false },
  });
  if (existing) return existing;

  return prisma.region.create({
    data: { user_id: params.userId, region: params.region as any },
  });
}

async function ensureRequest(params: {
  id: number;
  userId: string;
  moving_type: "SMALL" | "HOME" | "OFFICE";
  moving_data: Date;
  origin: string;
  destination: string;
}) {
  const byId = await prisma.request.findFirst({ where: { id: params.id } });
  if (byId) return byId;

  const existing = await prisma.request.findFirst({
    where: {
      user_id: params.userId,
      moving_type: params.moving_type,
      moving_data: params.moving_data,
      origin: params.origin,
      destination: params.destination,
    },
  });
  if (existing) return existing;

  return prisma.request.create({
    data: {
      id: params.id,
      user_id: params.userId,
      moving_type: params.moving_type,
      moving_data: params.moving_data,
      origin: params.origin,
      destination: params.destination,
    },
  });
}

async function ensureEstimate(params: {
  requestId: number;
  driverId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  isRequest: boolean;
  price: number;
  request_reson?: string;
}) {
  const existing = await prisma.estimate.findFirst({
    where: {
      request_id: params.requestId,
      driver_id: params.driverId,
      status: params.status as any,
      isRequest: params.isRequest,
    },
  });
  if (existing) return existing;

  return prisma.estimate.create({
    data: {
      request_id: params.requestId,
      driver_id: params.driverId,
      status: params.status as any,
      isRequest: params.isRequest,
      price: params.price,
      request_reson: params.request_reson,
    },
  });
}

async function main() {
  console.log("[driver.seed] 시작 (기존 데이터 삭제 없음)");

  const password = await argon2.hash("qwer1234!");

  const driverUser = await upsertUser({
    id: SEED_DRIVER_USER_ID,
    email: "seed.driver1@example.com",
    password,
    phone_number: "01099990001",
    name: "시드기사1",
    role: "DRIVER",
  });

  await Promise.all([
    ensureService({ userId: driverUser.id, category: "SMALL" }),
    ensureService({ userId: driverUser.id, category: "HOME" }),
    ensureRegion({ userId: driverUser.id, region: "SEOUL" }),
    ensureRegion({ userId: driverUser.id, region: "GYEONGGI" }),
  ]);

  const driverProfile = await ensureDriverProfile({
    userId: driverUser.id,
    nickname: "테스트기사1",
    driver_years: 3,
    driver_intro: "테스트용 기사 프로필입니다.",
    driver_content: "시드 데이터로 생성된 기사입니다.",
  });

  const user = await upsertUser({
    id: SEED_USER_ID,
    email: "seed.user1@example.com",
    password,
    phone_number: "01099991001",
    name: "시드유저1",
    role: "USER",
  });

  const request = await ensureRequest({
    id: SEED_REQUEST_ID,
    userId: user.id,
    moving_type: "SMALL",
    moving_data: new Date("2025-01-15T10:00:00Z"),
    origin: "서울 강남구",
    destination: "서울 송파구",
  });

  await Promise.all([
    ensureEstimate({
      requestId: request.id,
      driverId: driverProfile.id,
      status: "PENDING",
      isRequest: false,
      price: 100000,
    }),
    ensureEstimate({
      requestId: request.id,
      driverId: driverProfile.id,
      status: "REJECTED",
      isRequest: true,
      price: 0,
      request_reson: "테스트 반려 사유",
    }),
  ]);

  console.log("[driver.seed] 완료");
  console.log(`- driver user: ${driverUser.email} (${driverUser.id})`);
  console.log(`- driver id: ${driverProfile.id}`);
  console.log(`- sample requestId: ${request.id}`);
  console.log(`- swagger default userId: ${driverUser.id}`);
  console.log(`- swagger default requestId: ${request.id}`);
}

main()
  .catch((e) => {
    console.error("[driver.seed] 실패", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
