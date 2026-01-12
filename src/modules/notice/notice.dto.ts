import { NoticeType } from "@prisma/client";

export type NoticeAudience = "USER" | "DRIVER";

export type NoticeItem = {
  noticeId: string;
  audience: NoticeAudience;
  noticeType: NoticeType;
  title: string;
  content: string;
  noticeDate: Date;
  requestId?: number;
  estimateId?: number;
  movingDate?: Date;
  daysUntil?: number;
  requesterName?: string;
  requesterId?: string;
  driverName?: string;
  driverId?: number;
};

export type NoticeListResult = {
  items: NoticeItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
