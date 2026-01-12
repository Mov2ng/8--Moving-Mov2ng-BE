import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const SEED_DRIVER_USER_ID = "11111111-1111-1111-1111-111111111111";
const SEED_USER_ID = "22222222-2222-2222-2222-222222222222";
const SEED_REQUEST_ID = 900001;

async function main() {
  try {
    console.log("🌱 시딩 데이터 생성 시작...");

    // 기존 데이터 삭제
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
    await prisma.history.deleteMany();

    // 비밀번호 해싱 (모든 유저는 "password123" 사용)
    const hashedPassword = await argon2.hash("qwer1234!");

    // 일반 유저 생성
    const user1 = await prisma.user.create({
      data: {
        email: "user1@example.com",
        password: hashedPassword,
        phone_number: "01000000001",
        name: "일반유저1",
        role: "USER",
        provider: "LOCAL",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "user2@example.com",
        password: hashedPassword,
        phone_number: "01000000002",
        name: "일반유저2",
        role: "USER",
        provider: "LOCAL",
      },
    });

    // 기사 유저 생성
    const driverUser1 = await prisma.user.create({
      data: {
        email: "driver1@example.com",
        password: hashedPassword,
        phone_number: "01000000010",
        name: "기사유저1",
        role: "DRIVER",
        provider: "LOCAL",
      },
    });

    const driverUser2 = await prisma.user.create({
      data: {
        email: "driver2@example.com",
        password: hashedPassword,
        phone_number: "01000000011",
        name: "기사유저2",
        role: "DRIVER",
        provider: "LOCAL",
      },
    });

    const driverUser3 = await prisma.user.create({
      data: {
        email: "driver3@example.com",
        password: hashedPassword,
        phone_number: "01000000012",
        name: "기사유저3",
        role: "DRIVER",
        provider: "LOCAL",
      },
    });

    console.log("✅ 유저 생성 완료");

    // 서비스 생성
    await prisma.service.createMany({
      data: [
        {
          user_id: user1.id,
          category: "SMALL",
        },
        {
          user_id: user1.id,
          category: "HOME",
        },
        {
          user_id: user2.id,
          category: "OFFICE",
        },
      ],
    });

    console.log("✅ 서비스 생성 완료");

    // 지역 생성
    await prisma.region.createMany({
      data: [
        {
          user_id: driverUser1.id,
          region: "SEOUL",
        },
        {
          user_id: driverUser1.id,
          region: "GYEONGGI",
        },
        {
          user_id: driverUser2.id,
          region: "BUSAN",
        },
        {
          user_id: driverUser3.id,
          region: "DAEGU",
        },
      ],
    });

    console.log("✅ 지역 생성 완료");

    // 기사 프로필 생성
    const driver1 = await prisma.driver.create({
      data: {
        user_id: driverUser1.id,
        nickname: "친절한기사1",
        driver_years: 5,
        driver_intro: "5년 경력의 전문 이사 기사입니다.",
        driver_content: "신속하고 안전하게 이사해드립니다.",
      },
    });

    const driver2 = await prisma.driver.create({
      data: {
        user_id: driverUser2.id,
        nickname: "빠른기사2",
        driver_years: 3,
        driver_intro: "3년 경력의 이사 기사입니다.",
        driver_content: "저렴한 가격에 최고의 서비스를 제공합니다.",
      },
    });

    const driver3 = await prisma.driver.create({
      data: {
        user_id: driverUser3.id,
        nickname: "신뢰기사3",
        driver_years: 7,
        driver_intro: "7년 경력의 베테랑 기사입니다.",
        driver_content: "고객 만족을 최우선으로 생각합니다.",
      },
    });

    console.log("✅ 기사 프로필 생성 완료");

    // 좋아요 생성
    await prisma.like.createMany({
      data: [
        {
          driver_id: driver1.id,
          user_id: user1.id,
        },
        {
          driver_id: driver1.id,
          user_id: user2.id,
        },
        {
          driver_id: driver2.id,
          user_id: user1.id,
        },
      ],
    });

    console.log("✅ 좋아요 생성 완료");

    // 리뷰 생성
    await prisma.review.createMany({
      data: [
        {
          driver_id: driver1.id,
          user_id: user1.id,
          review_title: "정말 친절하세요!",
          review_content: "짐을 조심스럽게 옮겨주셔서 감사합니다.",
          rating: 5,
        },
        {
          driver_id: driver1.id,
          user_id: user2.id,
          review_title: "추천합니다",
          review_content: "시간 약속을 잘 지키시고 깔끔하게 작업해주셨습니다.",
          rating: 5,
        },
        {
          driver_id: driver2.id,
          user_id: user1.id,
          review_title: "만족합니다",
          review_content: "가격도 합리적이고 서비스도 좋았습니다.",
          rating: 4,
        },
      ],
    });

    console.log("✅ 리뷰 생성 완료");

    // 찜한 기사 생성
    await prisma.favoriteDriver.createMany({
      data: [
        {
          driver_id: driver1.id,
          user_id: user1.id,
        },
        {
          driver_id: driver2.id,
          user_id: user1.id,
        },
        {
          driver_id: driver3.id,
          user_id: user2.id,
        },
      ],
    });

    console.log("✅ 찜한 기사 생성 완료");

    // 견적 요청 생성
    const request1 = await prisma.request.create({
      data: {
        user_id: user1.id,
        moving_type: "SMALL",
        moving_data: new Date("2024-12-20T10:00:00Z"),
        origin: "서울시 강남구",
        destination: "서울시 서초구",
      },
    });

    const request2 = await prisma.request.create({
      data: {
        user_id: user2.id,
        moving_type: "HOME",
        moving_data: new Date("2024-12-25T14:00:00Z"),
        origin: "부산시 해운대구",
        destination: "부산시 남구",
      },
    });

    console.log("✅ 견적 요청 생성 완료");

    // 견적 생성
    await prisma.estimate.createMany({
      data: [
        {
          request_id: request1.id,
          driver_id: driver1.id,
          status: "PENDING",
          price: 150000,
          isRequest: false,
        },
        {
          request_id: request1.id,
          driver_id: driver2.id,
          status: "ACCEPTED",
          price: 140000,
          isRequest: true,
        },
        {
          request_id: request2.id,
          driver_id: driver2.id,
          status: "PENDING",
          price: 300000,
          isRequest: false,
        },
        {
          request_id: request2.id,
          driver_id: driver3.id,
          status: "PENDING",
          price: 280000,
          isRequest: false,
        },
      ],
    });

    console.log("✅ 견적 생성 완료");

    // 알림 생성
    // driver.seed 통합: 테스트용 시드 데이터
    const seedDriverUser = await prisma.user.create({
      data: {
        id: SEED_DRIVER_USER_ID,
        email: "seed.driver1@example.com",
        password: hashedPassword,
        phone_number: "01099990001",
        name: "시드기사1",
        role: "DRIVER",
        provider: "LOCAL",
      },
    });

    await prisma.service.createMany({
      data: [
        { user_id: seedDriverUser.id, category: "SMALL" },
        { user_id: seedDriverUser.id, category: "HOME" },
      ],
    });

    await prisma.region.createMany({
      data: [
        { user_id: seedDriverUser.id, region: "SEOUL" },
        { user_id: seedDriverUser.id, region: "GYEONGGI" },
      ],
    });

    const seedDriverProfile = await prisma.driver.create({
      data: {
        user_id: seedDriverUser.id,
        nickname: "테스트기사1",
        driver_years: 3,
        driver_intro: "테스트용 기사 프로필입니다.",
        driver_content: "시드 데이터로 생성된 기사입니다.",
      },
    });

    const seedUser = await prisma.user.create({
      data: {
        id: SEED_USER_ID,
        email: "seed.user1@example.com",
        password: hashedPassword,
        phone_number: "01099991001",
        name: "시드유저1",
        role: "USER",
        provider: "LOCAL",
      },
    });

    const seedRequest = await prisma.request.create({
      data: {
        id: SEED_REQUEST_ID,
        user_id: seedUser.id,
        moving_type: "SMALL",
        moving_data: new Date("2025-01-15T10:00:00Z"),
        origin: "서울 강남구",
        destination: "서울 송파구",
      },
    });

    await prisma.estimate.createMany({
      data: [
        {
          request_id: seedRequest.id,
          driver_id: seedDriverProfile.id,
          status: "PENDING",
          price: 100000,
          isRequest: false,
        },
        {
          request_id: seedRequest.id,
          driver_id: seedDriverProfile.id,
          status: "REJECTED",
          price: 0,
          isRequest: true,
          request_reson: "테스트 반려 사유",
        },
      ],
    });

    console.log("[driver.seed] 통합 완료");
    console.log(`- driver userId: ${seedDriverUser.id}`);
    console.log(`- requestId: ${seedRequest.id}`);

    await prisma.notice.createMany({
      data: [
        {
          user_id: user1.id,
          notice_type: "NEW_ORDER",
          notice_title: "새로운 주문이 도착했습니다",
          notice_content: "견적 요청이 접수되었습니다.",
        },
        {
          user_id: user1.id,
          notice_type: "ORDER_ACCSESS",
          notice_title: "주문이 승인되었습니다",
          notice_content: "견적이 승인되어 이사 일정이 확정되었습니다.",
        },
        {
          user_id: driverUser1.id,
          notice_type: "NEW_ORDER",
          notice_title: "새로운 견적 요청",
          notice_content: "새로운 이사 견적 요청이 있습니다.",
        },
      ],
    });

    console.log("✅ 알림 생성 완료");

    // 히스토리 생성
    await prisma.history.createMany({
      data: [
        {
          table_name: "USER",
          task_type: "CREATE",
          data: JSON.stringify({ userId: user1.id, email: user1.email }),
        },
        {
          table_name: "DRIVER",
          task_type: "CREATE",
          data: JSON.stringify({ driverId: driver1.id, userId: driverUser1.id }),
        },
        {
          table_name: "Request",
          task_type: "CREATE",
          data: JSON.stringify({ requestId: request1.id, userId: user1.id }),
        },
      ],
    });

    console.log("✅ 히스토리 생성 완료");

    console.log("\n🎉 시딩 데이터 생성 완료!");
    console.log("\n생성된 데이터:");
    console.log(`- 유저: ${await prisma.user.count()}명`);
    console.log(`- 기사: ${await prisma.driver.count()}명`);
    console.log(`- 서비스: ${await prisma.service.count()}개`);
    console.log(`- 지역: ${await prisma.region.count()}개`);
    console.log(`- 리뷰: ${await prisma.review.count()}개`);
    console.log(`- 견적 요청: ${await prisma.request.count()}개`);
    console.log(`- 견적: ${await prisma.estimate.count()}개`);
  } catch (error) {
    console.error("❌ 시딩 데이터 생성 중 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
