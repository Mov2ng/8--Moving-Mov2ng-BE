import { EstimateStatus, NoticeType, Role } from "@prisma/client";
import ApiError from "../../core/http/ApiError";
import {
  HTTP_CODE,
  HTTP_MESSAGE,
  HTTP_STATUS,
} from "../../constants/http";
import { PAGINATION } from "../../constants/pagenation";
import { NoticeItem, NoticeListResult } from "./notice.dto";
import noticeRepository, { type NoticeRecord } from "./notice.repository";
import {
  NoticeListDto,
  NoticeReadDto,
  NoticeReadAllDto,
} from "../../validators/notice.validation";

function normalizePagination(filters: NoticeListDto) {
  const page =
    filters.page === undefined || filters.page < PAGINATION.DEFAULT_PAGE
      ? PAGINATION.DEFAULT_PAGE
      : filters.page;
  const pageSize =
    filters.pageSize === undefined || filters.pageSize < PAGINATION.MIN_PAGE_SIZE
      ? PAGINATION.DEFAULT_PAGE_SIZE
      : Math.min(filters.pageSize, PAGINATION.MAX_PAGE_SIZE);
  return { page, pageSize };
}

function calculateDaysUntil(targetDate?: Date, base: Date = new Date()) {
  if (!targetDate) return undefined;
  const diff = targetDate.getTime() - base.getTime();
  if (diff < 0) return undefined;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function paginate(items: NoticeItem[], page: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = pageSize === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    totalItems,
    totalPages,
  };
}

async function syncNotices(userId: string, items: NoticeItem[]) {
  const existing = await noticeRepository.findNoticesByUser({ userId });
  const existingKeys = new Set(
    existing.map(
      (notice) =>
        `${notice.notice_type}|${notice.notice_title}|${notice.notice_content}`
    )
  );

  for (const item of items) {
    const key = `${item.noticeType}|${item.title}|${item.content}`;
    if (existingKeys.has(key)) continue;

    await noticeRepository.createNotice({
      userId,
      noticeType: item.noticeType,
      title: item.title,
      content: item.content,
    });
    existingKeys.add(key);
  }
}

function mapNoticeRecord(
  notice: NoticeRecord,
  audience: "USER" | "DRIVER"
): NoticeItem {
  return {
    noticeId: String(notice.id),
    audience,
    noticeType: notice.notice_type,
    title: notice.notice_title,
    content: notice.notice_content,
    noticeDate: notice.createdAt,
  };
}

async function getUserNotices(
  userId: string,
  filters: NoticeListDto
): Promise<NoticeListResult> {
  const user = await noticeRepository.findActiveUser(userId);
  if (!user || user.role !== Role.USER) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  const { page, pageSize } = normalizePagination(filters);
  const now = new Date();
  const requests = await noticeRepository.findUserRequestsWithEstimates(userId);

  const items: NoticeItem[] = [];

  requests.forEach((request) => {
    request.estimates.forEach((estimate) => {
      if (estimate.status === EstimateStatus.PENDING) {
        items.push({
          noticeId: `request-${request.id}-estimate-${estimate.id}-pending`,
          audience: "USER",
          noticeType: NoticeType.NEW_ORDER,
          title: "새로운 견적이 도착했습니다",
          content: `${estimate.driver?.user.name ?? "이사 기사"}님이 견적을 보냈습니다.`,
          noticeDate: estimate.createdAt,
          requestId: request.id,
          estimateId: estimate.id,
          movingDate: request.moving_data,
          daysUntil: calculateDaysUntil(request.moving_data, now),
          driverName: estimate.driver?.user.name,
          driverId: estimate.driver?.id,
        });
      }

      if (estimate.status === EstimateStatus.ACCEPTED) {
        items.push({
          noticeId: `request-${request.id}-estimate-${estimate.id}-accepted`,
          audience: "USER",
          noticeType: NoticeType.ORDER_ACCSESS,
          title: "견적이 확정되었습니다",
          content: `${estimate.driver?.user.name ?? "이사 기사"}님과 이사 일정이 확정되었습니다.`,
          noticeDate: estimate.updatedAt ?? estimate.createdAt,
          requestId: request.id,
          estimateId: estimate.id,
          movingDate: request.moving_data,
          daysUntil: calculateDaysUntil(request.moving_data, now),
          driverName: estimate.driver?.user.name,
          driverId: estimate.driver?.id,
        });
      }
    });

    const daysUntilMove = calculateDaysUntil(request.moving_data, now);
    if (daysUntilMove !== undefined) {
      items.push({
        noticeId: `request-${request.id}-moving-day`,
        audience: "USER",
        noticeType: NoticeType.MOVE_TIME,
        title: "이사 일정 알림",
        content: `${daysUntilMove}일 후 이사 일정이 예정되어 있습니다.`,
        noticeDate: request.moving_data,
        requestId: request.id,
        movingDate: request.moving_data,
        daysUntil: daysUntilMove,
      });
    }
  });

  const sorted = items.sort(
    (a, b) => b.noticeDate.getTime() - a.noticeDate.getTime()
  );
  await syncNotices(userId, sorted);

  const notices = await noticeRepository.findNoticesByUser({
    userId,
    isDelete: filters.isDelete,
  });
  const mapped = notices.map((notice) => mapNoticeRecord(notice, "USER"));
  const { items: pagedItems, totalItems, totalPages } = paginate(
    mapped,
    page,
    pageSize
  );

  return {
    items: pagedItems,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

async function getDriverNotices(
  userId: string,
  filters: NoticeListDto
): Promise<NoticeListResult> {
  const driverUser = await noticeRepository.findActiveUser(userId);
  const driverProfile = driverUser?.driver?.[0];

  if (!driverUser || driverUser.role !== Role.DRIVER || !driverProfile) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      HTTP_MESSAGE.FORBIDDEN,
      HTTP_CODE.FORBIDDEN
    );
  }

  const { page, pageSize } = normalizePagination(filters);
  const now = new Date();
  const estimates = await noticeRepository.findDriverEstimates(driverProfile.id);

  const items: NoticeItem[] = [];

  estimates.forEach((estimate) => {
    const requesterName = estimate.request?.user?.name ?? "고객";
    const daysUntilMove = calculateDaysUntil(estimate.request?.moving_data, now);

    if (estimate.status === EstimateStatus.PENDING) {
      items.push({
        noticeId: `driver-${driverProfile.id}-estimate-${estimate.id}-pending`,
        audience: "DRIVER",
        noticeType: NoticeType.NEW_ORDER,
        title: "새로운 견적 요청",
        content: `${requesterName}님이 새 견적을 요청했습니다.`,
        noticeDate: estimate.createdAt,
        requestId: estimate.request?.id,
        estimateId: estimate.id,
        movingDate: estimate.request?.moving_data,
        daysUntil: daysUntilMove,
        requesterName,
        requesterId: estimate.request?.user_id,
        driverName: driverUser.name,
        driverId: driverProfile.id,
      });
    }

    if (estimate.status === EstimateStatus.ACCEPTED) {
      items.push({
        noticeId: `driver-${driverProfile.id}-estimate-${estimate.id}-accepted`,
        audience: "DRIVER",
        noticeType: NoticeType.ORDER_ACCSESS,
        title: "견적이 확정되었습니다",
        content: `${requesterName}님이 견적을 확정했습니다.`,
        noticeDate: estimate.updatedAt ?? estimate.createdAt,
        requestId: estimate.request?.id,
        estimateId: estimate.id,
        movingDate: estimate.request?.moving_data,
        daysUntil: daysUntilMove,
        requesterName,
        requesterId: estimate.request?.user_id,
        driverName: driverUser.name,
        driverId: driverProfile.id,
      });
    }
  });

  const sorted = items.sort(
    (a, b) => b.noticeDate.getTime() - a.noticeDate.getTime()
  );
  await syncNotices(userId, sorted);

  const notices = await noticeRepository.findNoticesByUser({
    userId,
    isDelete: filters.isDelete,
  });
  const mapped = notices.map((notice) => mapNoticeRecord(notice, "DRIVER"));
  const { items: pagedItems, totalItems, totalPages } = paginate(
    mapped,
    page,
    pageSize
  );

  return {
    items: pagedItems,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

async function markNoticeRead(
  userId: string,
  body: NoticeReadDto
) {
  const user = await noticeRepository.findActiveUser(userId);
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  const updated = await noticeRepository.markNoticeRead({
    userId,
    noticeId: body.noticeId,
  });
  if (!updated) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  return updated;
}

async function markAllNoticesRead(
  userId: string,
  _body: NoticeReadAllDto
) {
  const user = await noticeRepository.findActiveUser(userId);
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  return noticeRepository.markAllNoticesRead({ userId });
}

const noticeService = {
  getUserNotices,
  getDriverNotices,
  markNoticeRead,
  markAllNoticesRead,
};

export default noticeService;
