import prisma from "../../config/db";
import { EstimateStatus } from "@prisma/client";

interface FindReviewsParams {
  driverId?: number;
  userId?: string;
}

interface FindWritableReviewsParams {
  userId: string;
}

async function findReviews({ driverId, userId }: FindReviewsParams) {
  return prisma.review.findMany({
    where: {
      driver_id: driverId,
      user_id: userId,
    },
    orderBy: { createdAt: "desc" },
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

async function findWritableReviews({ userId }: FindWritableReviewsParams) {
  const now = new Date();

  return prisma.estimate.findMany({
    where: {
      status: EstimateStatus.ACCEPTED,
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

export default {
  findReviews,
  findWritableReviews,
};
