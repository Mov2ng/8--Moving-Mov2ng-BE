import { Category, RegionType } from "@prisma/client";
import { z } from "zod";
import { PAGINATION } from "../constants/pagenation";

const sortEnum = z.enum(["soonest", "recent"]);

export const driverRequestListDto = z.object({
  query: z.object({
    userId: z.string().min(1),
    page: z.coerce.number().int().min(PAGINATION.DEFAULT_PAGE).default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.coerce.number().int().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
    requestId: z.coerce.number().int().optional(),
    movingType: z.nativeEnum(Category).optional(),
    region: z.nativeEnum(RegionType).optional(),
    isDesignated: z.union([z.literal("true"), z.literal("false")]).optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    sort: sortEnum.default("soonest"),
  }),
});

export const driverDesignatedRequestListDto = z.object({
  query: z.object({
    userId: z.string().min(1),
    page: z.coerce.number().int().min(PAGINATION.DEFAULT_PAGE).default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.coerce.number().int().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
    movingType: z.nativeEnum(Category).optional(),
    region: z.nativeEnum(RegionType).optional(),
    requestId: z.coerce.number().int().optional(),
    sort: sortEnum.default("soonest"),
  }),
});

export const driverEstimateAcceptDto = z.object({
  body: z.object({
    userId: z.string().min(1),
    requestId: z.coerce.number().int(),
    requestReason: z.string().min(1),
    price: z.coerce.number().int().positive(),
  }),
});

export const driverEstimateRejectDto = z.object({
  body: z.object({
    userId: z.string().min(1),
    requestId: z.coerce.number().int(),
    requestReason: z.string().min(1),
  }),
});

export const driverEstimateUpdateDto = z.object({
  body: z.discriminatedUnion("status", [
    z.object({
      userId: z.string().min(1),
      requestId: z.coerce.number().int(),
      status: z.literal("ACCEPTED"),
      requestReason: z.string().min(1),
      price: z.coerce.number().int().positive(),
    }),
    z.object({
      userId: z.string().min(1),
      requestId: z.coerce.number().int(),
      status: z.literal("REJECTED"),
      requestReason: z.string().min(1),
    }),
  ]),
});

export const driverRequestDeleteDto = z.object({
  body: z.object({
    userId: z.string().min(1),
    requestId: z.coerce.number().int(),
  }),
});

export const driverRejectedEstimateListDto = z.object({
  query: z.object({
    userId: z.string().min(1),
    page: z.coerce.number().int().min(PAGINATION.DEFAULT_PAGE).default(PAGINATION.DEFAULT_PAGE),
    pageSize: z
      .coerce.number()
      .int()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE),
  }),
});

export type DriverRequestSort = z.infer<typeof sortEnum>;

export type DriverRequestListPayload = z.infer<typeof driverRequestListDto>["query"];

export type DriverRequestListDto = Omit<
  DriverRequestListPayload,
  "userId" | "isDesignated"
> & {
  isDesignated?: boolean;
};

export type DriverDesignatedListPayload =
  z.infer<typeof driverDesignatedRequestListDto>["query"];

export type DriverDesignatedListDto = Omit<
  DriverDesignatedListPayload,
  "userId"
> & {
  isDesignated?: true;
};

export type DriverEstimateAcceptPayload =
  z.infer<typeof driverEstimateAcceptDto>["body"];
export type DriverEstimateRejectPayload =
  z.infer<typeof driverEstimateRejectDto>["body"];
export type DriverEstimateUpdatePayload =
  z.infer<typeof driverEstimateUpdateDto>["body"];
export type DriverRequestDeletePayload =
  z.infer<typeof driverRequestDeleteDto>["body"];

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type DriverEstimateAcceptDto = Omit<DriverEstimateAcceptPayload, "userId">;
export type DriverEstimateRejectDto = Omit<DriverEstimateRejectPayload, "userId">;
export type DriverEstimateUpdateDto = DistributiveOmit<
  DriverEstimateUpdatePayload,
  "userId"
>;
export type DriverRequestDeleteDto = Omit<DriverRequestDeletePayload, "userId">;

export type DriverRejectedEstimateListPayload =
  z.infer<typeof driverRejectedEstimateListDto>["query"];
export type DriverRejectedEstimateListDto = Omit<
  DriverRejectedEstimateListPayload,
  "userId"
>;
