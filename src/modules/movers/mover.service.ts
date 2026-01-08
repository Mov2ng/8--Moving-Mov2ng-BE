import moverRepository from "./mover.repository";

import type { MoverListQueryDTO, MoverSortType } from "./mover.dto";

// Raw Query가 필요한 정렬 타입
const RAW_QUERY_SORT_TYPES = ["rating", "confirm"] as const;
type RawQuerySortType = (typeof RAW_QUERY_SORT_TYPES)[number];

function isRawQuerySort(sort?: string): sort is RawQuerySortType {
  return RAW_QUERY_SORT_TYPES.includes(sort as RawQuerySortType);
}

/**
 * 기사님 목록 조회 (통합 함수)
 * - rating, confirm 정렬: Raw Query 사용 (계산 기반 정렬)
 * - 그 외 정렬: Prisma ORM 사용
 */
async function getMovers(query: MoverListQueryDTO, userId?: string) {
  // Raw Query가 필요한 정렬인지 확인
  if (isRawQuerySort(query.sort)) {
    return getMoversWithRawQuery(query, userId, query.sort);
  }

  // Prisma ORM 사용
  return getMoversWithPrisma(query, userId);
}

/**
 * Prisma ORM을 사용한 기사님 조회
 */
async function getMoversWithPrisma(query: MoverListQueryDTO, userId?: string) {
  const drivers = await moverRepository.getMovers({
    keyword: query.keyword,
    region: query.region,
    service: query.service,
    sortBy: query.sort,
    take: query.limit ?? 20,
    cursor: query.cursor ?? undefined,
    skip: query.cursor ? 1 : 0,
    userId,
  });

  return drivers.map((driver) => formatPrismaDriver(driver));
}

/**
 * Raw Query를 사용한 기사님 조회 (계산 기반 정렬) - 평균평점, 확정견적갯수
 */
async function getMoversWithRawQuery(
  query: MoverListQueryDTO,
  userId: string | undefined,
  sortBy: RawQuerySortType
) {
  const drivers = await moverRepository.getMoversByRawQuery({
    keyword: query.keyword,
    region: query.region,
    service: query.service,
    take: query.limit ?? 20,
    cursor: query.cursor,
    userId,
    sortBy,
  });

  return drivers.map((driver) => formatRawQueryDriver(driver));
}

/**
 * Prisma 결과 포맷팅
 */
function formatPrismaDriver(
  driver: Awaited<ReturnType<typeof moverRepository.getMovers>>[number]
) {
  const ratings = driver.review.map((r) => r.rating);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

  return {
    id: driver.id,
    nickname: driver.nickname,
    driverYears: driver.driver_years,
    driverIntro: driver.driver_intro,
    driverContent: driver.driver_content,
    createdAt: driver.createdAt,
    serviceCategories: driver.user.service.map((s) => s.category),
    regions: driver.user.region.map((r) => r.region),
    rating: Math.round(averageRating * 10) / 10,
    reviewCount: driver._count.review,
    favoriteCount: driver._count.favoriteDriver,
    confirmCount: driver._count.estimates,
    isFavorite: driver.favoriteDriver
      ? driver.favoriteDriver.length > 0
      : false,
  };
}

/**
 * Raw Query 결과 포맷팅
 */
function formatRawQueryDriver(
  driver: Awaited<
    ReturnType<typeof moverRepository.getMoversByRawQuery>
  >[number]
) {
  return {
    id: driver.id,
    nickname: driver.nickname,
    driverYears: driver.driverYears,
    driverIntro: driver.driverIntro,
    driverContent: driver.driverContent,
    createdAt: driver.createdAt,
    serviceCategories: driver.serviceCategories,
    regions: driver.regions,
    rating: Math.round(driver.ratingAvg * 10) / 10,
    reviewCount: driver.reviewCount,
    favoriteCount: driver.favoriteCount,
    confirmCount: driver.confirmCount,
    isFavorite: driver.isFavorite,
  };
}

/**
 * 기사님 상세 조회 - 전체 데이터
 * (직접 URL 접근 또는 캐시 없는 경우 사용)
 */
async function getMoverDetailFull(id: number, userId?: string) {
  const driver = await moverRepository.getMoverDetailFull(id, userId);
  if (!driver) return null;

  const ratings = driver.review.map((r) => r.rating);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

  return {
    id: driver.id,
    nickname: driver.nickname,
    driverYears: driver.driver_years,
    driverIntro: driver.driver_intro,
    driverContent: driver.driver_content,
    createdAt: driver.createdAt,
    // 서비스 카테고리 목록
    serviceCategories: driver.user.service.map((s) => s.category),
    // 지역 목록
    regions: driver.user.region.map((r) => r.region),
    // 평균 평점 (소수점 1자리)
    rating: Math.round(averageRating * 10) / 10,
    // 리뷰 개수
    reviewCount: driver._count.review,
    // 즐겨찾기 개수
    favoriteCount: driver._count.favoriteDriver,
    // 확정 견적 개수
    confirmCount: driver._count.estimates,
    // 현재 사용자의 즐겨찾기 여부
    isFavorite: driver.favoriteDriver
      ? driver.favoriteDriver.length > 0
      : false,
    // 전체 리뷰 목록
    reviews: driver.review.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.review_title,
      content: r.review_content,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
      },
    })),
  };
}

/**
 * 기사님 상세 조회 - 추가 데이터만
 * (리스트에서 이미 기본 정보를 가져온 경우 사용)
 */
async function getMoverDetailExtra(id: number) {
  const driver = await moverRepository.getMoverDetailExtra(id);
  if (!driver) return null;

  return {
    // 캐시 검증용
    id: driver.id,
    updatedAt: driver.updatedAt,
    // 리스트에서 안 보낸 추가 정보
    driverContent: driver.driver_content,
    // 전체 리뷰 목록
    reviews: driver.review.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.review_title,
      content: r.review_content,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
      },
    })),
  };
}

/**
 * 기사님 즐겨찾기 생성
 * @param driverId 기사님 ID
 * @param userId 유저 ID
 * @returns 기사님 즐겨찾기 정보
 */
async function createMoverFavorite(driverId: number, userId: string) {
  return moverRepository.createMoverFavorite(driverId, userId);
}

/**
 * 기사님 즐겨찾기 삭제
 * @param driverId 기사님 ID
 * @param userId 유저 ID
 * @returns 기사님 즐겨찾기 정보
 */
async function deleteMoverFavorite(driverId: number, userId: string) {
  return moverRepository.deleteMoverFavorite(driverId, userId);
}

async function getFavoriteDrivers(userId: string) {
  const favorites = await moverRepository.getFavoriteDriversByUser(userId);

  return favorites
    .map((fav) => fav.driver)
    .filter(
      (driver): driver is NonNullable<typeof driver> =>
        driver !== null && driver !== undefined
    )
    .map((driver) => {
      const ratings = driver.review.map((r: { rating: number }) => r.rating);
      const ratingCount = ratings.length;
      const averageRating =
        ratingCount > 0
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratingCount
          : 0;

      const categories = driver.user.service.map(
        (s: { category: string }) => s.category
      );

      return {
        id: driver.id,
        nickname: driver.nickname,
        careerYears: driver.driver_years,
        rating: Math.round(averageRating * 10) / 10,
        ratingCount,
        confirmedCount: driver._count.estimates,
        favoriteCount: driver._count.favoriteDriver,
        category: categories[0] ?? null,
        isFavorite: true,
      };
    });
}

export default {
  getMovers,
  getMoverDetailFull,
  getMoverDetailExtra,
  createMoverFavorite,
  getFavoriteDrivers,
  deleteMoverFavorite,
};
