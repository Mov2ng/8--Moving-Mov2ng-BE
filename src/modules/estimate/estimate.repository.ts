import prisma from "../../config/db";

import type { PostEstimateDTO } from "./estimate.dto";

/**
 * 견적 생성
 * @param estimate 견적 정보
 * @param userId 사용자 ID
 * @returns 견적 정보
 */
function postEstimate(estimate: PostEstimateDTO, userId: string) {
  return prisma.request.create({
    data: {
      user_id: userId,
      moving_type: estimate.movingType,
      moving_data: estimate.movingDate,
      origin: estimate.origin,
      destination: estimate.destination,
    },
  });
}

/**
 * 현재 활성화된 견적 조회
 * @param userId 사용자 ID
 * @returns 견적 정보
 */
function getActiveEstimate(userId: string) {
  return prisma.request.findFirst({
    where: {
      user_id: userId,
      moving_data: {
        gte: new Date(), // gte :	greater than or equal (>=)	현재 이상
      },
    },
  });
}

/**
 * 기사님 지정 견적 요청 생성
 * @param driverId 기사님 ID
 * @param requestId 견적 요청 ID
 * @returns 견적 요청 정보
 */
function postRequestEstimate(driverId: number, requestId: number) {
  return prisma.estimate.create({
    data: {
      driver_id: driverId,
      request_id: requestId,
      status: "PENDING",
      price: 0, // 임시 0원 설정
      isRequest: true,
    },
  });
}

/**
 * 기사님 지정 견적 요청 조회
 * @param requestId 견적 요청 ID
 * @returns 견적 요청 정보
 */
function getSpecificEstimate(requestId: number) {
  return prisma.estimate.findMany({
    where: {
      request_id: requestId,
    },
  });
}

export default {
  postEstimate,
  getActiveEstimate,
  postRequestEstimate,
  getSpecificEstimate,
};
