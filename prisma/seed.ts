import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// .env 파일 로드
dotenv.config();

// PostgreSQL 연결 풀 생성
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // RDS SSL 연결
});

console.log(
  "🔗 Connecting to:",
  process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")
);

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ====== 규모 설정 ======
const REGULAR_USER_COUNT = 50;
const DRIVER_COUNT = 1000;
const BATCH_SIZE = 50;

const REQUEST_PER_USER = 3;
const ESTIMATE_MIN = 3;
const ESTIMATE_MAX = 6;

const REVIEW_COUNT = 100;
const REVIEW_BATCH_SIZE = 20;
const POPULAR_DRIVER_COUNT = 30;
const REVIEWS_PER_DRIVER = 5;

const LIKE_COUNT = 300;
const FAVORITE_COUNT = 200;

// ========== 랜덤 데이터 생성 헬퍼 ==========
const lastNames = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
  "황",
  "안",
  "송",
  "류",
  "홍",
];
const firstNames = [
  "민준",
  "서준",
  "도윤",
  "예준",
  "시우",
  "하준",
  "주원",
  "지호",
  "지후",
  "준서",
  "서연",
  "서윤",
  "지우",
  "서현",
  "민서",
  "하은",
  "하윤",
  "윤서",
  "지민",
  "채원",
];
const nicknamePrefixes = [
  "안전운전",
  "친절한",
  "빠른배달",
  "꼼꼼한",
  "성실한",
  "믿음직한",
  "경험많은",
  "프로",
  "베테랑",
  "최고의",
];
const nicknameSuffixes = [
  "기사",
  "드라이버",
  "무버",
  "이사맨",
  "운송맨",
  "배달왕",
  "이사왕",
  "전문가",
  "마스터",
  "프로",
];
const intros = [
  "고객 만족을 최우선으로 생각합니다.",
  "안전하고 신속한 이사를 약속드립니다.",
  "정성을 다해 모시겠습니다.",
  "믿고 맡겨주세요!",
  "이사는 저에게 맡기세요.",
  "경력으로 증명하겠습니다.",
  "친절한 서비스가 기본입니다.",
  "꼼꼼함이 저의 무기입니다.",
  "고객님의 소중한 물건을 안전하게!",
  "합리적인 가격, 최고의 서비스!",
];
const contents = [
  "가정이사, 사무실이사 모두 가능합니다. 대형 가구 운반도 문제없습니다.",
  "소형이사 전문입니다. 원룸, 투룸 이사는 저에게 맡겨주세요.",
  "포장이사 전문입니다. 꼼꼼한 포장으로 물건 하나 다치지 않게 옮겨드립니다.",
  "당일 이사 가능합니다. 급한 이사도 연락주세요.",
  "장거리 이사 전문입니다. 전국 어디든 달려갑니다.",
  "사무실 이사 전문입니다. 복잡한 사무실 이사도 깔끔하게 처리합니다.",
  "반포장이사로 합리적인 가격에 이사하세요.",
  "피아노, 금고 등 특수 물품 운반도 가능합니다.",
  "야간 이사, 주말 이사 모두 가능합니다.",
  "청소 서비스까지 함께 제공합니다.",
];
const providers = ["LOCAL"] as const;
const regions = [
  "SEOUL",
  "GYEONGGI",
  "INCHEON",
  "GANGWON",
  "CHUNGBUK",
  "CHUNGNAM",
  "SEJONG",
  "DAEJEON",
  "JEONBUK",
  "JEONNAM",
  "GWANGJU",
  "GYEONGBUK",
  "GYEONGNAM",
  "DAEGU",
  "ULSAN",
  "BUSAN",
  "JEJU",
] as const;
const categories = ["SMALL", "HOME", "OFFICE"] as const;

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber(index: number): string {
  // 01000000001, 01000000002, ... 형식으로 생성
  return `010${String(index + 1).padStart(8, "0")}`;
}

function generateName(): string {
  return randomElement(lastNames) + randomElement(firstNames);
}

function generateNickname(name: string): string {
  return `${randomElement(nicknamePrefixes)} ${name.slice(0, 1)}${randomElement(
    nicknameSuffixes
  )}`;
}

// 배치 처리를 위한 청크 함수
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // 기존 데이터 삭제 (역순으로)
  console.log("🗑️  Clearing existing data...");
  await prisma.history.deleteMany();
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
  console.log("✅ Cleared existing data\n");

  // ========== 일반 Users 생성 ==========
  console.log("👤 Creating regular users...");
  const regularUsers = [];
  
  for (let i = 0; i < REGULAR_USER_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i + 1}@example.com`,
        password: `asdf1234!`,
        phone_number: generatePhoneNumber(i),
        name: generateName(),
        role: "USER",
        provider: randomElement(providers),
      },
    });
    regularUsers.push(user);
  }
  

  // ========== Driver Users 생성 ==========
  console.log(`\n🚗 Creating ${DRIVER_COUNT} driver users...`);
  const driverUsers = [];

  for (let batch = 0; batch < DRIVER_COUNT / BATCH_SIZE; batch++) {
    const batchPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const index = batch * BATCH_SIZE + i;
      batchPromises.push(
        prisma.user.create({
          data: {
            email: `driver${index + 1}@example.com`,
            password: `asdf1234!`,
            phone_number: generatePhoneNumber(index),
            name: generateName(),
            role: "DRIVER",
            provider: randomElement(providers),
          },
        })
      );
    }
    const batchResults = await Promise.all(batchPromises);
    driverUsers.push(...batchResults);
    process.stdout.write(
      `\r   Progress: ${driverUsers.length}/${DRIVER_COUNT} users created`
    );
  }
  console.log(`\n✅ Created ${driverUsers.length} driver users`);

  // ========== Drivers 생성 ==========
  console.log(`\n🚚 Creating ${DRIVER_COUNT} drivers...`);
  const drivers = [];

  for (let batch = 0; batch < DRIVER_COUNT / BATCH_SIZE; batch++) {
    const batchPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const index = batch * BATCH_SIZE + i;
      const user = driverUsers[index];
      batchPromises.push(
        prisma.driver.create({
          data: {
            user_id: user.id,
            nickname: generateNickname(user.name),
            driver_years: randomInt(1, 20),
            driver_intro: randomElement(intros),
            driver_content: randomElement(contents),
          },
        })
      );
    }
    const batchResults = await Promise.all(batchPromises);
    drivers.push(...batchResults);
    process.stdout.write(
      `\r   Progress: ${drivers.length}/${DRIVER_COUNT} drivers created`
    );
  }
  console.log(`\n✅ Created ${drivers.length} drivers`);

  // ========== Services 생성 ==========
  console.log("\n🛠️  Creating services...");
  let serviceCount = 0;
  for (let batch = 0; batch < DRIVER_COUNT / BATCH_SIZE; batch++) {
    const batchPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const index = batch * BATCH_SIZE + i;
      const numServices = randomInt(1, 3);
      const usedCategories = new Set<string>();
      for (let j = 0; j < numServices; j++) {
        let category = randomElement(categories);
        while (usedCategories.has(category)) {
          category = randomElement(categories);
        }
        usedCategories.add(category);
        batchPromises.push(
          prisma.service.create({
            data: {
              user_id: driverUsers[index].id,
              category,
            },
          })
        );
      }
    }
    const results = await Promise.all(batchPromises);
    serviceCount += results.length;
    process.stdout.write(
      `\r   Progress: ${Math.min(
        (batch + 1) * BATCH_SIZE,
        DRIVER_COUNT
      )}/${DRIVER_COUNT} drivers processed`
    );
  }
  console.log(`\n✅ Created ${serviceCount} services`);

  // ========== Regions 생성 ==========
  console.log("\n📍 Creating regions...");
  let regionCount = 0;
  for (let batch = 0; batch < DRIVER_COUNT / BATCH_SIZE; batch++) {
    const batchPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const index = batch * BATCH_SIZE + i;
      const numRegions = randomInt(1, 3);
      const usedRegions = new Set<string>();
      for (let j = 0; j < numRegions; j++) {
        let region = randomElement(regions);
        while (usedRegions.has(region)) {
          region = randomElement(regions);
        }
        usedRegions.add(region);
        batchPromises.push(
          prisma.region.create({
            data: {
              user_id: driverUsers[index].id,
              region,
            },
          })
        );
      }
    }
    const results = await Promise.all(batchPromises);
    regionCount += results.length;
    process.stdout.write(
      `\r   Progress: ${Math.min(
        (batch + 1) * BATCH_SIZE,
        DRIVER_COUNT
      )}/${DRIVER_COUNT} drivers processed`
    );
  }
  console.log(`\n✅ Created ${regionCount} regions`);

  // ========== Requests 생성 ==========
  console.log("\n📋 Creating requests...");
  const requests = [];
  const locations = [
    "서울시 강남구",
    "서울시 서초구",
    "서울시 송파구",
    "서울시 마포구",
    "서울시 용산구",
    "경기도 성남시",
    "경기도 수원시",
    "경기도 고양시",
    "인천시 남동구",
    "부산시 해운대구",
  ];

  for (const user of regularUsers) {
    for (let i = 0; i < REQUEST_PER_USER; i++) {
      const request = await prisma.request.create({
        data: {
          user_id: user.id,
          moving_type: randomElement(categories),
          moving_data: new Date(2026, randomInt(1, 12), randomInt(1, 28)),
          origin: randomElement(locations),
          destination: randomElement(locations),
        },
      });
      requests.push(request);
    }
  }
  console.log(`✅ Created ${requests.length} requests`);

  // ========== Estimates 생성 ==========
  console.log("\n💰 Creating estimates...");
  let estimateCount = 0;
  const statuses = ["PENDING", "ACCEPTED", "REJECTED"] as const;

  for (const request of requests) {
    const numEstimates = randomInt(ESTIMATE_MIN, ESTIMATE_MAX);
    const usedDrivers = new Set<number>();

    for (let i = 0; i < numEstimates; i++) {
      let driverIndex = randomInt(0, drivers.length - 1);
      while (usedDrivers.has(driverIndex)) {
        driverIndex = randomInt(0, drivers.length - 1);
      }
      usedDrivers.add(driverIndex);

      await prisma.estimate.create({
        data: {
          request_id: request.id,
          driver_id: drivers[driverIndex].id,
          status: randomElement(statuses),
          price: randomInt(100000, 1000000),
          isRequest: Math.random() > 0.7,
          request_reson: Math.random() > 0.8 ? "일정 불가" : null,
        },
      });
      estimateCount++;
    }
  }
  console.log(`✅ Created ${estimateCount} estimates`);

  // ========== Reviews 생성 ==========
  console.log(`\n⭐ Creating ${REVIEW_COUNT} reviews...`);
  const reviewTitles = [
    "최고의 서비스!",
    "만족합니다",
    "추천해요",
    "친절해요",
    "빠르고 안전해요",
    "다음에도 이용할게요",
    "굿굿!",
    "완벽한 이사",
    "감사합니다",
    "별 다섯개!",
    "정말 좋았어요",
    "기대 이상이었습니다",
    "또 이용하고 싶어요",
    "최고예요!",
    "완벽했습니다",
    "감동받았어요",
    "프로페셔널해요",
    "믿고 맡길 수 있어요",
    "적극 추천!",
    "이사 끝판왕",
  ];
  const reviewContents = [
    "정말 만족스러운 이사였습니다. 강력 추천!",
    "친절하고 꼼꼼하게 해주셨어요.",
    "시간 약속도 잘 지키시고 좋았습니다.",
    "물건 하나 안 다치게 잘 옮겨주셨어요.",
    "가격도 합리적이고 서비스도 좋았어요.",
    "처음부터 끝까지 친절하셨습니다. 다음에도 꼭 부탁드릴게요!",
    "짐이 많았는데도 불평 없이 열심히 해주셨어요. 감사합니다!",
    "이사 당일 비가 왔는데 짐 하나 안 젖게 잘 옮겨주셨어요.",
    "예상보다 빨리 끝나서 좋았습니다. 일처리가 깔끔해요.",
    "어머니 집 이사인데 어르신 물건도 조심히 다뤄주셔서 감동!",
    "포장부터 정리까지 완벽했습니다. 이사 스트레스가 없었어요.",
    "연락도 잘 되고 시간 약속도 칼같이 지켜주셔서 좋았습니다.",
    "가구 배치까지 도와주셔서 정말 편했어요.",
    "작은 원룸 이사인데도 정성껏 해주셔서 감사했습니다.",
    "사무실 이사였는데 업무에 지장 없게 빠르게 처리해주셨어요.",
  ];

  let reviewCount = 0;

  for (let batch = 0; batch < REVIEW_COUNT / REVIEW_BATCH_SIZE; batch++) {
    const batchPromises = [];
    for (let i = 0; i < REVIEW_BATCH_SIZE; i++) {
      batchPromises.push(
        prisma.review.create({
          data: {
            driver_id: drivers[randomInt(0, drivers.length - 1)].id,
            user_id: regularUsers[randomInt(0, regularUsers.length - 1)].id,
            review_title: randomElement(reviewTitles),
            review_content: randomElement(reviewContents),
            rating: randomInt(3, 5),
          },
        })
      );
    }
    await Promise.all(batchPromises);
    reviewCount += REVIEW_BATCH_SIZE;
    process.stdout.write(
      `\r   Progress: ${reviewCount}/${REVIEW_COUNT} reviews created`
    );
  }
  console.log(`\n✅ Created ${reviewCount} random reviews`);

  // ========== 인기 기사 리뷰 생성 ==========
  console.log(
    `\n🌟 Creating reviews for ${POPULAR_DRIVER_COUNT} popular drivers (${REVIEWS_PER_DRIVER} reviews each)...`
  );

  const popularDrivers = drivers.slice(0, POPULAR_DRIVER_COUNT);
  let popularReviewCount = 0;

  for (const driver of popularDrivers) {
    const batchPromises = [];
    for (let i = 0; i < REVIEWS_PER_DRIVER; i++) {
      batchPromises.push(
        prisma.review.create({
          data: {
            driver_id: driver.id,
            user_id: regularUsers[randomInt(0, regularUsers.length - 1)].id,
            review_title: randomElement(reviewTitles),
            review_content: randomElement(reviewContents),
            rating: randomInt(3, 5),
          },
        })
      );
    }
    await Promise.all(batchPromises);
    popularReviewCount += REVIEWS_PER_DRIVER;
    process.stdout.write(
      `\r   Progress: ${popularReviewCount}/${
        POPULAR_DRIVER_COUNT * REVIEWS_PER_DRIVER
      } reviews created`
    );
  }
  console.log(`\n✅ Created ${popularReviewCount} reviews for popular drivers`);

  // 총 리뷰 수 업데이트
  reviewCount += popularReviewCount;

  // ========== Likes 생성 ==========
  console.log("\n❤️  Creating likes...");
  const likeSet = new Set<string>();
  let likeCount = 0;

  while (likeCount < LIKE_COUNT) {
    const driverId = drivers[randomInt(0, drivers.length - 1)].id;
    const userId = regularUsers[randomInt(0, regularUsers.length - 1)].id;
    const key = `${driverId}-${userId}`;

    if (!likeSet.has(key)) {
      likeSet.add(key);
      await prisma.like.create({
        data: { driver_id: driverId, user_id: userId },
      });
      likeCount++;
    }
  }
  console.log(`✅ Created ${likeCount} likes`);

  // ========== FavoriteDrivers 생성 ==========
  console.log("\n⭐ Creating favorite drivers...");
  const favSet = new Set<string>();
  let favCount = 0;

  while (favCount < FAVORITE_COUNT) {
    const driverId = drivers[randomInt(0, drivers.length - 1)].id;
    const userId = regularUsers[randomInt(0, regularUsers.length - 1)].id;
    const key = `${driverId}-${userId}`;

    if (!favSet.has(key)) {
      favSet.add(key);
      await prisma.favoriteDriver.create({
        data: { driver_id: driverId, user_id: userId },
      });
      favCount++;
    }
  }
  console.log(`✅ Created ${favCount} favorite drivers`);

  // ========== 최종 통계 ==========
  console.log("\n" + "=".repeat(50));
  console.log("📊 SEEDING SUMMARY");
  console.log("=".repeat(50));
  console.log(`👤 Regular Users: ${regularUsers.length}`);
  console.log(`🚗 Driver Users: ${driverUsers.length}`);
  console.log(`🚚 Drivers: ${drivers.length}`);
  console.log(`🛠️  Services: ${serviceCount}`);
  console.log(`📍 Regions: ${regionCount}`);
  console.log(`📋 Requests: ${requests.length}`);
  console.log(`💰 Estimates: ${estimateCount}`);
  console.log(`⭐ Reviews: ${reviewCount}`);
  console.log(`❤️  Likes: ${likeCount}`);
  console.log(`⭐ Favorites: ${favCount}`);
  console.log("=".repeat(50));
  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
