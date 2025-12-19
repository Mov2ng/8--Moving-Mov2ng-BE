"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const argon2 = __importStar(require("argon2"));
const prisma_1 = require("../src/generated/prisma");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new prisma_1.PrismaClient({ adapter });
const SEED_DRIVER_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_ID = "22222222-2222-2222-2222-222222222222";
const SEED_REQUEST_ID = 900001;
async function upsertUser(params) {
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
    }
    catch {
        // 동일 email이 이미 다른 id로 존재하는 경우: 기존 계정 재사용 (id는 고정 불가)
        const existingByEmail = await prisma.user.findUnique({
            where: { email: params.email },
        });
        if (!existingByEmail)
            throw new Error(`[driver.seed] user upsert failed: ${params.email}`);
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
async function ensureDriverProfile(params) {
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
async function ensureService(params) {
    const existing = await prisma.service.findFirst({
        where: { user_id: params.userId, category: params.category, isDelete: false },
    });
    if (existing)
        return existing;
    return prisma.service.create({
        data: { user_id: params.userId, category: params.category },
    });
}
async function ensureRegion(params) {
    const existing = await prisma.region.findFirst({
        where: { user_id: params.userId, region: params.region, isDelete: false },
    });
    if (existing)
        return existing;
    return prisma.region.create({
        data: { user_id: params.userId, region: params.region },
    });
}
async function ensureRequest(params) {
    const byId = await prisma.request.findFirst({ where: { id: params.id } });
    if (byId)
        return byId;
    const existing = await prisma.request.findFirst({
        where: {
            user_id: params.userId,
            moving_type: params.moving_type,
            moving_data: params.moving_data,
            origin: params.origin,
            destination: params.destination,
        },
    });
    if (existing)
        return existing;
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
async function ensureEstimate(params) {
    const existing = await prisma.estimate.findFirst({
        where: {
            request_id: params.requestId,
            driver_id: params.driverId,
            status: params.status,
            isRequest: params.isRequest,
        },
    });
    if (existing)
        return existing;
    return prisma.estimate.create({
        data: {
            request_id: params.requestId,
            driver_id: params.driverId,
            status: params.status,
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
//# sourceMappingURL=driver.seed.js.map