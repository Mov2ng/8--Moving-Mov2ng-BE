import prisma from "../../config/db";

import type { Prisma } from "../../generated/prisma";

interface GetMoversParams {
  where: Prisma.DriverWhereInput;
  orderBy: Prisma.DriverOrderByWithRelationInput;
  take: number;
  cursor?: number;
  skip: number;
  userId?: string; // 현재 사용자 ID (즐겨찾기 여부 확인용)
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
  where,
  orderBy,
  take,
  cursor,
  skip,
  userId,
}: GetMoversParams) {
  return prisma.driver.findMany({
    where,
    orderBy: [orderBy, { id: "desc" }],
    take,
    skip,
    cursor: cursor ? { id: cursor } : undefined,
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

export default {
  getMovers,
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
};
