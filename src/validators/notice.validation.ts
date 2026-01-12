import { z } from "zod";
import { PAGINATION } from "../constants/pagenation";

export const noticeListDto = z.object({
  query: z.object({
    userId: z.string().min(1).optional(),
    page: z
      .coerce.number()
      .int()
      .min(PAGINATION.DEFAULT_PAGE)
      .default(PAGINATION.DEFAULT_PAGE),
    pageSize: z
      .coerce.number()
      .int()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE),
    isDelete: z
      .union([z.literal("true"), z.literal("false")])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
  }),
});

export const noticeReadDto = z.object({
  params: z.object({
    id: z.coerce.number().int(),
  }),
});

export const noticeReadAllDto = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type NoticeListPayload = z.infer<typeof noticeListDto>["query"];
export type NoticeListDto = Omit<NoticeListPayload, "userId">;

export type NoticeReadPayload = z.infer<typeof noticeReadDto>["params"];
export type NoticeReadDto = { noticeId: number };
export type NoticeReadAllPayload = z.infer<typeof noticeReadAllDto>["params"];
export type NoticeReadAllDto = { userId: string };
