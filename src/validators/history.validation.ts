import { z } from "zod";
import { PAGINATION } from "../constants/pagenation";

export const historyListDto = z.object({
  query: z.object({
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
  }),
});

export const historyDetailDto = z.object({
  params: z.object({
    id: z.coerce.number().int(),
  }),
});

export type HistoryListPayload = z.infer<typeof historyListDto>["query"];
export type HistoryListDto = HistoryListPayload;
export type HistoryDetailPayload = z.infer<typeof historyDetailDto>["params"];
export type HistoryDetailDto = HistoryDetailPayload;
