import prisma from "../../config/db";

import type { Prisma } from "../../generated/prisma";
import type { MoverListQueryDTO } from "./mover.dto";

/**
 * 기사님 리스트 조회
 * @param nickname 검색할 닉네임
 * @param region 검색할 지역
 * @param service_category 검색할 서비스 카테고리
 * @param sort 정렬 기준
 * @param cursor 커서
 * @param limit 페이지 크기
 * @returns 기사님 목록
 */
async function getMovers({ keyword, region, service, sort, cursor, limit }: MoverListQueryDTO) {
  return prisma.driver.findMany({
    where: {
      isDelete: false,
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
    }
  });
}

/**
 * 기사님 상세 조회
 * @param id 기사님 ID
 * @returns 기사님 정보
 */
async function getMoverById(id: string) {
  return prisma.driver.findUnique({
    where: { id: Number(id) },
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
  getMoverById,
  createMover,
  updateMover,
};
