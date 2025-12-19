import moverRepository from "./mover.repository";

import type { MoverListQueryDTO, MoverSortType } from "./mover.dto";
import { Prisma } from "../../generated/prisma";

async function getMovers(query: MoverListQueryDTO, userId?: string) {
  // 조회 조건 정리는 service에서 진행
  const where: Prisma.DriverWhereInput = {
    isDelete: false,
  };

  if (query.keyword) {
    where.OR = [{ nickname: { contains: query.keyword } }];
  }

  // Driver → User → Region/Service 관계를 통해 필터링
  if (query.region || query.service) {
    where.user = {};

    if (query.region) {
      where.user.region = {
        some: { region: query.region },
      };
    }

    if (query.service) {
      where.user.service = {
        some: { category: query.service },
      };
    }
  }

  const orderBy = getOrderBy(query.sort);

  const drivers = await moverRepository.getMovers({
    where,
    orderBy,
    take: query.limit ?? 20,
    cursor: query.cursor ?? undefined,
    skip: query.cursor ? 1 : 0,
    userId, // 즐겨찾기 여부 확인용
  });

  // 데이터 가공: 평균 평점 계산 및 응답 형식 변환
  return drivers.map((driver) => {
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
    };
  });
}

function getOrderBy(
  sort?: MoverSortType
): Prisma.DriverOrderByWithRelationInput {
  switch (sort) {
    case "rating":
      // TODO: 평균 평점 column 추가
      // 평점 높은순: 리뷰 개수로 대체 (평균 평점 정렬은 raw query 필요)
      return { review: { _count: "desc" } };
    case "review":
      // 리뷰 많은순
      return { review: { _count: "desc" } };
    case "career":
      // 경력 높은순
      return { driver_years: "desc" };
    case "confirm":
      // TODO: 확정 많은순 column 추가
      // 확정 많은순 (견적 개수 기준)
      return { estimates: { _count: "desc" } };
    default:
      return { createdAt: "desc" };
  }
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

export default {
  getMovers,
  getMoverDetailFull,
  getMoverDetailExtra,
  createMoverFavorite,
  deleteMoverFavorite,
};
