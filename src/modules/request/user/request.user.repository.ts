import prisma from "../../../config/db";
import { EstimateStatus, Prisma } from "../../../generated/prisma";

export const quoteInclude = {
  request: true,
  driver: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
        },
      },
      review: {
        select: {
          rating: true,
        },
      },
      likes: {
        select: { id: true },
      },
      estimates: {
        where: { status: EstimateStatus.ACCEPTED },
        select: { id: true },
      },
      _count: {
        select: {
          review: true,
          likes: true,
        },
      },
    },
  },
} satisfies Prisma.estimateInclude;

export type QuoteWithDriver = Prisma.estimateGetPayload<{
  include: typeof quoteInclude;
}>;

interface FindReceivedQuotesParams {
  userId: string;
  requestId?: number;
  status?: EstimateStatus;
}

/**
 * 특정 사용자가 등록한 요청에 대해 받은 견적 목록 조회
 */
async function findReceivedQuotes({
  userId,
  requestId,
  status,
}: FindReceivedQuotesParams) {
  const requestFilter = requestId
    ? { user_id: userId, id: requestId }
    : { user_id: userId };

  const statusFilter = status ? { status } : {};

  return prisma.estimate.findMany({
    where: {
      request: requestFilter,
      ...statusFilter,
    },
    orderBy: { createdAt: "desc" },
    include: quoteInclude,
  });
}

export default {
  findReceivedQuotes,
};
