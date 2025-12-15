import { Category, RegionType } from "@prisma/client";
import { z } from "zod";
import { PAGINATION } from "../../../constants/pagenation";

export type DriverRequestSort = "soonest" | "recent";

export interface DriverRequestListQuery {
  page: number;
  pageSize: number;
  movingType?: Category;
  region?: RegionType;
  isDesignated?: boolean;
  sort: DriverRequestSort;
}

export interface DriverDesignatedListQuery extends DriverRequestListQuery {
  requestId?: number;
  isDesignated?: true;
}

const sortEnum = z.enum(["soonest", "recent"]);

export const driverRequestListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(PAGINATION.DEFAULT_PAGE).default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.coerce.number().int().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
    movingType: z.nativeEnum(Category).optional(),
    region: z.nativeEnum(RegionType).optional(),
    isDesignated: z.union([z.literal("true"), z.literal("false")]).optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    sort: sortEnum.default("soonest"),
  }),
});

export const driverDesignatedRequestListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(PAGINATION.DEFAULT_PAGE).default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.coerce.number().int().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
    movingType: z.nativeEnum(Category).optional(),
    region: z.nativeEnum(RegionType).optional(),
    requestId: z.coerce.number().int().optional(),
    sort: sortEnum.default("soonest"),
  }),
});
