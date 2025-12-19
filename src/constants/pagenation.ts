import { Prisma } from "@prisma/client";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
} as const;

export const SORT_ORDER: Record<"ASC" | "DESC", Prisma.SortOrder> = {
  ASC: "asc",
  DESC: "desc",
};
