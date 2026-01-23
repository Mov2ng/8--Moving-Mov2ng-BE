import prisma from "../../config/db";
import { EstimateStatus } from "@prisma/client";

interface FindReviewsParams {
  driverId?: number;
  userId?: string;
  userIdForQuotes?: string; // 내가 받은 견적의 기사만 조회할 때 사용
}

interface FindWritableReviewsParams {
  userId: string;
}

interface CreateReviewParams {
  userId: string;
  driverId: number;
  rating: number;
  review_title?: string;
  review_content?: string;
}

async function findExistingReview(userId: string, driverId: number) {
  return prisma.review.findFirst({
    where: { user_id: userId, driver_id: driverId, isDelete: false },
  });
}

async function hasAcceptedEstimatePast(userId: string, driverId: number) {
  const now = new Date();
  return prisma.estimate.findFirst({
    where: {
      status: EstimateStatus.COMPLETED,
      driver_id: driverId,
      request: { user_id: userId, moving_data: { lt: now } },
    },
  });
}

async function findReviews({
  driverId,
  userId,
  userIdForQuotes,
}: FindReviewsParams) {
  return prisma.review.findMany({
    where: {
      driver_id: driverId,
      user_id: userId,
      driver: userIdForQuotes
        ? {
            estimates: {
              some: {
                request: { user_id: userIdForQuotes },
              },
            },
          }
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      driver: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone_number: true },
          },
          estimates: {
            where: {
              status: EstimateStatus.ACCEPTED,
              request:
                userId !== undefined
                  ? { user_id: userId }
                  : userIdForQuotes !== undefined
                  ? { user_id: userIdForQuotes }
                  : undefined,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              price: true,
              status: true,
              request: {
                select: { id: true, moving_type: true, moving_data: true },
              },
            },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true, phone_number: true },
      },
    },
  });
}

async function findWritableReviews({ userId }: FindWritableReviewsParams) {
  const now = new Date();

  return prisma.estimate.findMany({
    where: {
      status: EstimateStatus.COMPLETED,
      request: {
        user_id: userId,
        moving_data: { lt: now },
      },
      driver: {
        review: {
          none: {
            user_id: userId,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      request: true,
      driver: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone_number: true },
          },
        },
      },
    },
  });
}

async function createReview({
  userId,
  driverId,
  rating,
  review_content,
  review_title,
}: CreateReviewParams) {
  return prisma.review.create({
    data: {
      user_id: userId,
      driver_id: driverId,
      rating,
      review_content,
      review_title,
    },
    include: {
      driver: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone_number: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true, phone_number: true },
      },
    },
  });
}

export default {
  findReviews,
  findWritableReviews,
  findExistingReview,
  hasAcceptedEstimatePast,
  createReview,
};
