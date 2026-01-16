import prisma from "../../../config/db";
import { EstimateStatus, Prisma } from "@prisma/client";

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
      favoriteDriver: {
        where: {
          isDelete: false,
        },
        select: {
          user_id: true,
        },
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
  completedOnly?: boolean;
}

interface FindPendingQuoteDetailParams {
  userId: string;
  estimateId: number;
}

interface AcceptQuoteParams {
  userId: string;
  estimateId: number;
}

interface FindQuoteDetailParams {
  userId: string;
  estimateId: number;
}

/**
 * 특정 사용자가 등록한 요청에 대해 받은 견적 목록 조회
 */
async function findReceivedQuotes({
  userId,
  requestId,
  status,
  completedOnly,
}: FindReceivedQuotesParams) {
  const requestFilter = requestId
    ? { user_id: userId, id: requestId }
    : { user_id: userId };

  const statusFilter = status ? { status } : {};
  const completedFilter =
    completedOnly === true
      ? {
          request: {
            ...requestFilter,
            moving_data: { lt: new Date() },
          },
        }
      : { request: requestFilter };

  return prisma.estimate.findMany({
    where: {
      ...completedFilter,
      ...statusFilter,
    },
    orderBy: { createdAt: "desc" },
    include: quoteInclude,
  });
}

/**
 * 견적 상세 조회
 */
async function findPendingQuoteDetail({
  userId,
  estimateId,
}: FindPendingQuoteDetailParams) {
  return prisma.estimate.findFirst({
    where: {
      id: estimateId,
      status: EstimateStatus.PENDING,
      request: { user_id: userId },
    },
    include: quoteInclude,
  });
}

async function acceptQuote({ userId, estimateId }: AcceptQuoteParams) {
  // 소유/상태 조회
  const quote = await prisma.estimate.findFirst({
    where: {
      id: estimateId,
      request: { user_id: userId },
    },
    include: quoteInclude,
  });

  if (!quote) return null;

  if (quote.status !== EstimateStatus.PENDING) return quote;

  return prisma.estimate.update({
    where: { id: estimateId },
    data: { status: EstimateStatus.ACCEPTED, updatedAt: new Date() },
    include: quoteInclude,
  });
}

async function findQuoteDetail({ userId, estimateId }: FindQuoteDetailParams) {
  return prisma.estimate.findFirst({
    where: {
      id: estimateId,
      request: { user_id: userId },
    },
    include: quoteInclude,
  });
}

export default {
  findReceivedQuotes,
  findPendingQuoteDetail,
  acceptQuote,
  findQuoteDetail,
};
