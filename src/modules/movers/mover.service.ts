import moverRepository from "./mover.repository";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";

import type { MoverListQueryDTO, MoverSortType } from "./mover.dto";

// Raw Query가 필요한 정렬 타입
const RAW_QUERY_SORT_TYPES = ["rating", "confirm"] as const;
type RawQuerySortType = (typeof RAW_QUERY_SORT_TYPES)[number];

function isRawQuerySort(sort?: string): sort is RawQuerySortType {
  return RAW_QUERY_SORT_TYPES.includes(sort as RawQuerySortType);
}

// 페이지네이션 응답 타입
interface PaginatedResponse<T> {
  list: T[];
  hasNext: boolean;
  nextCursor: number | null;
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
async function getMoversWithPrisma(
  query: MoverListQueryDTO,
  userId?: string
): Promise<PaginatedResponse<ReturnType<typeof formatPrismaDriver>>> {
  const limit = query.limit ?? 20;

  // 1개 더 조회해서 다음 페이지 존재 여부 확인
  const drivers = await moverRepository.getMovers({
    keyword: query.keyword,
    region: query.region,
    service: query.service,
    sortBy: query.sort,
    take: limit + 1, // 1개 더 조회
    cursor: query.cursor ?? undefined,
    skip: query.cursor ? 1 : 0,
    userId,
  });

  // 다음 페이지 존재 여부 확인
  const hasNext = drivers.length > limit;

  // 실제 반환할 데이터 (limit 개수만큼)
  const resultDrivers = hasNext ? drivers.slice(0, limit) : drivers;

  // 다음 커서 (마지막 아이템의 id)
  const nextCursor = hasNext ? drivers[limit].id : null;

  return {
    list: resultDrivers.map((driver) => formatPrismaDriver(driver)),
    hasNext,
    nextCursor,
  };
}

/**
 * Raw Query를 사용한 기사님 조회 (계산 기반 정렬) - 평균평점, 확정견적갯수
 */
async function getMoversWithRawQuery(
  query: MoverListQueryDTO,
  userId: string | undefined,
  sortBy: RawQuerySortType
): Promise<PaginatedResponse<ReturnType<typeof formatRawQueryDriver>>> {
  const limit = query.limit ?? 20;

  // 1개 더 조회해서 다음 페이지 존재 여부 확인
  const drivers = await moverRepository.getMoversByRawQuery({
    keyword: query.keyword,
    region: query.region,
    service: query.service,
    take: limit + 1, // 1개 더 조회
    cursor: query.cursor,
    userId,
    sortBy,
  });

  // 다음 페이지 존재 여부 확인
  const hasNext = drivers.length > limit;

  // 실제 반환할 데이터 (limit 개수만큼)
  const resultDrivers = hasNext ? drivers.slice(0, limit) : drivers;

  // 다음 커서 (마지막 아이템의 id)
  const nextCursor = hasNext ? drivers[limit].id : null;

  return {
    list: resultDrivers.map((driver) => formatRawQueryDriver(driver)),
    hasNext,
    nextCursor,
  };
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
 * 기사님 본인 정보 조회 (마이페이지용)
 * @param userId 현재 로그인한 사용자 ID
 * @returns 기사님 본인의 상세 정보 (리뷰 포함)
 * @description driverOnlyMiddleware에서 이미 Driver 레코드 존재 여부를 체크하므로
 *              여기서는 항상 driver가 존재함을 보장받음
 */
async function getMyMoverDetail(userId: string) {
  // user_id로 driver 찾기 (경량화)
  const driver = await moverRepository.findDriverByUserId(userId);
  if (!driver) {
    // 이론적으로는 발생하지 않지만, 방어적 체크
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "기사님 프로필을 먼저 등록해주세요.",
      HTTP_CODE.FORBIDDEN
    );
  }

  // driver id로 상세 정보 조회 (본인이므로 userId 전달)
  return getMoverDetailFull(driver.id, userId);
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
  getMyMoverDetail,
  createMoverFavorite,
  getFavoriteDrivers,
  deleteMoverFavorite,
};
