import prisma from "../../config/db";

import type { Prisma } from "../../generated/prisma";

/**
 * 기사님 리스트 조회
 * @returns 기사님 목록
 */
async function getMovers() {
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
async function searchMoversByNickname(nickname: string) {
  return prisma.driver.findMany({
    where: {
      nickname: {
        contains: nickname, // 포함하는 닉네임 검색
        mode: "insensitive", // 대소문자 구분 없이 검색
      },
      isDelete: false,
    },
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
