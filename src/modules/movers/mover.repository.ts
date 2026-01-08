import prisma from "../../config/db";

import type { Prisma } from "@prisma/client";
import type { Category, RegionType } from "@prisma/client";

interface GetMoversParams {
  keyword?: string;
  region?: RegionType;
  service?: Category;
  sortBy?: string;
  take: number;
  cursor?: number;
  skip?: number;
  userId?: string;
}

// Raw Query 정렬 타입
type RawQuerySortType = "rating" | "confirm";

// Raw Query 결과 타입
interface MoverRawResult {
  id: number;
  user_id: string;
  nickname: string;
  driver_years: number | null;
  driver_intro: string | null;
  driver_content: string | null;
  createdAt: Date;
  rating_avg: number;
  review_count: bigint;
  favorite_count: bigint;
  confirm_count: bigint;
}

/**
 * 기사님 리스트 조회 (모든 관련 정보 포함)
 * @param where 검색 조건
 * @param orderBy 정렬 기준
 * @param take 페이지 크기
 * @param cursor 커서
 * @param skip 건너뛸 개수
 * @param userId 현재 사용자 ID (즐겨찾기 여부 확인용)
 * @returns 기사님 목록 (서비스, 지역, 리뷰, 견적, 즐겨찾기 포함)
 */
async function getMovers({
  keyword,
  region,
  service,
  sortBy,
  take,
  cursor,
  skip,
  userId,
}: GetMoversParams) {
  // WHERE 조건 동적 생성
  const where: Prisma.DriverWhereInput = {
    isDelete: false,
  };

  if (keyword) {
    where.nickname = { contains: keyword };
  }

  if (region) {
    where.user = { region: { some: { region: region } } };
  }

  if (service) {
    where.user = { service: { some: { category: service } } };
  }

  // sortBy에 따른 정렬 조건 생성
  const getOrderBy = (sort?: string): Prisma.DriverOrderByWithRelationInput => {
    switch (sort) {
      case "review":
        // 리뷰 많은순
        return { review: { _count: "desc" } };
      case "career":
        // 경력 높은순
        return { driver_years: "desc" };
      default:
        // 기본: 최신순
        return { createdAt: "desc" };
    }
  };

  const orderBy = getOrderBy(sortBy);

  return prisma.driver.findMany({
    where,
    orderBy,
    take,
    cursor: cursor ? { id: cursor } : undefined,
    skip,
    include: {
      // 유저의 서비스, 지역 정보
      user: {
        select: {
          service: {
            where: { isDelete: false },
            select: { category: true },
          },
          region: {
            where: { isDelete: false },
            select: { region: true },
          },
        },
      },
      // 평점 계산을 위한 리뷰 목록
      review: {
        where: { isDelete: false },
        select: { rating: true },
      },
      // 현재 사용자의 즐겨찾기 여부 확인
      favoriteDriver: userId
        ? {
            where: { user_id: userId, isDelete: false },
            select: { id: true },
            take: 1,
          }
        : false,
      // 개수 집계
      _count: {
        select: {
          review: true,
          favoriteDriver: true,
          estimates: true,
        },
      },
    },
  });
}

/**
 * 기사님 리스트 조회 - Raw Query 정렬 (rating, confirm)
 * @param params 검색/필터/페이지네이션 파라미터
 * @param sortBy 정렬 기준 (rating: 평균 평점순, confirm: 확정 견적순)
 * @returns 기사님 목록
 */
async function getMoversByRawQuery({
  keyword,
  region,
  service,
  take,
  cursor,
  userId,
  sortBy = "rating",
}: GetMoversParams) {
  // WHERE 조건 동적 생성
  const conditions: string[] = ['d."isDelete" = false'];

  if (keyword) {
    conditions.push(`d."nickname" ILIKE '%${keyword}%'`);
  }

  if (region) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM "Region" reg 
        WHERE reg."user_id" = d."user_id" 
        AND reg."region" = '${region}' 
        AND reg."isDelete" = false
      )
    `);
  }

  if (service) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM "Service" srv 
        WHERE srv."user_id" = d."user_id" 
        AND srv."category" = '${service}' 
        AND srv."isDelete" = false
      )
    `);
  }

  // 커서 조건은 정렬 기준에 따라 다르게 적용
  if (cursor) {
    if (sortBy === "rating") {
      conditions.push(`(
        COALESCE((SELECT AVG(r.rating) FROM "Review" r WHERE r.driver_id = d.id AND r."isDelete" = false), 0) < (
          SELECT COALESCE(AVG(r2.rating), 0) FROM "Review" r2 WHERE r2.driver_id = ${cursor} AND r2."isDelete" = false
        )
        OR (
          COALESCE((SELECT AVG(r.rating) FROM "Review" r WHERE r.driver_id = d.id AND r."isDelete" = false), 0) = (
            SELECT COALESCE(AVG(r2.rating), 0) FROM "Review" r2 WHERE r2.driver_id = ${cursor} AND r2."isDelete" = false
          )
          AND d.id < ${cursor}
        )
      )`);
    } else if (sortBy === "confirm") {
      conditions.push(`(
        (SELECT COUNT(*) FROM "estimate" e2 WHERE e2.driver_id = d.id AND e2.status = 'ACCEPTED') < (
          SELECT COUNT(*) FROM "estimate" e3 WHERE e3.driver_id = ${cursor} AND e3.status = 'ACCEPTED'
        )
        OR (
          (SELECT COUNT(*) FROM "estimate" e2 WHERE e2.driver_id = d.id AND e2.status = 'ACCEPTED') = (
            SELECT COUNT(*) FROM "estimate" e3 WHERE e3.driver_id = ${cursor} AND e3.status = 'ACCEPTED'
          )
          AND d.id < ${cursor}
        )
      )`);
    }
  }

  const whereClause = conditions.join(" AND ");

  // 정렬 기준에 따라 ORDER BY 변경
  const orderByClause =
    sortBy === "rating"
      ? "rating_avg DESC, d.id DESC"
      : "confirm_count DESC, d.id DESC";

  const query = `
    SELECT 
      d."id",
      d."user_id",
      d."nickname",
      d."driver_years",
      d."driver_intro",
      d."driver_content",
      d."createdAt",
      COALESCE(AVG(r.rating), 0) as rating_avg,
      COUNT(DISTINCT r.id) as review_count,
      COUNT(DISTINCT fd.id) as favorite_count,
      COUNT(DISTINCT CASE WHEN e.status = 'ACCEPTED' THEN e.id END) as confirm_count
    FROM "Driver" d
    LEFT JOIN "Review" r ON d.id = r.driver_id AND r."isDelete" = false
    LEFT JOIN "FavoriteDriver" fd ON d.id = fd.driver_id AND fd."isDelete" = false
    LEFT JOIN "estimate" e ON d.id = e.driver_id
    WHERE ${whereClause}
    GROUP BY d.id
    ORDER BY ${orderByClause}
    LIMIT ${take}
  `;

  const drivers = await prisma.$queryRawUnsafe<MoverRawResult[]>(query);

  // 각 기사님의 추가 정보 조회 (서비스, 지역, 즐겨찾기 여부)
  const driverIds = drivers.map((d) => d.id);

  if (driverIds.length === 0) return [];

  // 서비스 정보 조회
  const services = await prisma.service.findMany({
    where: {
      user_id: { in: drivers.map((d) => d.user_id) },
      isDelete: false,
    },
    select: { user_id: true, category: true },
  });

  // 지역 정보 조회
  const regions = await prisma.region.findMany({
    where: {
      user_id: { in: drivers.map((d) => d.user_id) },
      isDelete: false,
    },
    select: { user_id: true, region: true },
  });

  // 즐겨찾기 여부 조회 (로그인한 경우)
  let userFavorites: number[] = [];
  if (userId) {
    const favorites = await prisma.favoriteDriver.findMany({
      where: {
        driver_id: { in: driverIds },
        user_id: userId,
        isDelete: false,
      },
      select: { driver_id: true },
    });
    userFavorites = favorites.map((f) => f.driver_id);
  }

  // 데이터 조합
  return drivers.map((driver) => ({
    id: driver.id,
    userId: driver.user_id,
    nickname: driver.nickname,
    driverYears: driver.driver_years,
    driverIntro: driver.driver_intro,
    driverContent: driver.driver_content,
    createdAt: driver.createdAt,
    ratingAvg: Number(driver.rating_avg),
    reviewCount: Number(driver.review_count),
    favoriteCount: Number(driver.favorite_count),
    confirmCount: Number(driver.confirm_count),
    serviceCategories: services
      .filter((s) => s.user_id === driver.user_id)
      .map((s) => s.category),
    regions: regions
      .filter((r) => r.user_id === driver.user_id)
      .map((r) => r.region),
    isFavorite: userFavorites.includes(driver.id),
  }));
}

/**
 * 닉네임으로 기사님 검색 (부분 일치)
 * @param nickname 검색할 닉네임
 * @returns 기사님 목록
 */
async function searchMoversByNickname(keyword: string) {
  return prisma.driver.findMany({
    where: {
      nickname: {
        contains: keyword, // 포함하는 키워드 검색
        mode: "insensitive", // 대소문자 구분 없이 검색
      },
      isDelete: false,
    },
  });
}

/**
 * 기사님 상세 조회 - 전체 데이터
 * (직접 URL 접근 또는 캐시 없는 경우 사용)
 * @param id 기사님 ID
 * @param userId 현재 사용자 ID (즐겨찾기 여부 확인용)
 * @returns 기사님 전체 정보
 */
async function getMoverDetailFull(id: number, userId?: string) {
  return prisma.driver.findUnique({
    where: { id, isDelete: false },
    select: {
      // 기본 정보
      id: true,
      nickname: true,
      driver_years: true,
      driver_intro: true,
      driver_content: true,
      createdAt: true,
      // 유저의 서비스, 지역 정보
      user: {
        select: {
          service: {
            where: { isDelete: false },
            select: { category: true },
          },
          region: {
            where: { isDelete: false },
            select: { region: true },
          },
        },
      },
      // 전체 리뷰 목록
      review: {
        where: { isDelete: false },
        select: {
          id: true,
          rating: true,
          review_title: true,
          review_content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      // 현재 사용자의 즐겨찾기 정보 (id 포함)
      favoriteDriver: userId
        ? {
            where: { user_id: userId, isDelete: false },
            select: { id: true },
            take: 1,
          }
        : false,
      // 개수 집계
      _count: {
        select: {
          review: true,
          favoriteDriver: true,
          estimates: true,
        },
      },
    },
  });
}

/**
 * 기사님 상세 조회 - 추가 데이터만
 * (리스트에서 이미 기본 정보를 가져온 경우 사용)
 * @param id 기사님 ID
 * @param userId 현재 사용자 ID (즐겨찾기 여부 확인용)
 * @returns 리스트에 없는 추가 정보만
 */
async function getMoverDetailExtra(id: number) {
  return prisma.driver.findUnique({
    where: { id, isDelete: false },
    select: {
      // 식별용 (캐시 검증)
      id: true,
      updatedAt: true,
      // 리스트에서 안 보낸 추가 정보
      driver_content: true,
      // 전체 리뷰 목록 (리스트에서는 rating만 보냄)
      review: {
        where: { isDelete: false },
        select: {
          id: true,
          rating: true,
          review_title: true,
          review_content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * 기사님 즐겨찾기 생성
 * @param driver_id 기사님 ID
 * @param user_id 유저 ID
 * @returns 기사님 즐겨찾기 정보
 */
async function createMoverFavorite(driver_id: number, user_id: string) {
  return prisma.favoriteDriver.create({
    data: { driver_id, user_id },
  });
}

/**
 * 기사님 즐겨찾기 삭제
 * @param driverId 기사님 ID
 * @param userId 유저 ID
 * @returns 삭제된 즐겨찾기 개수
 */
async function deleteMoverFavorite(driverId: number, userId: string) {
  return prisma.favoriteDriver.deleteMany({
    where: { driver_id: driverId, user_id: userId },
  });
}

/**
 * 기사님 확정 견적 개수 조회
 * @param id 기사님 ID
 * @returns 확정 견적 개수
 */
async function getMoverEstimateCount(id: number) {
  return prisma.estimate.count({
    where: {
      driver_id: id,
      status: "ACCEPTED",
    },
  });
}

/**
 * 기사님 즐겨찾기 개수 조회
 * @param id 기사님 ID
 * @returns 즐겨찾기 개수
 */
async function getMoverFavoriteCount(id: number) {
  return prisma.favoriteDriver.count({
    where: { driver_id: id, isDelete: false },
  });
}

/**
 * 기사님 평점 조회
 * @param id 기사님 ID
 * @returns 평점
 */
async function getMoverRating(id: number) {
  const result = await prisma.review.aggregate({
    where: { driver_id: id },
    _avg: { rating: true }, // 평점 평균
    _count: { _all: true }, // 리뷰 개수
  });

  return {
    rating: result._avg.rating,
    reviewCount: result._count._all ?? 0,
  };
}

/**
 * 기사님 서비스 조회
 * @param userId 기사님 유저 ID
 * @returns 서비스 목록
 */
async function getMoverService(userId: string) {
  return prisma.service.findMany({
    where: { user_id: userId },
  });
}

/**
 * 기사님 생성
 * @param mover 기사님 정보
 * @returns 기사님 정보
 */
async function createMover(mover: Prisma.DriverCreateInput) {
  return prisma.driver.create({
    data: mover,
  });
}

/**
 * 기사님 수정
 * @param id 기사님 ID
 * @param mover 기사님 정보
 * @returns 기사님 정보
 */
async function updateMover(id: string, mover: Prisma.DriverUpdateInput) {
  return prisma.driver.update({
    where: { id: Number(id) },
    data: mover,
  });
}

async function getFavoriteDriversByUser(userId: string) {
  return prisma.favoriteDriver.findMany({
    where: { user_id: userId, isDelete: false },
    orderBy: { id: "desc" },
    include: {
      driver: {
        include: {
          user: {
            select: {
              service: {
                where: { isDelete: false },
                select: { category: true },
              },
            },
          },
          review: {
            where: { isDelete: false },
            select: { rating: true },
          },
          _count: {
            select: {
              review: true,
              favoriteDriver: true,
              estimates: true,
            },
          },
        },
      },
    },
  });
}

// 기존 호환성을 위한 래퍼 함수
async function getMoversByRating(params: Omit<GetMoversParams, "sortBy">) {
  return getMoversByRawQuery({ ...params, sortBy: "rating" });
}

async function getMoversByConfirm(params: Omit<GetMoversParams, "sortBy">) {
  return getMoversByRawQuery({ ...params, sortBy: "confirm" });
}

export default {
  getMovers,
  getMoversByRating,
  getMoversByConfirm,
  getMoversByRawQuery,
  searchMoversByNickname,
  getMoverDetailFull,
  getMoverDetailExtra,
  createMoverFavorite,
  deleteMoverFavorite,
  getMoverEstimateCount,
  getMoverFavoriteCount,
  getMoverRating,
  getMoverService,
  createMover,
  updateMover,
  getFavoriteDriversByUser,
};
