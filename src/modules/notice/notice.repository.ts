import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import { SORT_ORDER } from "../../constants/pagenation";

export type NoticeUser = Prisma.UserGetPayload<{
  include: { driver: { where: { isDelete: boolean } } };
}> | null;

export type NoticeUserRequest = Prisma.RequestGetPayload<{
  include: {
    estimates: {
      orderBy: Prisma.estimateOrderByWithRelationInput[];
      include: {
        driver: {
          include: { user: true };
        };
      };
    };
  };
}>;

export type DriverEstimateWithRequest = Prisma.estimateGetPayload<{
  include: {
    request: { include: { user: true } };
    driver: { include: { user: true } };
  };
}>;

export type NoticeRecord = Prisma.NoticeGetPayload<{}>;

async function findActiveUser(userId: string): Promise<NoticeUser> {
  return prisma.user.findFirst({
    where: { id: userId, isDelete: false },
    include: { driver: { where: { isDelete: false } } },
  });
}

async function findUserRequestsWithEstimates(
  userId: string
): Promise<NoticeUserRequest[]> {
  return prisma.request.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: SORT_ORDER.DESC },
    include: {
      estimates: {
        orderBy: [{ createdAt: SORT_ORDER.DESC }],
        include: {
          driver: { include: { user: true } },
        },
      },
    },
  });
}

async function findUpcomingRequest(userId: string): Promise<NoticeUserRequest | null> {
  return prisma.request.findFirst({
    where: {
      user_id: userId,
      moving_data: { gte: new Date() },
    },
    orderBy: { moving_data: SORT_ORDER.ASC },
    include: {
      estimates: {
        orderBy: [{ createdAt: SORT_ORDER.DESC }],
        include: {
          driver: { include: { user: true } },
        },
      },
    },
  });
}

async function findDriverEstimates(
  driverId: number
): Promise<DriverEstimateWithRequest[]> {
  return prisma.estimate.findMany({
    where: { driver_id: driverId },
    orderBy: { createdAt: SORT_ORDER.DESC },
    include: {
      request: { include: { user: true } },
      driver: { include: { user: true } },
    },
  });
}

async function findNoticesByUser(params: {
  userId: string;
  isDelete?: boolean;
}): Promise<NoticeRecord[]> {
  return prisma.notice.findMany({
    where: {
      user_id: params.userId,
      ...(params.isDelete !== undefined && { isDelete: params.isDelete }),
    },
    orderBy: { createdAt: SORT_ORDER.DESC },
  });
}

async function createNotice(params: {
  userId: string;
  noticeType: Prisma.NoticeCreateInput["notice_type"];
  title: string;
  content: string;
}): Promise<NoticeRecord> {
  return prisma.notice.create({
    data: {
      user_id: params.userId,
      notice_type: params.noticeType,
      notice_title: params.title,
      notice_content: params.content,
    },
  });
}

async function markNoticeRead(params: {
  userId: string;
  noticeId: number;
}): Promise<NoticeRecord | null> {
  const existing = await prisma.notice.findFirst({
    where: { id: params.noticeId, user_id: params.userId },
  });
  if (!existing) return null;

  return prisma.notice.update({
    where: { id: params.noticeId },
    data: { isDelete: true },
  });
}

async function markAllNoticesRead(params: {
  userId: string;
}): Promise<{ count: number }> {
  const result = await prisma.notice.updateMany({
    where: { user_id: params.userId, isDelete: false },
    data: { isDelete: true },
  });
  return { count: result.count };
}

const noticeRepository = {
  findActiveUser,
  findUserRequestsWithEstimates,
  findUpcomingRequest,
  findDriverEstimates,
  findNoticesByUser,
  createNotice,
  markNoticeRead,
  markAllNoticesRead,
};

export default noticeRepository;
